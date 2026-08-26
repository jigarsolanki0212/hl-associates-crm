'use client';

import * as React from 'react';
import Link from 'next/link';
import { KpiCard } from '@/components/ui/KpiCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Toast, ToastMessage } from '@/components/ui/Toast';
import { getDaysRemaining } from '@/lib/dates/expiryCalculator';
import { formatDateZoned, formatFriendlyDate } from '@/lib/dates/timezone';
import { formatCurrency } from '@/lib/utils/currency';
import { exportToExcel } from '@/lib/utils/excelExport';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Download,
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  ShieldCheck,
  Calendar,
  Layers,
  FileSpreadsheet,
  CheckCircle2,
  DollarSign,
  Activity,
  SlidersHorizontal,
  Clock,
  Filter,
} from 'lucide-react';

interface DashboardViewProps {
  metrics: {
    totalInquiries: number;
    newThisWeek: number;
    proformasSent: number;
    acceptedInquiries: number;
    conversionRate: number;
    totalRevenue: number;
    expiringSoonCount: number;
    sourceStats: { label: string; count: number; percent: number; color: string }[];
    serviceDemand: { name: string; category: string; count: number; value: number }[];
    monthlyRevenueTrend: { month: string; inquiries: number; proformas: number; value: number }[];
    conversionFunnel: { stage: string; count: number; percent: number; color: string }[];
    expiringServices: any[];
    recentProformas: any[];
  };
}

