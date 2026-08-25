import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import { getSession } from '@/lib/auth/session';
import { encryptString } from '@/lib/crypto/encryption';
import { AuditService } from '@/server/services/AuditService';
import { AuditAction, AuditEntityType } from '@prisma/client';

export async function GET() {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  }

  try {
    const settings = await db.companySettings.findUnique({
      where: { id: 'default' },
      select: {
        id: true,
        companyName: true,
        brandTagline: true,
        email: true,
        phone: true,
        address: true,
        taxId: true,
        currency: true,
        defaultTaxRate: true,
        companyTimezone: true,
        isSmtpConfigured: true,
        renewalReminderDays: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error('Settings query error:', error);
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR' } }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const user = await getSession();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: { code: 'FORBIDDEN', message: 'Admin role required' } }, { status: 403 });
  }

  try {
    const body = await request.json();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {
      companyName: body.companyName,
      brandTagline: body.brandTagline,
      email: body.email,
      phone: body.phone,
      address: body.address,
      taxId: body.taxId,
      currency: body.currency,
      defaultTaxRate: body.defaultTaxRate !== undefined ? Number(body.defaultTaxRate) : undefined,
      companyTimezone: body.companyTimezone,
      renewalReminderDays: body.renewalReminderDays,
    };

    // Encrypt SMTP password if provided
    if (body.smtpHost && body.smtpUser && body.smtpPass) {
      const smtpPayload = JSON.stringify({
        host: body.smtpHost,
        port: body.smtpPort || 587,
        user: body.smtpUser,
        pass: body.smtpPass,
        from: body.smtpFrom || body.email,
      });
      updateData.smtpEncryptedConfig = encryptString(smtpPayload);
      updateData.isSmtpConfigured = true;
    }

    const updated = await db.companySettings.upsert({
      where: { id: 'default' },
      update: updateData,
      create: {
        id: 'default',
        ...updateData,
      },
      select: {
        id: true,
        companyName: true,
        brandTagline: true,
        email: true,
        phone: true,
        address: true,
        taxId: true,
        currency: true,
        defaultTaxRate: true,
        companyTimezone: true,
        isSmtpConfigured: true,
        renewalReminderDays: true,
        updatedAt: true,
      },
    });

    await AuditService.log({
      userId: user.id,
      action: AuditAction.SETTINGS_UPDATED,
      entityType: AuditEntityType.SETTINGS,
      entityId: 'default',
      description: 'Company settings and security configuration updated',
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Settings update failed';
    return NextResponse.json({ success: false, error: { code: 'ERROR', message } }, { status: 400 });
  }
}
