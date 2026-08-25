import { Prisma } from '@prisma/client';
import { db } from '@/db/client';

export async function getNextSequenceNumber(
  type: 'INQUIRY' | 'CLIENT' | 'PROFORMA',
  tx?: Prisma.TransactionClient,
  year: number = new Date().getFullYear()
): Promise<string> {
  const client = tx || db;
  const counterId = type === 'PROFORMA' ? `PROFORMA_${year}` : type;

  const counter = await client.sequenceCounter.upsert({
    where: { id: counterId },
    update: { currentValue: { increment: 1 } },
    create: { id: counterId, currentValue: 1 },
  });

  const padded = String(counter.currentValue).padStart(4, '0');

  switch (type) {
    case 'INQUIRY':
      return `#INQ-${padded}`;
    case 'CLIENT':
      return `#CL-${padded}`;
    case 'PROFORMA':
      return `PI-${year}-${padded}`;
    default:
      return `${type}-${padded}`;
  }
}
