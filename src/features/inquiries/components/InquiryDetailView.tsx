'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { formatFriendlyDate } from '@/lib/dates/timezone';
import { formatCurrency } from '@/lib/utils/currency';
import {
  ArrowLeft,
  ExternalLink,
  FileText,
  Clock,
  Send,
  UserCheck,
  RotateCcw,
  CheckCircle2,
  Download,
  AlertTriangle,
} from 'lucide-react';

interface InquiryDetailProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  inquiry: any;
  services: { id: string; name: string; code: string; suggestedPriceMin?: number | null }[];
  users: { id: string; fullName: string }[];
}

export function InquiryDetailView({ inquiry, services }: InquiryDetailProps) {
  const router = useRouter();
  const [currentInquiry, setCurrentInquiry] = React.useState(inquiry);
  const [isLoading, setIsLoading] = React.useState(false);

  // Dialog States
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isLostOpen, setIsLostOpen] = React.useState(false);
  const [isProformaOpen, setIsProformaOpen] = React.useState(false);
  const [isPdfPreviewOpen, setIsPdfPreviewOpen] = React.useState(false);
  const [isConvertOpen, setIsConvertOpen] = React.useState(false);

  // Form states
  const [lostReason, setLostReason] = React.useState('');
  const [proformaPrice, setProformaPrice] = React.useState(
    currentInquiry.service?.suggestedPriceMin || 200000
  );
  const [proformaScope, setProformaScope] = React.useState(
    currentInquiry.serviceScope || currentInquiry.service?.description || 'Regulatory consultation'
  );
  const [recipientEmail, setRecipientEmail] = React.useState(currentInquiry.email || '');

  const latestProforma = currentInquiry.proformas?.[0];

  // Refresh helper
  const refreshInquiry = async () => {
    try {
      const res = await fetch(`/api/inquiries/${currentInquiry.id}`);
      const json = await res.json();
      if (json.success) {
        setCurrentInquiry(json.data);
      }
    } catch (err) {
      console.error('Refresh error:', err);
    }
  };

  // State transitions
  const handleMarkLost = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/inquiries/${currentInquiry.id}/lost`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: lostReason }),
      });
      const json = await res.json();
      if (json.success) {
        setIsLostOpen(false);
        refreshInquiry();
        router.refresh();
      }
    } catch (err) {
      console.error('Mark lost error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReopen = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/inquiries/${currentInquiry.id}/reopen`, {
        method: 'POST',
      });
      const json = await res.json();
      if (json.success) {
        refreshInquiry();
        router.refresh();
      }
    } catch (err) {
      console.error('Reopen error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAndSendProforma = async () => {
    setIsLoading(true);
    try {
      // 1. Create Proforma
      const createRes = await fetch('/api/proformas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inquiryId: currentInquiry.id,
          items: [
            {
              serviceId: currentInquiry.serviceId,
              description: proformaScope,
              quantity: 1,
              unitPrice: Number(proformaPrice),
            },
          ],
        }),
      });

      const createJson = await createRes.json();
      if (!createJson.success) throw new Error('Failed to generate proforma');

      // 2. Dispatch Email
      const sendRes = await fetch(`/api/proformas/${createJson.data.id}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientEmail }),
      });

      const sendJson = await sendRes.json();
      if (sendJson.success) {
        setIsProformaOpen(false);
        refreshInquiry();
        router.refresh();
      }
    } catch (err) {
      console.error('Send proforma error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConvertClient = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/inquiries/${currentInquiry.id}/convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          durationValue: 12,
          durationUnit: 'MONTHS',
          customFee: latestProforma ? Number(latestProforma.totalAmount) : 200000,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setIsConvertOpen(false);
        router.push(`/clients/${json.data.client.id}`);
        router.refresh();
      }
    } catch (err) {
      console.error('Convert client error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case 'NEW': return <Badge variant="new">NEW</Badge>;
      case 'PROFORMA_SENT': return <Badge variant="proforma">PROFORMA SENT</Badge>;
      case 'ACCEPTED': return <Badge variant="accepted">ACCEPTED</Badge>;
      case 'CONVERTED': return <Badge variant="converted">CONVERTED</Badge>;
      case 'LOST': return <Badge variant="lost">LOST</Badge>;
      case 'REOPENED': return <Badge variant="reopened">REOPENED</Badge>;
      default: return <Badge variant="normal">{st}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb Navigation (Screenshot 3) */}
      <div className="flex items-center">
        <Link
          href="/inquiries"
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Inquiries</span>
        </Link>
      </div>

      {/* Main Header (Screenshot 3) */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {currentInquiry.companyName}
            </h1>
            {getStatusBadge(currentInquiry.status)}
          </div>
          <div className="text-xs text-slate-500 font-medium mt-1">
            ID: <span className="font-semibold text-slate-700">{currentInquiry.inquiryNumber}</span> •
            Assigned to:{' '}
            <span className="font-semibold text-slate-700">
              {currentInquiry.assignedTo?.fullName || 'Unassigned'}
            </span>
          </div>
        </div>

        {/* Action Buttons (Screenshot 3) */}
        <div className="flex flex-wrap items-center gap-2.5">
          {currentInquiry.status === 'LOST' ? (
            <Button onClick={handleReopen} variant="secondary" size="md" isLoading={isLoading}>
              <RotateCcw className="w-4 h-4 mr-1.5" /> Reopen Inquiry
            </Button>
          ) : currentInquiry.status !== 'CONVERTED' ? (
            <Button
              onClick={() => setIsLostOpen(true)}
              variant="secondary"
              size="md"
              className="text-red-600 border-slate-300 hover:bg-red-50 hover:border-red-300"
            >
              Mark Lost
            </Button>
          ) : null}

          <Button onClick={() => setIsEditOpen(true)} variant="secondary" size="md">
            Edit Inquiry
          </Button>

          {currentInquiry.status !== 'CONVERTED' && (
            <>
              {currentInquiry.status === 'ACCEPTED' || currentInquiry.status === 'PROFORMA_SENT' ? (
                <Button onClick={() => setIsConvertOpen(true)} variant="primary" size="md">
                  <UserCheck className="w-4 h-4 mr-1.5" /> Convert to Client
                </Button>
              ) : (
                <Button onClick={() => setIsProformaOpen(true)} variant="primary" size="md">
                  <Send className="w-4 h-4 mr-1.5" /> Send Proforma
                </Button>
              )}
            </>
          )}

          {currentInquiry.status === 'CONVERTED' && currentInquiry.convertedClient && (
            <Link href={`/clients/${currentInquiry.convertedClient.id}`}>
              <Button variant="primary" size="md">
                <CheckCircle2 className="w-4 h-4 mr-1.5 text-white" /> View Active Client
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* 2-Column Grid (Screenshot 3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Client Information & Service Requested (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Client Information */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-card">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-5">
              <FileText className="w-4 h-4 text-slate-500" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Client Information
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-6 text-xs">
              <div>
                <div className="text-slate-500 font-semibold mb-1">Company Name</div>
                <div className="font-bold text-slate-900 text-sm">{currentInquiry.companyName}</div>
              </div>

              <div>
                <div className="text-slate-500 font-semibold mb-1">Primary Contact</div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{currentInquiry.contactName}</span>
                  {currentInquiry.contactTitle && (
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-semibold">
                      {currentInquiry.contactTitle}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <div className="text-slate-500 font-semibold mb-1">Email Address</div>
                <a
                  href={`mailto:${currentInquiry.email}`}
                  className="text-[#0040e0] font-semibold hover:underline inline-flex items-center gap-1"
                >
                  {currentInquiry.email}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div>
                <div className="text-slate-500 font-semibold mb-1">Phone Number</div>
                <div className="font-semibold text-slate-800">{currentInquiry.phone || 'N/A'}</div>
              </div>

              <div className="sm:col-span-2 pt-2 border-t border-slate-50">
                <div className="text-slate-500 font-semibold mb-1">Inquiry Source</div>
                <div className="font-semibold text-slate-800">
                  {currentInquiry.sourceDetail || currentInquiry.source}
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Service Requested */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-card">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-5">
              <FileText className="w-4 h-4 text-slate-500" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Service Requested
              </h2>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <div className="text-slate-500 font-semibold mb-1.5">Service Type</div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-slate-50 border border-slate-200 text-slate-800 font-semibold">
                  <span>⚡</span>
                  <span>{currentInquiry.service?.name || 'Regulatory Compliance Consultation'}</span>
                </div>
              </div>

              <div>
                <div className="text-slate-500 font-semibold mb-1.5">Detailed Scope</div>
                <div className="p-4 rounded bg-slate-50/70 border border-slate-100 text-slate-700 text-xs leading-relaxed font-normal">
                  {currentInquiry.serviceScope || 'No detailed scope provided.'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Proforma Status & Activity Timeline (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card 1: Proforma Status */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-card">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Proforma Status
              </span>
            </div>

            {!latestProforma ? (
              /* Empty state matching Screenshot 3 */
              <div className="border border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center text-center space-y-3 bg-slate-50/50">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">No proforma sent yet</div>
                  <div className="text-[11px] text-slate-500 mt-0.5 max-w-[220px]">
                    Generate a proposal to move this inquiry forward.
                  </div>
                </div>
                <Button onClick={() => setIsProformaOpen(true)} variant="secondary" size="sm" className="mt-1">
                  Create Proforma
                </Button>
              </div>
            ) : (
              /* Sent Proforma view */
              <div className="p-4 rounded border border-purple-100 bg-purple-50/40 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{latestProforma.proformaNumber}</span>
                  <Badge variant="proforma">{latestProforma.status}</Badge>
                </div>
                <div className="text-slate-600">
                  Total Amount:{' '}
                  <strong className="text-slate-900 font-bold">
                    {formatCurrency(latestProforma.totalAmount, latestProforma.currency)}
                  </strong>
                </div>
                <div className="text-slate-500 text-[11px]">
                  Issued: {formatFriendlyDate(latestProforma.issueDate)} • Valid Until:{' '}
                  {formatFriendlyDate(latestProforma.validUntil)}
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-purple-100">
                  <Button
                    onClick={() => setIsPdfPreviewOpen(true)}
                    variant="secondary"
                    size="sm"
                    className="flex-1 text-xs"
                  >
                    <FileText className="w-3.5 h-3.5 mr-1" /> Preview PDF
                  </Button>
                  <Button
                    onClick={() => setIsProformaOpen(true)}
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                  >
                    <Send className="w-3.5 h-3.5 mr-1" /> Resend
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Card 2: Activity Timeline (Screenshot 3) */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-card">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
              <Clock className="w-4 h-4 text-slate-500" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Activity Timeline
              </h2>
            </div>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {currentInquiry.activityLogs?.length > 0 ? (
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                currentInquiry.activityLogs.map((log: any, idx: number) => (
                  <div key={log.id} className="relative">
                    <div
                      className={`absolute -left-6 top-1 w-2.5 h-2.5 rounded-full ring-4 ring-white ${
                        idx === 0 ? 'bg-[#0040e0]' : 'bg-slate-300'
                      }`}
                    />
                    <div className="text-xs font-bold text-slate-900 leading-tight">
                      {log.description || log.action}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {log.user?.fullName ? `By ${log.user.fullName} • ` : ''}
                      {formatFriendlyDate(log.createdAt)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-400">No activity recorded.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Send Proforma Modal */}
      <Modal
        isOpen={isProformaOpen}
        onClose={() => setIsProformaOpen(false)}
        title="Generate & Send Proforma Proposal"
        size="md"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Recipient Email</label>
            <Input
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="client@company.com"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Service & Scope Description</label>
            <Textarea
              value={proformaScope}
              onChange={(e) => setProformaScope(e.target.value)}
              rows={2}
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Proposed Commercial Fee (INR)</label>
            <Input
              type="number"
              value={proformaPrice}
              onChange={(e) => setProformaPrice(Number(e.target.value))}
            />
          </div>

          <div className="p-3 bg-blue-50/60 rounded border border-blue-100 text-slate-600 text-[11px]">
            This will snapshot commercial terms, generate formal A4 proforma PDF, log email dispatch, and update inquiry status to <strong>PROFORMA_SENT</strong>.
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="secondary" size="sm" onClick={() => setIsProformaOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={isLoading}
              onClick={handleCreateAndSendProforma}
            >
              <Send className="w-3.5 h-3.5 mr-1" /> Generate & Send
            </Button>
          </div>
        </div>
      </Modal>

      {/* PDF Preview Modal (900px width) */}
      {latestProforma && (
        <Modal
          isOpen={isPdfPreviewOpen}
          onClose={() => setIsPdfPreviewOpen(false)}
          title={`Proforma Invoice - ${latestProforma.proformaNumber}`}
          size="xl"
        >
          <div className="space-y-4">
            <div className="h-[550px] w-full border border-slate-200 rounded overflow-hidden bg-slate-100">
              <iframe
                src={`/api/proformas/${latestProforma.id}/pdf`}
                className="w-full h-full border-0"
                title="Proforma PDF Preview"
              />
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500">
                Official Regulatory Proposal • {latestProforma.proformaNumber}
              </span>
              <a
                href={`/api/proformas/${latestProforma.id}/pdf`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0040e0] hover:underline"
              >
                <Download className="w-3.5 h-3.5" /> Open in New Tab
              </a>
            </div>
          </div>
        </Modal>
      )}

      {/* Convert to Client Confirmation Dialog */}
      <Modal
        isOpen={isConvertOpen}
        onClose={() => setIsConvertOpen(false)}
        title="Convert Inquiry to Client"
        size="md"
      >
        <div className="space-y-4 text-xs">
          <div className="flex items-start gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded text-emerald-900">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">Atomic Client Conversion Workflow</div>
              <div className="text-[11px] text-emerald-800 mt-0.5">
                This transaction will create the permanent Client record, snapshot the active regulatory service, calculate dynamic expiry, initialize the renewal alert schedule (60d, 30d, 7d, 0d), and update the inquiry status to CONVERTED.
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between border-b border-slate-100 py-1.5">
              <span className="text-slate-500">Company:</span>
              <span className="font-bold text-slate-900">{currentInquiry.companyName}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 py-1.5">
              <span className="text-slate-500">Service:</span>
              <span className="font-bold text-slate-900">{currentInquiry.service?.name}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 py-1.5">
              <span className="text-slate-500">Duration:</span>
              <span className="font-bold text-slate-900">12 Months</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="secondary" size="sm" onClick={() => setIsConvertOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" isLoading={isLoading} onClick={handleConvertClient}>
              <UserCheck className="w-3.5 h-3.5 mr-1" /> Confirm Conversion
            </Button>
          </div>
        </div>
      </Modal>

      {/* Mark Lost Modal */}
      <Modal isOpen={isLostOpen} onClose={() => setIsLostOpen(false)} title="Mark Inquiry Lost" size="sm">
        <div className="space-y-4 text-xs">
          <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-200 rounded text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>Specify reason for marking this inquiry as lost for audit tracking.</span>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Reason / Notes</label>
            <Textarea
              value={lostReason}
              onChange={(e) => setLostReason(e.target.value)}
              placeholder="e.g. Client opted for alternative timeline, budget constraint..."
              rows={3}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setIsLostOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              isLoading={isLoading}
              onClick={handleMarkLost}
            >
              Confirm Lost
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
