import * as React from 'react';
import Link from 'next/link';
import { db } from '@/db/client';
import { Badge } from '@/components/ui/Badge';
import { formatFriendlyDate } from '@/lib/dates/timezone';
import { formatCurrency } from '@/lib/utils/currency';
import { FileText, Download, Send } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ProformasPage() {
  const proformas = await db.proforma.findMany({
    include: {
      inquiry: true,
      client: true,
      items: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Proforma Invoices</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage, track, and dispatch formal regulatory compliance proposals.</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Proforma #</th>
                <th className="py-3 px-4">Client / Inquiry</th>
                <th className="py-3 px-4">Issue Date</th>
                <th className="py-3 px-4">Valid Until</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {proformas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No proformas found. Generate a proposal from an inquiry or client page.
                  </td>
                </tr>
              ) : (
                proformas.map((p) => {
                  const recipient = p.client?.companyName || p.inquiry?.companyName || 'Corporate Client';
                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-[#0040e0]">
                        <Link href={`/proformas/${p.id}`} className="hover:underline">
                          {p.proformaNumber}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">{recipient}</td>
                      <td className="py-3.5 px-4 text-slate-600">{formatFriendlyDate(p.issueDate)}</td>
                      <td className="py-3.5 px-4 text-slate-600">{formatFriendlyDate(p.validUntil)}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{formatCurrency(p.totalAmount, p.currency)}</td>
                      <td className="py-3.5 px-4">
                        <Badge variant="proforma">{p.status}</Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-3">
                        <Link
                          href={`/proformas/${p.id}`}
                          className="text-xs font-semibold text-[#0040e0] hover:underline"
                        >
                          View
                        </Link>
                        <a
                          href={`/api/proformas/${p.id}/pdf`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
                        >
                          <Download className="w-3.5 h-3.5" /> PDF
                        </a>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
