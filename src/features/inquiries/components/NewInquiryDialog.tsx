'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Check, Plus, ShieldCheck } from 'lucide-react';

const newInquirySchema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  contactName: z.string().min(2, 'Contact name is required'),
  contactTitle: z.string().optional(),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  source: z.enum(['EXHIBITION', 'REFERRAL', 'ORGANIC', 'WEBSITE', 'CONFERENCE', 'DIRECT_PARTNER', 'OTHER']),
  sourceDetail: z.string().optional(),
  serviceScope: z.string().optional(),
  remarks: z.string().optional(),
  assignedToId: z.string().optional(),
});

type NewInquiryFormData = z.infer<typeof newInquirySchema>;

interface ServiceOption {
  id: string;
  name: string;
  code: string;
}

interface UserOption {
  id: string;
  fullName: string;
}

interface NewInquiryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  services?: ServiceOption[];
  users?: UserOption[];
  onSuccess?: (inquiryId: string) => void;
}

export function NewInquiryDialog({
  isOpen,
  onClose,
  services = [],
  users = [],
  onSuccess,
}: NewInquiryDialogProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [selectedServiceIds, setSelectedServiceIds] = React.useState<string[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NewInquiryFormData>({
    resolver: zodResolver(newInquirySchema),
    defaultValues: {
      source: 'ORGANIC',
    },
  });

  const toggleService = (id: string) => {
    setSelectedServiceIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const onSubmit = async (data: NewInquiryFormData) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const payload = {
        ...data,
        serviceIds: selectedServiceIds,
        serviceId: selectedServiceIds[0] || undefined,
      };

      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error?.message || 'Failed to create inquiry');
      }

      reset();
      setSelectedServiceIds([]);
      onClose();
      if (onSuccess) {
        onSuccess(json.data.id);
      } else {
        router.push(`/inquiries/${json.data.id}`);
        router.refresh();
      }
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Client Inquiry" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5 sm:space-y-4">
        {serverError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-medium">
            {serverError}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name *</label>
            <Input {...register('companyName')} placeholder="e.g. Vanguard Holdings Ltd" error={errors.companyName?.message} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Contact *</label>
            <Input {...register('contactName')} placeholder="e.g. Sarah Jenkins" error={errors.contactName?.message} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Title</label>
            <Input {...register('contactTitle')} placeholder="e.g. Managing Director" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
            <Input type="email" {...register('email')} placeholder="contact@company.com" error={errors.email?.message} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
            <Input {...register('phone')} placeholder="+91 98200 12345" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Inquiry Source</label>
            <select
              {...register('source')}
              className="flex h-9 w-full rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#0040e0] focus:ring-2 focus:ring-[#0040e0]/20"
            >
              <option value="EXHIBITION">Exhibition</option>
              <option value="REFERRAL">Direct Referral</option>
              <option value="ORGANIC">Organic / Inbound</option>
              <option value="WEBSITE">Website Form</option>
              <option value="CONFERENCE">Conference</option>
              <option value="DIRECT_PARTNER">Direct Partner</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>

        {/* Multiple Services Multi-Select Grid */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Regulatory Services (Multi-Select Allowed)
            </label>
            {selectedServiceIds.length > 0 && (
              <span className="text-[11px] font-bold text-[#0040e0] bg-[#e5eeff] px-2 py-0.5 rounded-full">
                {selectedServiceIds.length} Selected
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 rounded-lg border border-slate-200 bg-slate-50 touch-scroll">
            {services.map((s) => {
              const isSelected = selectedServiceIds.includes(s.id);
              return (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => toggleService(s.id)}
                  className={`flex items-center justify-between p-2 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#0040e0] text-white border-[#0040e0] font-semibold shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100/60'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <ShieldCheck className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                    <span className="truncate">{s.name}</span>
                  </div>
                  {isSelected ? (
                    <Check className="w-3.5 h-3.5 text-white shrink-0 ml-1.5" />
                  ) : (
                    <Plus className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1.5" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Sales Rep</label>
          <select
            {...register('assignedToId')}
            className="flex h-9 w-full rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#0040e0] focus:ring-2 focus:ring-[#0040e0]/20"
          >
            <option value="">Select Sales Rep...</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.fullName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Detailed Scope & Requirements</label>
          <Textarea
            {...register('serviceScope')}
            placeholder="Describe regulatory requirements, target certification timelines, or jurisdiction specifics..."
            rows={3}
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 shrink-0">
          <Button type="button" variant="secondary" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
            Create Inquiry
          </Button>
        </div>
      </form>
    </Modal>
  );
}
