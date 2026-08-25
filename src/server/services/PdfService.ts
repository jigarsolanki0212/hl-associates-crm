import { db } from '@/db/client';
import { formatCurrency } from '@/lib/utils/currency';
import { formatFriendlyDate } from '@/lib/dates/timezone';

export class PdfService {
  static async generateProformaHtml(proformaId: string): Promise<string> {
    const proforma = await db.proforma.findUnique({
      where: { id: proformaId },
      include: {
        items: true,
        client: true,
        inquiry: true,
      },
    });

    if (!proforma) {
      throw new Error(`Proforma ${proformaId} not found`);
    }

    const companySettings = await db.companySettings.findUnique({
      where: { id: 'default' },
    });

    const companyName = companySettings?.companyName || 'HL Associates';
    const companyAddress = companySettings?.address || '100 Compliance Tower, Nariman Point, Mumbai 400021';
    const companyTaxId = companySettings?.taxId || 'GSTIN-27AABCH1234F1Z5';
    const companyEmail = companySettings?.email || 'contact@hlassociates.com';
    const companyPhone = companySettings?.phone || '+91 (022) 2842-1933';

    const clientName = proforma.client?.companyName || proforma.inquiry?.companyName || 'Valued Client';
    const contactName = proforma.client?.contactName || proforma.inquiry?.contactName || 'Authorized Signatory';
    const clientEmail = proforma.client?.email || proforma.inquiry?.email || '';
    const clientPhone = proforma.client?.phone || proforma.inquiry?.phone || '';

    const currency = proforma.currency;
    const subtotalFormatted = formatCurrency(proforma.subtotal, currency);
    const taxFormatted = formatCurrency(proforma.taxAmount, currency);
    const totalFormatted = formatCurrency(proforma.totalAmount, currency);

    const itemsHtml = proforma.items
      .map(
        (item, index) => `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 12px; font-size: 13px; color: #64748b;">${index + 1}</td>
          <td style="padding: 12px;">
            <div style="font-weight: 600; color: #041627; font-size: 13px;">${item.serviceNameSnapshot}</div>
            <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${item.descriptionSnapshot || item.serviceScopeSnapshot || ''}</div>
          </td>
          <td style="padding: 12px; font-size: 13px; text-align: center; color: #041627;">${item.quantity}</td>
          <td style="padding: 12px; font-size: 13px; text-align: right; color: #041627;">${formatCurrency(item.unitPrice, currency)}</td>
          <td style="padding: 12px; font-size: 13px; text-align: right; color: #041627; font-weight: 600;">${formatCurrency(item.amount, currency)}</td>
        </tr>
      `
      )
      .join('');

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Proforma Invoice - ${proforma.proformaNumber}</title>
        <style>
          @page { size: A4; margin: 20mm; }
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            color: #041627;
            margin: 0;
            padding: 24px;
            background: #ffffff;
            line-height: 1.5;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #041627;
            padding-bottom: 20px;
            margin-bottom: 24px;
          }
          .brand-title {
            font-size: 22px;
            font-weight: 800;
            color: #041627;
            letter-spacing: -0.5px;
          }
          .brand-subtitle {
            font-size: 12px;
            color: #0040e0;
            font-weight: 600;
            margin-top: 2px;
          }
          .meta-title {
            font-size: 20px;
            font-weight: 700;
            color: #041627;
            text-align: right;
          }
          .meta-number {
            font-size: 13px;
            font-weight: 600;
            color: #0040e0;
            text-align: right;
            margin-top: 2px;
          }
          .section-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
            margin-bottom: 28px;
          }
          .box {
            background: #fbf9fa;
            border: 1px solid #e2e8f0;
            border-radius: 4px;
            padding: 16px;
          }
          .box-title {
            font-size: 11px;
            font-weight: 700;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 24px;
          }
          th {
            background: #041627;
            color: #ffffff;
            font-size: 12px;
            font-weight: 600;
            padding: 10px 12px;
            text-align: left;
          }
          .totals-table {
            width: 320px;
            margin-left: auto;
            margin-bottom: 24px;
          }
          .totals-table td {
            padding: 8px 12px;
            font-size: 13px;
          }
          .grand-total {
            background: #e5eeff;
            font-weight: 700;
            font-size: 15px;
            color: #0040e0;
          }
          .terms {
            font-size: 11px;
            color: #64748b;
            border-top: 1px solid #e2e8f0;
            padding-top: 16px;
            margin-top: 32px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand-title">${companyName}</div>
            <div class="brand-subtitle">Regulatory Compliance & Consulting Services</div>
            <div style="font-size: 11px; color: #64748b; margin-top: 6px;">
              ${companyAddress}<br/>
              Tax ID: ${companyTaxId} | Email: ${companyEmail} | Phone: ${companyPhone}
            </div>
          </div>
          <div>
            <div class="meta-title">PROFORMA INVOICE</div>
            <div class="meta-number">${proforma.proformaNumber}</div>
            <div style="font-size: 11px; color: #64748b; text-align: right; margin-top: 4px;">
              Date: ${formatFriendlyDate(proforma.issueDate)}<br/>
              Valid Until: ${formatFriendlyDate(proforma.validUntil)}
            </div>
          </div>
        </div>

        <div class="section-grid">
          <div class="box">
            <div class="box-title">Client Information</div>
            <div style="font-weight: 700; font-size: 14px; color: #041627;">${clientName}</div>
            <div style="font-size: 12px; color: #475569; margin-top: 2px;">Attn: ${contactName}</div>
            <div style="font-size: 12px; color: #475569;">Email: ${clientEmail}</div>
            <div style="font-size: 12px; color: #475569;">Phone: ${clientPhone || 'N/A'}</div>
          </div>
          <div class="box">
            <div class="box-title">Engagement Terms</div>
            <div style="font-size: 12px; color: #475569;"><strong>Currency:</strong> ${currency}</div>
            <div style="font-size: 12px; color: #475569;"><strong>Payment Terms:</strong> 50% Advance on Acceptance, 50% on Submission</div>
            <div style="font-size: 12px; color: #475569;"><strong>Applicable GST/Tax:</strong> ${proforma.taxRate}%</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 40px;">#</th>
              <th>Service & Regulatory Scope</th>
              <th style="width: 60px; text-align: center;">Qty</th>
              <th style="width: 110px; text-align: right;">Unit Price</th>
              <th style="width: 120px; text-align: right;">Total (${currency})</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <table class="totals-table">
          <tr>
            <td style="color: #64748b;">Subtotal:</td>
            <td style="text-align: right; font-weight: 600;">${subtotalFormatted}</td>
          </tr>
          <tr>
            <td style="color: #64748b;">Tax (${proforma.taxRate}%):</td>
            <td style="text-align: right; font-weight: 600;">${taxFormatted}</td>
          </tr>
          <tr class="grand-total">
            <td>Grand Total:</td>
            <td style="text-align: right;">${totalFormatted}</td>
          </tr>
        </table>

        <div class="terms">
          <strong>Terms & Conditions:</strong><br/>
          1. This proforma invoice is valid until ${formatFriendlyDate(proforma.validUntil)}.<br/>
          2. Regulatory timelines commence upon receipt of required technical dossiers and advance payment.<br/>
          3. Bank Details: HL Associates • HDFC Bank Nariman Point • A/C: 50200012345678 • IFSC: HDFC0000001
        </div>
      </body>
      </html>
    `;
  }
}