export function DashboardView({ metrics }: DashboardViewProps) {
  const [activeTab, setActiveTab] = React.useState<'overview' | 'analytics' | 'proformas'>('overview');
  const [timeframe, setTimeframe] = React.useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [toast, setToast] = React.useState<ToastMessage | null>(null);

  // Custom Chart Visibility Toggles
  const [visibleCharts, setVisibleCharts] = React.useState({
    revenueTrend: true,
    funnel: true,
    serviceDemand: true,
    leadSource: true,
    renewalRisk: true,
  });

  const toggleChart = (key: keyof typeof visibleCharts) => {
    setVisibleCharts((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // 1. Export Executive Summary Excel
  const handleExportExecutiveReport = () => {
    try {
      const summaryData = [
        { Metric: 'Total Registered Inquiries', Value: metrics.totalInquiries },
        { Metric: 'New Inquiries (Last 7 Days)', Value: metrics.newThisWeek },
        { Metric: 'Proformas Sent to Clients', Value: metrics.proformasSent },
        { Metric: 'Accepted Commercial Proposals', Value: metrics.acceptedInquiries },
        { Metric: 'Sales Pipeline Conversion Rate', Value: `${metrics.conversionRate}%` },
        { Metric: 'Total Pipeline Commercial Value (INR)', Value: `₹${metrics.totalRevenue.toLocaleString('en-IN')}` },
        { Metric: 'Compliance Services Expiring (<60 Days)', Value: metrics.expiringSoonCount },
      ];

      exportToExcel({
        filename: 'HL_Associates_Executive_CRM_Report',
        sheetName: 'Executive Summary',
        columns: [
          { header: 'Key Performance Metric', key: 'Metric', width: 35 },
          { header: 'Current Value / Status', key: 'Value', width: 30 },
        ],
        data: summaryData,
      });

      setToast({
        type: 'success',
        title: 'Executive Excel Report Downloaded',
        description: 'Formatted .xlsx workbook generated with real database metrics.',
      });
    } catch (e: any) {
      setToast({ type: 'error', title: 'Export Failed', description: e?.message });
    }
  };

  // 2. Export Proformas Excel
  const handleExportProformas = () => {
    try {
      if (metrics.recentProformas.length === 0) {
        throw new Error('No proforma records found to export');
      }

      exportToExcel({
        filename: 'HL_Associates_Proformas_Financials',
        sheetName: 'Proformas',
        columns: [
          { header: 'Proforma #', key: 'proformaNumber', width: 18 },
          { header: 'Client / Prospect', key: 'client.companyName', width: 28 },
          { header: 'Issue Date', key: 'issueDate', width: 16, format: (v) => formatFriendlyDate(v) },
          { header: 'Valid Until', key: 'validUntil', width: 16, format: (v) => formatFriendlyDate(v) },
          { header: 'Total Value (INR)', key: 'totalAmount', width: 20, format: (v) => `₹${Number(v).toLocaleString('en-IN')}` },
          { header: 'Status', key: 'status', width: 14 },
        ],
        data: metrics.recentProformas,
      });

      setToast({
        type: 'success',
        title: 'Proformas Excel Downloaded',
        description: `Exported ${metrics.recentProformas.length} financial proforma records.`,
      });
    } catch (e: any) {
      setToast({ type: 'error', title: 'Export Failed', description: e?.message });
    }
  };

  const maxServiceDemand = Math.max(...metrics.serviceDemand.map((s) => s.count), 1);
  const maxMonthlyRevenue = Math.max(...metrics.monthlyRevenueTrend.map((m) => m.value), 1);

  return (
    <div className="space-y-4 sm:space-y-6 pb-8">
      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Top Header & Export Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Executive CRM Dashboard</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time compliance operations, proforma financials, and sales conversion analytics.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Timeframe selector */}
          <div className="flex items-center rounded-lg border border-slate-200 bg-white p-0.5 text-xs font-semibold shadow-xs">
            {(['7d', '30d', '90d', 'all'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  timeframe === t ? 'bg-[#041627] text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t === 'all' ? '2026 YTD' : t.toUpperCase()}
              </button>
            ))}
          </div>

          <Button onClick={handleExportExecutiveReport} variant="secondary" size="md" className="shrink-0">
            <FileSpreadsheet className="w-4 h-4 mr-1.5 text-emerald-700" /> Export Excel (.xlsx)
          </Button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="bg-white rounded-lg border border-slate-200 p-1 sm:p-1.5 shadow-card flex items-center gap-1 overflow-x-auto no-scrollbar touch-scroll text-xs font-semibold">
        {[
          { id: 'overview', label: 'Executive Overview', icon: Activity },
          { id: 'analytics', label: 'Advanced Analytics & Visualizations', icon: BarChart3 },
          { id: 'proformas', label: `Financials & Proformas (${metrics.recentProformas.length})`, icon: DollarSign },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-[#e5eeff] text-[#0040e0] font-bold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 active:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: EXECUTIVE OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-4 sm:space-y-6">
          {/* 4 Primary KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
            <KpiCard
              title="Total Inquiries"
              value={metrics.totalInquiries}
              trend={{ value: '+8% vs prev', isPositive: true }}
            />

            <KpiCard
              title="Proformas Sent"
              value={metrics.proformasSent}
              subtext={`${metrics.acceptedInquiries} Accepted • ${metrics.conversionRate}% Conv.`}
            />

            <KpiCard
              title="New (This Week)"
              value={metrics.newThisWeek}
              trend={{ value: '+3 new', isPositive: true }}
            />

            <KpiCard
              title="Expiring < 60 Days"
              value={metrics.expiringSoonCount}
              valueColor="text-amber-600"
              subtext="Milestone Action Req."
              accentBorder="yellow"
            />
          </div>

          {/* Inquiry Source & Service Demand Visual Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
            {/* Left: Inquiry Source Donut Graphic (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-lg border border-slate-200 p-4 sm:p-6 shadow-card flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">Lead Source Attribution</h3>
                <Badge variant="outline">Channel ROI</Badge>
              </div>

              <div className="flex flex-col items-center justify-center my-2 sm:my-4">
                <div className="relative w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-45" viewBox="0 0 100 100">
                    <rect x="15" y="15" width="70" height="70" fill="none" stroke="#041627" strokeWidth="12" strokeDasharray="60 140" strokeDashoffset="0" />
                    <rect x="15" y="15" width="70" height="70" fill="none" stroke="#0040e0" strokeWidth="12" strokeDasharray="45 155" strokeDashoffset="-60" />
                    <rect x="15" y="15" width="70" height="70" fill="none" stroke="#ca8a04" strokeWidth="12" strokeDasharray="25 175" strokeDashoffset="-105" />
                    <rect x="15" y="15" width="70" height="70" fill="none" stroke="#e2e8f0" strokeWidth="12" strokeDasharray="20 180" strokeDashoffset="-130" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-lg sm:text-xl font-bold text-slate-900">{metrics.totalInquiries}</span>
                    <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium">Inquiries</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-2 mt-4 sm:mt-6 w-full max-w-[280px]">
                  {metrics.sourceStats.map((item) => (
                    <div key={item.label} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <span className="w-2.5 h-2.5 rounded-xs shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="text-slate-600 truncate">{item.label}</span>
                      </div>
                      <span className="font-semibold text-slate-900">{item.percent}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Service Demand Bar Chart (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-lg border border-slate-200 p-4 sm:p-6 shadow-card flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">Service Category Demand</h3>
                  <span className="text-xs text-slate-500 font-medium">Active Engagements</span>
                </div>
                <div className="border-b border-slate-100 mt-2 mb-4 sm:mb-6" />
              </div>

              <div className="h-44 sm:h-48 flex items-end justify-between gap-2 sm:gap-4 px-1 sm:px-6">
                {metrics.serviceDemand.map((service) => {
                  const heightPercent = Math.round((service.count / maxServiceDemand) * 100);
                  return (
                    <div key={service.name} className="flex-1 flex flex-col items-center gap-1.5 sm:gap-2 group">
                      <div className="w-full flex justify-center items-end h-32 sm:h-36">
                        <div
                          className="w-8 sm:w-16 bg-[#e5eeff] group-hover:bg-[#0040e0] transition-all rounded-t flex items-start justify-center pt-1.5 sm:pt-2 shadow-xs"
                          style={{ height: `${Math.max(18, heightPercent)}%` }}
                        >
                          <span className="text-[10px] sm:text-[11px] font-bold text-[#0040e0] group-hover:text-white transition-colors">
                            {service.count}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] sm:text-[11px] font-semibold text-slate-600 text-center leading-tight truncate w-full">
                        {service.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Expiring Soon Table */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-card overflow-hidden">
            <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-100">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">Compliance Expiring Soon (Action Queue)</h3>
                <p className="text-xs text-slate-500 mt-0.5">High-priority regulatory licenses expiring within 60 days.</p>
              </div>
              <Link
                href="/renewals"
                className="text-xs font-semibold text-[#0040e0] hover:underline flex items-center gap-1"
              >
                View Pipeline <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto touch-scroll">
              <table className="w-full text-left text-xs sm:text-sm whitespace-nowrap min-w-[600px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4 sm:px-5">Client</th>
                    <th className="py-3 px-4 sm:px-5">Service</th>
                    <th className="py-3 px-4 sm:px-5">Expiry Date</th>
                    <th className="py-3 px-4 sm:px-5">Days Remaining</th>
                    <th className="py-3 px-4 sm:px-5">Status</th>
                    <th className="py-3 px-4 sm:px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {metrics.expiringServices.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-xs text-slate-400">
                        No services expiring in the next 60 days
                      </td>
                    </tr>
                  ) : (
                    metrics.expiringServices.map((cs) => {
                      const daysLeft = getDaysRemaining(cs.expiryDate);
                      const isUrgent = daysLeft <= 15;
                      const isAction = daysLeft > 15 && daysLeft <= 30;

                      return (
                        <tr key={cs.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 sm:py-3.5 px-4 sm:px-5 font-semibold text-slate-900">
                            <Link href={`/clients/${cs.clientId}`} className="hover:text-[#0040e0]">
                              {cs.client.companyName}
                            </Link>
                          </td>
                          <td className="py-3 sm:py-3.5 px-4 sm:px-5 text-slate-600 font-medium">{cs.serviceNameSnapshot}</td>
                          <td className="py-3 sm:py-3.5 px-4 sm:px-5 text-slate-600">{formatDateZoned(cs.expiryDate)}</td>
                          <td className="py-3 sm:py-3.5 px-4 sm:px-5">
                            <span
                              className={`font-bold ${
                                isUrgent ? 'text-red-600' : isAction ? 'text-amber-600' : 'text-slate-700'
                              }`}
                            >
                              {daysLeft}
                            </span>
                          </td>
                          <td className="py-3 sm:py-3.5 px-4 sm:px-5">
                            <Badge variant={isUrgent ? 'urgent' : isAction ? 'actionNeeded' : 'normal'}>
                              {isUrgent ? 'Urgent' : isAction ? 'Action Needed' : 'Normal'}
                            </Badge>
                          </td>
                          <td className="py-3 sm:py-3.5 px-4 sm:px-5 text-right">
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
          </div>
        </div>
      )}

      {/* TAB 2: ADVANCED ANALYTICS & VISUALIZATIONS */}
      {activeTab === 'analytics' && (
        <div className="space-y-4 sm:space-y-6">
          {/* Chart Display Preferences & Filter Bar */}
          <div className="bg-white rounded-lg border border-slate-200 p-3.5 sm:p-4 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#0040e0]" />
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Customize Dashboard Charts</span>
            </div>

            <div className="flex items-center gap-2 sm:gap-4 flex-wrap text-xs text-slate-700">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={visibleCharts.revenueTrend}
                  onChange={() => toggleChart('revenueTrend')}
                  className="rounded text-[#0040e0] focus:ring-[#0040e0]"
                />
                <span>Revenue Trend</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={visibleCharts.funnel}
                  onChange={() => toggleChart('funnel')}
                  className="rounded text-[#0040e0] focus:ring-[#0040e0]"
                />
                <span>Conversion Funnel</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={visibleCharts.serviceDemand}
                  onChange={() => toggleChart('serviceDemand')}
                  className="rounded text-[#0040e0] focus:ring-[#0040e0]"
                />
                <span>Service Categories</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={visibleCharts.leadSource}
                  onChange={() => toggleChart('leadSource')}
                  className="rounded text-[#0040e0] focus:ring-[#0040e0]"
                />
                <span>Lead Source ROI</span>
              </label>
            </div>
          </div>

          {/* Graph 1: Monthly Commercial Revenue & Proposal Pipeline */}
          {visibleCharts.revenueTrend && (
            <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6 shadow-card space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <span>Monthly Commercial Proposal Pipeline (INR)</span>
                  </h3>
                  <p className="text-xs text-slate-500">Gross proposal valuation and converted contract velocity.</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-[#0040e0]">₹{metrics.totalRevenue.toLocaleString('en-IN')}</div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Total Pipeline Value</span>
                </div>
              </div>

              {/* Monthly Bar Visualizer */}
              <div className="h-52 flex items-end justify-between gap-3 sm:gap-6 pt-6 px-2 sm:px-6">
                {metrics.monthlyRevenueTrend.map((m) => {
                  const barHeight = Math.round((m.value / maxMonthlyRevenue) * 100);
                  return (
                    <div key={m.month} className="flex-1 flex flex-col items-center gap-2 group">
                      <div className="text-[10px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        ₹{(m.value / 100000).toFixed(1)}L
                      </div>
                      <div className="w-full flex justify-center items-end h-36">
                        <div
                          className="w-full max-w-[48px] bg-gradient-to-t from-[#0040e0] to-[#3b82f6] group-hover:from-[#041627] group-hover:to-[#0040e0] rounded-t transition-all shadow-xs"
                          style={{ height: `${Math.max(15, barHeight)}%` }}
                        />
                      </div>
                      <div className="text-center">
                        <div className="text-[11px] font-bold text-slate-900">{m.month}</div>
                        <div className="text-[10px] text-slate-400">{m.proformas} sent</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Graph 2: Full Sales Conversion Funnel & Stage Breakdown */}
          {visibleCharts.funnel && (
            <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6 shadow-card space-y-4">
              <div className="pb-2 border-b border-slate-100">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#0040e0]" />
                  <span>Pipeline Conversion Funnel</span>
                </h3>
                <p className="text-xs text-slate-500">Stage-by-stage regulatory conversion efficiency.</p>
              </div>

              <div className="space-y-3 pt-2">
                {metrics.conversionFunnel.map((step, idx) => (
                  <div key={step.stage} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800">
                        {idx + 1}. {step.stage}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{step.count} entries</span>
                        <span className="text-[11px] text-slate-500 font-mono">({step.percent}%)</span>
                      </div>
                    </div>
                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${step.percent}%`, backgroundColor: step.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Graph 3 & 4: Multi-Column Regulatory & Risk Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {visibleCharts.serviceDemand && (
              <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6 shadow-card space-y-4">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <span>Regulatory Portfolio Mix</span>
                </h3>
                <div className="space-y-3">
                  {metrics.serviceDemand.map((srv) => (
                    <div key={srv.name} className="p-3 bg-slate-50 rounded border border-slate-200 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-xs text-slate-900">{srv.name}</div>
                        <div className="text-[10px] text-slate-500">{srv.category}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-xs text-slate-900">{srv.count} clients</div>
                        <div className="text-[10px] text-emerald-600 font-semibold">₹{(srv.value / 100000).toFixed(1)}L volume</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {visibleCharts.leadSource && (
              <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6 shadow-card space-y-4">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                  <PieIcon className="w-4 h-4 text-amber-600" />
                  <span>Lead Acquisition Channel ROI</span>
                </h3>
                <div className="space-y-3">
                  {metrics.sourceStats.map((src) => (
                    <div key={src.label} className="p-3 bg-slate-50 rounded border border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: src.color }} />
                        <span className="font-bold text-xs text-slate-900">{src.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">{src.count} leads</span>
                        <Badge variant="proforma">{src.percent}%</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: FINANCIALS & PROFORMAS */}
      {activeTab === 'proformas' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white rounded-lg border border-slate-200 shadow-card overflow-hidden">
            <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">Commercial Proformas & Proposals</h3>
                <p className="text-xs text-slate-500 mt-0.5">Formal proposals, billing milestones, and commercial validity.</p>
              </div>

              <Button onClick={handleExportProformas} variant="secondary" size="sm">
                <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5 text-emerald-700" /> Export Proformas (.xlsx)
              </Button>
            </div>

            <div className="overflow-x-auto touch-scroll">
              <table className="w-full text-left text-xs whitespace-nowrap min-w-[650px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Proforma #</th>
                    <th className="py-3 px-4">Client / Prospect</th>
                    <th className="py-3 px-4">Issue Date</th>
                    <th className="py-3 px-4">Valid Until</th>
                    <th className="py-3 px-4">Total Amount (INR)</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {metrics.recentProformas.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        No proformas generated yet.
                      </td>
                    </tr>
                  ) : (
                    metrics.recentProformas.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-[#0040e0]">
                          <Link href={`/proformas/${p.id}`} className="hover:underline">
                            {p.proformaNumber}
                          </Link>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          {p.client?.companyName || p.inquiry?.companyName || 'Corporate Client'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">{formatFriendlyDate(p.issueDate)}</td>
                        <td className="py-3.5 px-4 text-slate-600">{formatFriendlyDate(p.validUntil)}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {formatCurrency(p.totalAmount, p.currency)}
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge variant="proforma">{p.status}</Badge>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <a
                            href={`/api/proformas/${p.id}/pdf`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#0040e0] hover:underline"
                          >
                            <Download className="w-3.5 h-3.5" /> PDF
                          </a>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
