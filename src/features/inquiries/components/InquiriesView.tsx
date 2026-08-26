'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Toast, ToastMessage } from '@/components/ui/Toast';
import { NewInquiryDialog } from './NewInquiryDialog';
import { exportToExcel } from '@/lib/utils/excelExport';
import {
  Search,
  Eye,
  Edit,
  ChevronLeft,
  ChevronRight,
  Plus,
  FileSpreadsheet,
} from 'lucide-react';
import { formatFriendlyDate } from '@/lib/dates/timezone';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { Pagination } from '@/components/ui/Pagination';
import { DatePresetFilter, DateFilterValue } from '@/components/ui/DatePresetFilter';

interface InquiryItem {
  id: string;
  inquiryNumber: string;
  companyName: string;
  contactName: string;
  source: string;
  serviceScope?: string | null;
  status: string;
  createdAt: string;
  service?: {
    id: string;
    name: string;
    code: string;
  } | null;
  assignedTo?: {
    id: string;
    fullName: string;
  } | null;
}

interface InquiriesViewProps {
  initialServices: { id: string; name: string; code: string }[];
  initialUsers: { id: string; fullName: string; avatarUrl?: string | null }[];
  searchParams?: { search?: string; status?: string; serviceId?: string; page?: string };
}

export function InquiriesView({ initialServices, initialUsers }: InquiriesViewProps) {
  const router = useRouter();
  const [inquiries, setInquiries] = React.useState<InquiryItem[]>([]);
  const [stats, setStats] = React.useState<{ total: number; new: number; proformaSent: number; accepted: number } | null>(null);
  const [pagination, setPagination] = React.useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [isLoading, setIsLoading] = React.useState(true);
  const [isExporting, setIsExporting] = React.useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = React.useState(false);
  const [toast, setToast] = React.useState<ToastMessage | null>(null);

  // Filter States
  const [search, setSearch] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [status, setStatus] = React.useState('');
  const [serviceId, setServiceId] = React.useState('');
  const [assignedToId, setAssignedToId] = React.useState('');
  const [dateFilter, setDateFilter] = React.useState<DateFilterValue>({ preset: 'ALL' });
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);

  // Debounce search input to avoid redundant network thrashing
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchInquiries = React.useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch.trim()) params.set('search', debouncedSearch.trim());
      if (status) params.set('status', status);
      if (serviceId) params.set('serviceId', serviceId);
      if (assignedToId) params.set('assignedToId', assignedToId);
      if (dateFilter.startDate) params.set('startDate', dateFilter.startDate);
      if (dateFilter.endDate) params.set('endDate', dateFilter.endDate);
      params.set('page', String(page));
      params.set('limit', String(limit));

      const res = await fetch(`/api/inquiries?${params.toString()}`, { signal });
      const json = await res.json();
      if (json.success) {
        setInquiries(json.data.inquiries || []);
        setPagination(json.data.pagination);
        if (json.data.stats) setStats(json.data.stats);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Fetch inquiries error:', err);
      }
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, status, serviceId, assignedToId, dateFilter, page, limit]);

  React.useEffect(() => {
    const controller = new AbortController();
    fetchInquiries(controller.signal);
    return () => controller.abort();
  }, [fetchInquiries]);

  const handleClearFilters = () => {
    setSearch('');
    setStatus('');
    setServiceId('');
    setAssignedToId('');
    setDateFilter({ preset: 'ALL' });
    setPage(1);
  };

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch.trim()) params.set('search', debouncedSearch.trim());
      if (status) params.set('status', status);
      if (serviceId) params.set('serviceId', serviceId);
      if (assignedToId) params.set('assignedToId', assignedToId);
      if (dateFilter.startDate) params.set('startDate', dateFilter.startDate);
      if (dateFilter.endDate) params.set('endDate', dateFilter.endDate);
      params.set('export', 'true');

      const res = await fetch(`/api/inquiries?${params.toString()}`);
      const json = await res.json();
      const exportData: InquiryItem[] = json.success ? json.data.inquiries : inquiries;

      if (!exportData || exportData.length === 0) {
        setToast({ type: 'info', title: 'No Data', description: 'No inquiry records match the selected filters to export.' });
        return;
      }

      exportToExcel({
        filename: `HL_Inquiries_${dateFilter.preset !== 'ALL' ? dateFilter.preset.toLowerCase() : 'all_records'}`,
        sheetName: 'Inquiries Pipeline',
        columns: [
          { header: 'Inquiry Number', key: 'inquiryNumber', width: 18 },
          { header: 'Company Name', key: 'companyName', width: 30 },
          { header: 'Contact Person', key: 'contactName', width: 22 },
          { header: 'Status', key: 'status', width: 16 },
          { header: 'Service Required', key: 'service.name', width: 26 },
          { header: 'Lead Source', key: 'source', width: 16 },
          { header: 'Assigned Sales Rep', key: 'assignedTo.fullName', width: 22 },
          { header: 'Inquiry Date', key: 'createdAt', width: 18, format: (v) => v ? formatFriendlyDate(v) : 'N/A' },
        ],
        data: exportData,
      });

      setToast({
        type: 'success',
        title: 'Excel Export Successful',
        description: `Exported ${exportData.length} filtered inquiries to .xlsx file.`,
      });
    } catch (err: any) {
      setToast({ type: 'error', title: 'Export Failed', description: err?.message || 'Error exporting to Excel.' });
    } finally {
      setIsExporting(false);
    }
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case 'NEW':
        return <Badge variant="new">New</Badge>;
      case 'PROFORMA_SENT':
        return <Badge variant="pending">Pending Review</Badge>;
      case 'ACCEPTED':
        return <Badge variant="proforma">Proposal Sent</Badge>;
      case 'CONVERTED':
        return <Badge variant="converted">Converted</Badge>;
      case 'LOST':
        return <Badge variant="lost">Lost</Badge>;
      case 'REOPENED':
        return <Badge variant="reopened">Reopened</Badge>;
      default:
        return <Badge variant="normal">{st}</Badge>;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Inquiries</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage and track client service inquiries & compliance leads.</p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            onClick={handleExportExcel}
            variant="secondary"
            size="md"
            disabled={isExporting}
            className="flex-1 sm:flex-initial"
          >
            <FileSpreadsheet className="w-4 h-4 mr-1.5 text-[#0040e0]" />
            {isExporting ? 'Exporting...' : 'Export Excel'}
          </Button>
          <Button onClick={() => setIsNewModalOpen(true)} variant="primary" size="md" className="flex-1 sm:flex-initial">
            <Plus className="w-4 h-4 mr-1.5" /> New Inquiry
          </Button>
        </div>
      </div>

      {/* 4 Summary Cards - No flash of dummy numbers */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-3.5 sm:p-5 shadow-card">
          <div className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Inquiries</div>
          {stats ? (
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 sm:mt-2">{stats.total}</div>
          ) : (
            <div className="h-8 w-16 bg-slate-100 animate-pulse rounded my-1 sm:my-2" />
          )}
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-3.5 sm:p-5 shadow-card">
          <div className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">New Inquiries</div>
          {stats ? (
            <div className="text-2xl sm:text-3xl font-bold text-[#0040e0] mt-1 sm:mt-2">{stats.new}</div>
          ) : (
            <div className="h-8 w-16 bg-slate-100 animate-pulse rounded my-1 sm:my-2" />
          )}
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-3.5 sm:p-5 shadow-card">
          <div className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">Proposals Sent</div>
          {stats ? (
            <div className="text-2xl sm:text-3xl font-bold text-amber-600 mt-1 sm:mt-2">{stats.proformaSent}</div>
          ) : (
            <div className="h-8 w-16 bg-slate-100 animate-pulse rounded my-1 sm:my-2" />
          )}
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-3.5 sm:p-5 shadow-card">
          <div className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">Accepted</div>
          {stats ? (
            <div className="text-2xl sm:text-3xl font-bold text-emerald-600 mt-1 sm:mt-2">{stats.accepted}</div>
          ) : (
            <div className="h-8 w-16 bg-slate-100 animate-pulse rounded my-1 sm:my-2" />
          )}
        </div>
      </div>

      {/* Filter Card with Date Range & Sales Filters */}
      <div className="bg-white rounded-lg border border-slate-200 p-3.5 sm:p-4 shadow-card space-y-3">
        {/* Top Filter Row */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5 sm:gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ID, Client, or Contact..."
              className="h-9 w-full rounded border border-slate-300 bg-white pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 transition-all focus:outline-none focus:border-[#0040e0] focus:ring-2 focus:ring-[#0040e0]/20 shadow-xs"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Status Dropdown */}
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="h-9 rounded border border-slate-300 bg-white px-2.5 text-xs text-slate-700 transition-all focus:outline-none focus:border-[#0040e0] focus:ring-2 focus:ring-[#0040e0]/20 shadow-xs flex-1 sm:flex-initial min-w-[120px]"
            >
              <option value="">Status: All</option>
              <option value="NEW">New</option>
              <option value="PROFORMA_SENT">Pending Review</option>
              <option value="ACCEPTED">Proposal Sent / Accepted</option>
              <option value="CONVERTED">Converted</option>
              <option value="LOST">Lost</option>
              <option value="REOPENED">Reopened</option>
            </select>

            {/* Service Area Dropdown */}
            <select
              value={serviceId}
              onChange={(e) => {
                setServiceId(e.target.value);
                setPage(1);
              }}
              className="h-9 rounded border border-slate-300 bg-white px-2.5 text-xs text-slate-700 transition-all focus:outline-none focus:border-[#0040e0] focus:ring-2 focus:ring-[#0040e0]/20 shadow-xs flex-1 sm:flex-initial min-w-[130px]"
            >
              <option value="">Service: All</option>
              {initialServices.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            {/* Sales / Assigned Rep Dropdown */}
            <select
              value={assignedToId}
              onChange={(e) => {
                setAssignedToId(e.target.value);
                setPage(1);
              }}
              className="h-9 rounded border border-slate-300 bg-white px-2.5 text-xs text-slate-700 transition-all focus:outline-none focus:border-[#0040e0] focus:ring-2 focus:ring-[#0040e0]/20 shadow-xs flex-1 sm:flex-initial min-w-[130px]"
            >
              <option value="">Sales Rep: All</option>
              {initialUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.fullName}
                </option>
              ))}
            </select>

            {/* Clear Filters */}
            {(search || status || serviceId || assignedToId || dateFilter.preset !== 'ALL') && (
              <button
                onClick={handleClearFilters}
                className="text-xs font-semibold text-[#0040e0] hover:underline px-2 py-1.5 cursor-pointer whitespace-nowrap"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Date Filter Bar */}
        <div className="pt-2 border-t border-slate-100">
          <DatePresetFilter
            value={dateFilter}
            onChange={(df) => {
              setDateFilter(df);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* Inquiries Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-card overflow-hidden">
        <div className="table-container">
          <table className="w-full text-left text-xs whitespace-nowrap min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Inquiry ID</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Source</th>
                <th className="py-3 px-4">Service</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4">Assigned To</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            {isLoading ? (
              <TableSkeleton rows={8} cols={7} />
            ) : inquiries.length === 0 ? (
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No inquiries found matching criteria.
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody className="divide-y divide-slate-100">
                {inquiries.map((inq) => (
                  <tr key={inq.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-semibold text-[#0040e0]">
                      <Link href={`/inquiries/${inq.id}`} className="hover:underline">
                        {inq.inquiryNumber}
                      </Link>
                    </td>

                    <td className="py-3 px-4 font-semibold text-slate-900">
                      <Link href={`/inquiries/${inq.id}`} className="hover:text-[#0040e0]">
                        {inq.companyName}
                      </Link>
                    </td>

                    <td className="py-3 px-4 text-slate-600 font-medium">{inq.contactName}</td>

                    <td className="py-3 px-4 text-slate-500 capitalize">{inq.source.toLowerCase().replace('_', ' ')}</td>

                    <td className="py-3 px-4 text-slate-700 font-medium max-w-[200px] truncate">
                      {inq.service?.name || inq.serviceScope || 'Regulatory Audit'}
                    </td>

                    <td className="py-3 px-4">{getStatusBadge(inq.status)}</td>

                    <td className="py-3 px-4 text-slate-500">{formatFriendlyDate(inq.createdAt)}</td>

                    <td className="py-3 px-4">
                      {inq.assignedTo ? (
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                            {inq.assignedTo.fullName.charAt(0)}
                          </div>
                          <span className="text-slate-700 truncate max-w-[120px]">{inq.assignedTo.fullName}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5 text-slate-400">
                        <Link
                          href={`/inquiries/${inq.id}`}
                          className="p-1.5 hover:text-[#0040e0] hover:bg-slate-100 rounded transition-colors"
                          title="View Inquiry Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => router.push(`/inquiries/${inq.id}`)}
                          className="p-1.5 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>

        {/* Pagination Footer */}
        <Pagination
          currentPage={page}
          totalPages={pagination.totalPages || 1}
          totalItems={pagination.total || inquiries.length}
          pageSize={limit}
          onPageChange={setPage}
          onPageSizeChange={setLimit}
          pageSizeOptions={[10, 25, 50]}
          itemLabel="inquiries"
        />
      </div>

      {/* New Inquiry Modal */}
      <NewInquiryDialog
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        services={initialServices}
        users={initialUsers}
        onSuccess={() => {
          setIsNewModalOpen(false);
          fetchInquiries();
        }}
      />
    </div>
  );
}
