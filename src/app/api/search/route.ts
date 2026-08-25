import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import { getSession } from '@/lib/auth/session';

export async function GET(request: Request) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim() || '';

  if (!q) {
    return NextResponse.json({ success: true, data: [] });
  }

  try {
    const [inquiries, clients, services, proformas] = await Promise.all([
      db.inquiry.findMany({
        where: {
          OR: [
            { companyName: { contains: q, mode: 'insensitive' } },
            { contactName: { contains: q, mode: 'insensitive' } },
            { inquiryNumber: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 5,
        select: { id: true, inquiryNumber: true, companyName: true, status: true },
      }),
      db.client.findMany({
        where: {
          OR: [
            { companyName: { contains: q, mode: 'insensitive' } },
            { contactName: { contains: q, mode: 'insensitive' } },
            { clientNumber: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 5,
        select: { id: true, clientNumber: true, companyName: true, status: true },
      }),
      db.service.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { code: { contains: q, mode: 'insensitive' } },
            { category: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 5,
        select: { id: true, code: true, name: true, category: true },
      }),
      db.proforma.findMany({
        where: {
          proformaNumber: { contains: q, mode: 'insensitive' },
        },
        take: 5,
        select: { id: true, proformaNumber: true, totalAmount: true, currency: true, status: true },
      }),
    ]);

    const results = [
      ...inquiries.map((i) => ({
        id: i.id,
        type: 'INQUIRY' as const,
        title: `${i.inquiryNumber} • ${i.companyName}`,
        subtitle: `Status: ${i.status}`,
        status: i.status,
        link: `/inquiries/${i.id}`,
      })),
      ...clients.map((c) => ({
        id: c.id,
        type: 'CLIENT' as const,
        title: `${c.clientNumber} • ${c.companyName}`,
        subtitle: `Status: ${c.status}`,
        status: c.status,
        link: `/clients/${c.id}`,
      })),
      ...services.map((s) => ({
        id: s.id,
        type: 'SERVICE' as const,
        title: `${s.name} (${s.code})`,
        subtitle: s.category,
        link: `/services`,
      })),
      ...proformas.map((p) => ({
        id: p.id,
        type: 'PROFORMA' as const,
        title: `Proforma ${p.proformaNumber}`,
        subtitle: `${p.currency} ${p.totalAmount} • Status: ${p.status}`,
        status: p.status,
        link: `/proformas/${p.id}`,
      })),
    ];

    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    console.error('Global search error:', error);
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR' } }, { status: 500 });
  }
}
