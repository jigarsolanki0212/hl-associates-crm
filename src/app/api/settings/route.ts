import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import { getSession } from '@/lib/auth/session';
import { encryptString, decryptString } from '@/lib/crypto/encryption';
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
    });

    let smtpHost = '';
    let smtpPort = 587;
    let smtpUser = '';
    let smtpFrom = '';

    if (settings?.smtpEncryptedConfig) {
      try {
        const decrypted = decryptString(settings.smtpEncryptedConfig);
        const parsed = JSON.parse(decrypted);
        smtpHost = parsed.host || '';
        smtpPort = Number(parsed.port) || 587;
        smtpUser = parsed.user || '';
        smtpFrom = parsed.from || '';
      } catch (e) {
        console.error('Failed to decrypt SMTP in GET /api/settings:', e);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        id: settings?.id || 'default',
        companyName: settings?.companyName || 'HL Associates',
        brandTagline: settings?.brandTagline || 'Enterprise Regulatory Compliance Suite',
        email: settings?.email || 'compliance@hlassociates.com',
        phone: settings?.phone || '+91 98765 43210',
        address: settings?.address || 'Suite 400, Regulatory Tower, BKC, Mumbai 400051',
        taxId: settings?.taxId || 'GSTIN-27AABCH1234F1Z5',
        currency: settings?.currency || 'INR',
        defaultTaxRate: settings?.defaultTaxRate ?? 18,
        companyTimezone: settings?.companyTimezone || 'Asia/Kolkata',
        isSmtpConfigured: !!(settings?.isSmtpConfigured && smtpUser),
        smtpHost,
        smtpPort,
        smtpUser,
        smtpFrom,
        renewalReminderDays: settings?.renewalReminderDays || [60, 30, 7, 0],
        updatedAt: settings?.updatedAt,
      },
    });
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

    let smtpHost = body.smtpHost || '';
    let smtpPort = Number(body.smtpPort) || 587;
    let smtpUser = body.smtpUser || '';
    let smtpFrom = body.smtpFrom || body.email || '';

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
    } else if (body.smtpHost && body.smtpUser && !body.smtpPass) {
      // If user is updating other fields while keeping existing password
      const existing = await db.companySettings.findUnique({ where: { id: 'default' } });
      if (existing?.smtpEncryptedConfig) {
        try {
          const decrypted = decryptString(existing.smtpEncryptedConfig);
          const parsed = JSON.parse(decrypted);
          const smtpPayload = JSON.stringify({
            host: body.smtpHost,
            port: body.smtpPort || parsed.port || 587,
            user: body.smtpUser,
            pass: parsed.pass,
            from: body.smtpFrom || body.email || parsed.from,
          });
          updateData.smtpEncryptedConfig = encryptString(smtpPayload);
          updateData.isSmtpConfigured = true;
        } catch (e) {
          console.error('Failed to preserve existing SMTP password:', e);
        }
      }
    }

    const updated = await db.companySettings.upsert({
      where: { id: 'default' },
      update: updateData,
      create: {
        id: 'default',
        ...updateData,
      },
    });

    if (updated.smtpEncryptedConfig) {
      try {
        const decrypted = decryptString(updated.smtpEncryptedConfig);
        const parsed = JSON.parse(decrypted);
        smtpHost = parsed.host || '';
        smtpPort = Number(parsed.port) || 587;
        smtpUser = parsed.user || '';
        smtpFrom = parsed.from || '';
      } catch (e) {
        console.error('Failed to decrypt after update:', e);
      }
    }

    await AuditService.log({
      userId: user.id,
      action: AuditAction.SETTINGS_UPDATED,
      entityType: AuditEntityType.SETTINGS,
      entityId: 'default',
      description: 'Company settings and security configuration updated',
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        companyName: updated.companyName,
        brandTagline: updated.brandTagline,
        email: updated.email,
        phone: updated.phone,
        address: updated.address,
        taxId: updated.taxId,
        currency: updated.currency,
        defaultTaxRate: updated.defaultTaxRate,
        companyTimezone: updated.companyTimezone,
        isSmtpConfigured: !!(updated.isSmtpConfigured && smtpUser),
        smtpHost,
        smtpPort,
        smtpUser,
        smtpFrom,
        renewalReminderDays: updated.renewalReminderDays,
        updatedAt: updated.updatedAt,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Settings update failed';
    return NextResponse.json({ success: false, error: { code: 'ERROR', message } }, { status: 400 });
  }
}
