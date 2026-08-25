import * as React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/db/client';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatFriendlyDate } from '@/lib/dates/timezone';
import { formatCurrency } from '@/lib/utils/currency';
import { ArrowLeft, Download, Send, CheckCircle2, FileText, Mail } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ProformaDetailPage({ params }: { params: { id: string } }) {
  const proforma = await db.proforma.findUnique({
    where: { id: params.id },
    include: {
      items: true,
      inquiry: true,
      client: true,
      emailEvents: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!proforma) {
    notFound();
  }

  const recipient = proforma.client?.companyName || proforma.inquiry?.companyName || 'Corporate Client';
  const recipientEmail = proforma.client?.email || proforma.inquiry?.email || '';

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Link
          href="/proformas"
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Proformas</span>
        </Link>
      </div>

      {/* Header */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {proforma.proformaNumber}
            </h1>
            <Badge variant="proforma">{proforma.status}</Badge>
          </div>
          <div className="text-xs text-slate-500 font-medium mt-1">
            Issued to: <span className="font-semibold text-slate-700">{recipient}</span> ({recipientEmail}) •
            Date: {formatFriendlyDate(proforma.issueDate)}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`/api/proformas/${proforma.id}/pdf`}
            target="_blank"
            rel="noreferrer"
          >
            <Button variant="secondary" size="md">
              <Download className="w-4 h-4 mr-1.5" /> Download PDF
            </Button>
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* PDF Document Preview (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-lg border border-slate-200 shadow-card p-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              A4 Document Preview
            </span>
          </div>
          <div className="h-[600px] w-full border border-slate-200 rounded overflow-hidden">
            <iframe
              src={`/api/proformas/${proforma.id}/pdf`}
              className="w-full h-full border-0"
              title="PDF"
            />
          </div>
        </div>

        {/* Commercial Breakdown & Email Dispatch History (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Commercial Snapshot Card */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-card space-y-4 text-xs">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
              Commercial Snapshots
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Subtotal:</span>
                <span className="font-bold text-slate-900">{formatCurrency(proforma.subtotal, proforma.currency)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Tax Rate:</span>
                <span className="font-semibold text-slate-700">{proforma.taxRate.toString()}%</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Tax Amount:</span>
                <span className="font-bold text-slate-900">{formatCurrency(proforma.taxAmount, proforma.currency)}</span>
              </div>
              <div className="flex justify-between py-2 bg-blue-50/60 px-3 rounded font-bold text-sm text-[#0040e0]">
                <span>Grand Total:</span>
                <span>{formatCurrency(proforma.totalAmount, proforma.currency)}</span>
              </div>
            </div>
          </div>

          {/* Email Dispatch Audit */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-card space-y-4 text-xs">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
              Email Dispatch History
            </h2>
            <div className="space-y-3">
              {proforma.emailEvents.length === 0 ? (
                <div className="text-slate-400 text-center py-4">No email dispatches recorded.</div>
              ) : (
                proforma.emailEvents.map((e) => (
                  <div key={e.id} className="p-3 rounded border border-slate-200 bg-slate-50/50">
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>{e.recipient}</span>
                      <Badge variant={e.status === 'SENT' ? 'accepted' : 'actionNeeded'}>{e.status}</Badge>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">{e.subject}</div>
                    <div className="text-[10px] text-slate-400 mt-1">{formatFriendlyDate(e.createdAt)}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
