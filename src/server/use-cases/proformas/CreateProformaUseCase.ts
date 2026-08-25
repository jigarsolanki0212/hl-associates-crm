import { db } from '@/db/client';
import { getNextSequenceNumber } from '@/lib/sequences/sequenceGenerator';
import { AuditService } from '@/server/services/AuditService';
import { EmailService } from '@/server/services/EmailService';
import { formatCurrency } from '@/lib/utils/currency';
import {
  AuditAction,
  AuditEntityType,
  InquiryStatus,
  ProformaStatus,
} from '@prisma/client';
import { addDays } from 'date-fns';

export interface ProformaItemInput {
  serviceId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate?: number;
}

export interface CreateProformaInput {
  inquiryId?: string;
  clientId?: string;
  validityDays?: number;
  items: ProformaItemInput[];
  notes?: string;
  terms?: string;
  currency?: string;
  overrideTaxRate?: number;
}

export class CreateProformaUseCase {
  static async execute(input: CreateProformaInput, currentUserId?: string) {
    const year = new Date().getFullYear();
    const proformaNumber = await getNextSequenceNumber('PROFORMA', undefined, year);

    const companySettings = await db.companySettings.findUnique({ where: { id: 'default' } });
    const defaultCurrency = input.currency || companySettings?.currency || 'INR';
    const globalTaxRate = input.overrideTaxRate !== undefined ? input.overrideTaxRate : Number(companySettings?.defaultTaxRate || 18);

    // Calculate item totals & snapshots
    let subtotal = 0;
    let totalTax = 0;

    const preparedItems = await Promise.all(
      input.items.map(async (item) => {
        let serviceName = item.description;
        let serviceCode = 'CUSTOM';
        let serviceScope = item.description;

        if (item.serviceId) {
          const s = await db.service.findUnique({ where: { id: item.serviceId } });
          if (s) {
            serviceName = s.name;
            serviceCode = s.code;
            serviceScope = s.detailedScope || s.description;
          }
        }

        const itemTaxRate = item.taxRate !== undefined ? item.taxRate : globalTaxRate;
        const itemAmount = item.unitPrice * item.quantity;
        const itemTax = (itemAmount * itemTaxRate) / 100;

        subtotal += itemAmount;
        totalTax += itemTax;

        return {
          serviceId: item.serviceId || null,
          serviceNameSnapshot: serviceName,
          serviceCodeSnapshot: serviceCode,
          serviceScopeSnapshot: serviceScope,
          descriptionSnapshot: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          taxRate: itemTaxRate,
          amount: itemAmount,
        };
      })
    );

    const totalAmount = subtotal + totalTax;
    const validUntil = addDays(new Date(), input.validityDays || 30);

    const proforma = await db.proforma.create({
      data: {
        proformaNumber,
        inquiryId: input.inquiryId || null,
        clientId: input.clientId || null,
        status: ProformaStatus.READY,
        issueDate: new Date(),
        validUntil,
        subtotal,
        taxRate: globalTaxRate,
        taxAmount: totalTax,
        totalAmount,
        currency: defaultCurrency,
        notes: input.notes || null,
        terms: input.terms || 'Payment terms: 50% advance, 50% upon regulatory dossier completion.',
        items: {
          create: preparedItems,
        },
      },
      include: {
        items: true,
        inquiry: true,
        client: true,
      },
    });

    await AuditService.log({
      userId: currentUserId,
      action: AuditAction.PROFORMA_GENERATED,
      entityType: AuditEntityType.PROFORMA,
      entityId: proforma.id,
      inquiryId: input.inquiryId,
      clientId: input.clientId,
      afterState: proforma,
      description: `Proforma ${proforma.proformaNumber} generated amounting to ${formatCurrency(totalAmount, defaultCurrency)}`,
    });

    return proforma;
  }

  static async send(proformaId: string, currentUserId?: string, customRecipient?: string) {
    const proforma = await db.proforma.findUnique({
      where: { id: proformaId },
      include: {
        inquiry: true,
        client: true,
      },
    });

    if (!proforma) throw new Error('Proforma not found');

    const recipientEmail =
      customRecipient || proforma.inquiry?.email || proforma.client?.email;
    const companyName =
      proforma.inquiry?.companyName || proforma.client?.companyName || 'Valued Client';

    if (!recipientEmail) {
      throw new Error('No recipient email specified for proforma dispatch');
    }

    // 1. Dispatch Email via EmailService
    const totalFormatted = formatCurrency(proforma.totalAmount, proforma.currency);
    const emailResult = await EmailService.sendProformaEmail({
      proformaId: proforma.id,
      proformaNumber: proforma.proformaNumber,
      recipientEmail,
      companyName,
      totalAmountFormatted: totalFormatted,
    });

    // 2. Update Proforma Status to SENT
    const updated = await db.proforma.update({
      where: { id: proformaId },
      data: {
        status: emailResult.success ? ProformaStatus.SENT : ProformaStatus.FAILED,
      },
    });

    // 3. Update associated inquiry status to PROFORMA_SENT if applicable
    if (proforma.inquiryId) {
      await db.inquiry.update({
        where: { id: proforma.inquiryId },
        data: { status: InquiryStatus.PROFORMA_SENT },
      });
    }

    // 4. Log Audit
    await AuditService.log({
      userId: currentUserId,
      action: AuditAction.PROFORMA_SENT,
      entityType: AuditEntityType.PROFORMA,
      entityId: proforma.id,
      inquiryId: proforma.inquiryId || undefined,
      clientId: proforma.clientId || undefined,
      afterState: { status: updated.status, recipientEmail },
      description: `Proforma ${proforma.proformaNumber} sent to ${recipientEmail}`,
    });

    return updated;
  }
}
