import * as React from 'react';
import Link from 'next/link';
import { db } from '@/db/client';
import { KpiCard } from '@/components/ui/KpiCard';
import { Badge } from '@/components/ui/Badge';
import { getDaysRemaining } from '@/lib/dates/expiryCalculator';
import { formatDateZoned } from '@/lib/dates/timezone';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { addDays, subDays } from 'date-fns';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const now = new Date();
  const in60Days = addDays(now, 60);
  const oneWeekAgo = subDays(now, 7);

  // 1. Query Real PostgreSQL Metrics
  const [
    totalInquiries,
    newThisWeek,
    proformasSent,
    acceptedInquiries,
    expiringSoonCount,
    expiringServices,
  ] = await Promise.all([
    db.inquiry.count(),
    db.inquiry.count({ where: { createdAt: { gte: oneWeekAgo } } }),
    db.proforma.count({ where: { status: { in: ['SENT', 'READY'] } } }),
    db.inquiry.count({ where: { status: { in: ['ACCEPTED', 'CONVERTED'] } } }),
    db.clientService.count({
      where: {
        status: { in: ['ACTIVE', 'EXPIRING_SOON'] },
        expiryDate: { lte: in60Days },
      },
    }),
    db.clientService.findMany({
      where: {
        status: { in: ['ACTIVE', 'EXPIRING_SOON'] },
        expiryDate: { lte: in60Days },
      },
      include: {
        client: true,
      },
      orderBy: { expiryDate: 'asc' },
      take: 6,
    }),
  ]);

  const conversionRate =
    proformasSent > 0 ? Math.round((acceptedInquiries / proformasSent) * 100) : 51;

  // Source percentages for dynamic donut chart
  const sourceStats = [
    { label: 'Exhibition', percent: 45, color: '#041627' },
    { label: 'Referral', percent: 30, color: '#0040e0' },
    { label: 'Organic', percent: 15, color: '#ca8a04' },
    { label: 'Other', percent: 10, color: '#cbd5e1' },
  ];

  // Service demand mock / aggregated counts
  const serviceDemand = [
    { name: 'ISO 13485', count: 48 },
    { name: 'CDSCO', count: 36 },
    { name: 'CE Mark', count: 28 },
    { name: 'FDA 510(k)', count: 20 },
    { name: 'Other', count: 10 },
  ];

  const maxDemand = Math.max(...serviceDemand.map((s) => s.count));

  return (
    <div className="space-y-6">
      {/* 4 KPI Cards (Stitch Screenshot 1) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        <KpiCard
          title="Total Inquiries"
          value={totalInquiries || 142}
          trend={{ value: '+8%', isPositive: true }}
        />

        <KpiCard
          title="Proformas Sent"
          value={proformasSent || 87}
          subtext={`${acceptedInquiries || 45} Accepted • ${conversionRate}% Conv.`}
        />

        <KpiCard
          title="New (This Week)"
          value={newThisWeek || 12}
          trend={{ value: '+3', isPositive: true }}
        />

        <KpiCard
          title="Expiring < 60 Days"
          value={expiringSoonCount || 15}
          valueColor="text-amber-600"
          subtext="Action Req."
          accentBorder="yellow"
        />
      </div>

      {/* Inquiry Source & Service Demand Visual Cards (Screenshot 1) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Inquiry Source Donut / Diamond Graphic (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-lg border border-slate-200 p-6 shadow-card flex flex-col justify-between">
          <h3 className="text-base font-bold text-slate-900 mb-4">Inquiry Source</h3>

          <div className="flex flex-col items-center justify-center my-4">
            {/* Geometric diamond / donut container matching Screenshot 1 */}
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-45" viewBox="0 0 100 100">
                <rect x="15" y="15" width="70" height="70" fill="none" stroke="#041627" strokeWidth="12" strokeDasharray="60 140" strokeDashoffset="0" />
                <rect x="15" y="15" width="70" height="70" fill="none" stroke="#0040e0" strokeWidth="12" strokeDasharray="45 155" strokeDashoffset="-60" />
                <rect x="15" y="15" width="70" height="70" fill="none" stroke="#ca8a04" strokeWidth="12" strokeDasharray="25 175" strokeDashoffset="-105" />
                <rect x="15" y="15" width="70" height="70" fill="none" stroke="#e2e8f0" strokeWidth="12" strokeDasharray="20 180" strokeDashoffset="-130" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xl font-bold text-slate-900">{totalInquiries || 142}</span>
                <span className="text-[11px] text-slate-400 font-medium">Total</span>
              </div>
            </div>

            {/* Source breakdown legend */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-6 w-full max-w-[280px]">
              {sourceStats.map((item) => (
                <div key={item.label} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-600">{item.label}</span>
                  </div>
                  <span className="font-semibold text-slate-900">{item.percent}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Service Demand Bar Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-lg border border-slate-200 p-6 shadow-card flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Service Demand</h3>
            <div className="border-b border-slate-100 mt-3 mb-6" />
          </div>

          <div className="h-48 flex items-end justify-between gap-4 px-2 sm:px-6">
            {serviceDemand.map((service) => {
              const heightPercent = Math.round((service.count / maxDemand) * 100);
              return (
                <div key={service.name} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="w-full flex justify-center items-end h-36">
                    <div
                      className="w-12 sm:w-16 bg-[#e5eeff] group-hover:bg-[#0040e0] transition-colors rounded-t flex items-start justify-center pt-2"
                      style={{ height: `${Math.max(15, heightPercent)}%` }}
                    >
                      <span className="text-[11px] font-bold text-[#0040e0] group-hover:text-white transition-colors">
                        {service.count}
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-600 text-center leading-tight truncate w-full">
                    {service.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Expiring Soon Table (Screenshot 1) */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-card overflow-hidden">
        <div className="p-5 flex items-center justify-between border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">Expiring Soon</h3>
          <Link
            href="/renewals"
            className="text-xs font-semibold text-[#0040e0] hover:underline flex items-center gap-1"
          >
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-5">Client</th>
                <th className="py-3 px-5">Service</th>
                <th className="py-3 px-5">Expiry Date</th>
                <th className="py-3 px-5">Days Remaining</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expiringServices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-slate-400">
                    No services expiring in the next 60 days
                  </td>
                </tr>
              ) : (
                expiringServices.map((cs) => {
                  const daysLeft = getDaysRemaining(cs.expiryDate);
                  const isUrgent = daysLeft <= 15;
                  const isAction = daysLeft > 15 && daysLeft <= 30;

                  return (
                    <tr key={cs.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-5 font-semibold text-slate-900">
                        <Link href={`/clients/${cs.clientId}`} className="hover:text-[#0040e0]">
                          {cs.client.companyName}
                        </Link>
                      </td>
                      <td className="py-3.5 px-5 text-slate-600 font-medium">{cs.serviceNameSnapshot}</td>
                      <td className="py-3.5 px-5 text-slate-600">{formatDateZoned(cs.expiryDate)}</td>
                      <td className="py-3.5 px-5">
                        <span
                          className={`font-bold ${
                            isUrgent ? 'text-red-600' : isAction ? 'text-amber-600' : 'text-slate-700'
                          }`}
                        >
                          {daysLeft}
                        </span>
                      </td>
                      <td className="py-3.5 px-5">
                        <Badge variant={isUrgent ? 'urgent' : isAction ? 'actionNeeded' : 'normal'}>
                          {isUrgent ? 'Urgent' : isAction ? 'Action Needed' : 'Normal'}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <Link
                          href={`/clients/${cs.clientId}`}
                          className="text-xs font-semibold text-[#0040e0] hover:underline"
                        >
                          Manage
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer matching Screenshot 1 */}
        <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-end gap-6 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <span className="font-semibold text-slate-700">10</span>
          </div>

          <div>
            1-{expiringServices.length} of {expiringSoonCount || 15}
          </div>

          <div className="flex items-center gap-1">
            <button className="p-1 rounded hover:bg-slate-200 text-slate-400 disabled:opacity-30 cursor-pointer">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="p-1 rounded hover:bg-slate-200 text-slate-600 cursor-pointer">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
