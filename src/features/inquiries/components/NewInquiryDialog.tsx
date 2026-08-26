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

const newInquirySchema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  contactName: z.string().min(2, 'Contact name is required'),
  contactTitle: z.string().optional(),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  source: z.enum(['EXHIBITION', 'REFERRAL', 'ORGANIC', 'WEBSITE', 'CONFERENCE', 'DIRECT_PARTNER', 'OTHER']),
  sourceDetail: z.string().optional(),
  serviceId: z.string().optional(),
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

  const onSubmit = async (data: NewInquiryFormData) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error?.message || 'Failed to create inquiry');
      }

      reset();
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
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Client Inquiry" size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
        {serverError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded font-medium">
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
              className="flex h-9 w-full rounded border border-slate-200 bg-white px-3 py-1 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-focusBlue"
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Regulatory Service</label>
            <select
              {...register('serviceId')}
              className="flex h-9 w-full rounded border border-slate-200 bg-white px-3 py-1 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-focusBlue"
            >
              <option value="">Select Service Area...</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Sales Rep</label>
            <select
              {...register('assignedToId')}
              className="flex h-9 w-full rounded border border-slate-200 bg-white px-3 py-1 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-focusBlue"
            >
              <option value="">Select Sales Rep...</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.fullName}
                </option>
              ))}
            </select>
          </div>
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
