'use client';

import * as React from 'react';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { formatCurrency } from '@/lib/utils/currency';
import { ImageUpload } from '@/components/ui/ImageUpload';
import {
  Plus,
  Edit2,
  Settings as SettingsIcon,
  Ban,
  Play,
  ShieldCheck,
  Award,
  Sliders,
  FileCheck2,
  Trash2,
} from 'lucide-react';

interface ServiceItem {
  id: string;
  code: string;
  name: string;
  category: string;
  description: string;
  detailedScope?: string | null;
  logoUrl?: string | null;
  suggestedPriceMin?: number | null;
  suggestedPriceMax?: number | null;
  pricingType: string;
  defaultDuration: number;
  durationUnit: string;
  isActive: boolean;
}

interface ServicesViewProps {
  initialServices: ServiceItem[];
}

export function ServicesView({ initialServices }: ServicesViewProps) {
  const [services, setServices] = React.useState<ServiceItem[]>(initialServices);
  const [editingService, setEditingService] = React.useState<ServiceItem | null>(null);
  const [pricingService, setPricingService] = React.useState<ServiceItem | null>(null);
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Form states
  const [name, setName] = React.useState('');
  const [code, setCode] = React.useState('');
  const [logoUrl, setLogoUrl] = React.useState('');
  const [category, setCategory] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [detailedScope, setDetailedScope] = React.useState('');
  const [priceMin, setPriceMin] = React.useState<number | ''>('');
  const [priceMax, setPriceMax] = React.useState<number | ''>('');
  const [deletingService, setDeletingService] = React.useState<ServiceItem | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDeleteService = async (id: string) => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/services/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        if (json.data?.deactivated) {
          // If deactivated due to historical references, update status in state
          setServices((prev) => prev.map((s) => (s.id === id ? { ...s, isActive: false } : s)));
        } else {
          setServices((prev) => prev.filter((s) => s.id !== id));
        }
        setDeletingService(null);
      }
    } catch (err) {
      console.error('Delete service error:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/services/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      const json = await res.json();
      if (json.success) {
        setServices((prev) =>
          prev.map((s) => (s.id === id ? { ...s, isActive: !currentStatus } : s))
        );
      }
    } catch (err) {
      console.error('Toggle service error:', err);
    }
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingService) {
        const res = await fetch(`/api/services/${editingService.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            code,
            logoUrl: logoUrl.trim() || null,
            category,
            description,
            detailedScope,
            suggestedPriceMin: priceMin !== '' ? Number(priceMin) : null,
            suggestedPriceMax: priceMax !== '' ? Number(priceMax) : null,
          }),
        });
        const json = await res.json();
        if (json.success) {
          setServices((prev) => prev.map((s) => (s.id === editingService.id ? json.data : s)));
          setEditingService(null);
        }
      } else {
        const res = await fetch('/api/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            code,
            logoUrl: logoUrl.trim() || null,
            category,
            description,
            detailedScope,
            suggestedPriceMin: priceMin !== '' ? Number(priceMin) : null,
            suggestedPriceMax: priceMax !== '' ? Number(priceMax) : null,
            pricingType: 'RANGE',
            defaultDuration: 12,
            durationUnit: 'MONTHS',
          }),
        });
        const json = await res.json();
        if (json.success) {
          setServices((prev) => [json.data, ...prev]);
          setIsAddOpen(false);
          setName('');
          setCode('');
          setLogoUrl('');
          setCategory('');
          setDescription('');
          setDetailedScope('');
          setPriceMin('');
          setPriceMax('');
        }
      }
    } catch (err) {
      console.error('Save service error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (service: ServiceItem) => {
    setEditingService(service);
    setName(service.name);
    setCode(service.code);
    setLogoUrl(service.logoUrl || '');
    setCategory(service.category);
    setDescription(service.description);
    setDetailedScope(service.detailedScope || '');
    setPriceMin(service.suggestedPriceMin || '');
    setPriceMax(service.suggestedPriceMax || '');
  };

  const getCategoryIcon = (cat: string) => {
    if (cat.includes('QMS') || cat.includes('ISO')) return <ShieldCheck className="w-5 h-5 text-[#0040e0]" />;
    if (cat.includes('Indian') || cat.includes('CDSCO')) return <FileCheck2 className="w-5 h-5 text-amber-600" />;
    if (cat.includes('European') || cat.includes('CE')) return <Award className="w-5 h-5 text-purple-600" />;
    return <Sliders className="w-5 h-5 text-slate-700" />;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Service Catalog & Scope Library
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure standardized compliance offerings, commercial pricing templates, and technical scopes.
          </p>
        </div>

        <Button onClick={() => setIsAddOpen(true)} variant="primary" size="md" className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-1.5" />
          <span>Add New Service</span>
        </Button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {services.map((service) => {
          const pricingDisplay =
            service.suggestedPriceMin && service.suggestedPriceMax
              ? `${formatCurrency(service.suggestedPriceMin)} - ${formatCurrency(service.suggestedPriceMax)}`
              : service.suggestedPriceMin
              ? formatCurrency(service.suggestedPriceMin)
              : 'Custom / Fixed';

          return (
            <div
              key={service.id}
              className={`bg-white rounded-lg border p-4 sm:p-6 shadow-card flex flex-col justify-between transition-all ${
                service.isActive ? 'border-slate-200' : 'border-slate-200 opacity-60 bg-slate-50/50'
              }`}
            >
              <div>
                {/* Header Icon + Code + Active Switch */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-white border border-slate-200 shadow-xs ring-1 ring-slate-100 flex items-center justify-center shrink-0 overflow-hidden p-1">
                      {service.logoUrl ? (
                        <img
                          src={service.logoUrl}
                          alt={service.name}
                          className="w-full h-full object-cover rounded-full"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        getCategoryIcon(service.category)
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 leading-tight">{service.name}</h3>
                      <div className="text-[11px] font-mono text-slate-500 mt-0.5">{service.code} • {service.category}</div>
                    </div>
                  </div>

                  <Switch
                    checked={service.isActive}
                    onCheckedChange={() => handleToggleActive(service.id, service.isActive)}
                  />
                </div>

                {/* Scope Description */}
                <p className="text-xs text-slate-600 leading-relaxed min-h-[44px] line-clamp-3 mb-4 sm:mb-5 font-normal">
                  {service.description}
                </p>

                {/* SUGGESTED PRICING box */}
                <div className="p-3 sm:p-3.5 rounded bg-slate-50/80 border border-slate-100 mb-4 sm:mb-5">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    SUGGESTED PRICING
                  </div>
                  <div className="text-sm font-bold text-slate-900">{pricingDisplay}</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                <Button
                  onClick={() => openEditModal(service)}
                  variant="secondary"
                  size="sm"
                  className="flex-1 text-xs"
                >
                  <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit
                </Button>

                <Button
                  onClick={() => setPricingService(service)}
                  variant="secondary"
                  size="sm"
                  className="flex-1 text-xs"
                >
                  <SettingsIcon className="w-3.5 h-3.5 mr-1" /> Pricing
                </Button>

                <Button
                  onClick={() => handleToggleActive(service.id, service.isActive)}
                  variant="secondary"
                  size="sm"
                  className="px-2.5 sm:px-3"
                  title={service.isActive ? 'Disable Service' : 'Enable Service'}
                >
                  {service.isActive ? (
                    <Ban className="w-3.5 h-3.5 text-red-500" />
                  ) : (
                    <Play className="w-3.5 h-3.5 text-emerald-600" />
                  )}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Service Modal */}
      <Modal
        isOpen={isAddOpen || !!editingService}
        onClose={() => {
          setIsAddOpen(false);
          setEditingService(null);
        }}
        title={editingService ? `Edit Service: ${editingService.name}` : 'Add New Regulatory Service'}
        size="md"
      >
        <form onSubmit={handleSaveService} className="space-y-3.5 sm:space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Service Title *</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. CDSCO Medical Device Registration"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Service Code *</label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. CDSCO-MD-01"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Category *</label>
              <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Medical Devices"
                required
              />
            </div>
          </div>

          {/* Service Brand / Authority Logo Upload */}
          <ImageUpload
            label="Regulatory Authority / Service Icon (Optional)"
            value={logoUrl}
            onChange={(url: string) => setLogoUrl(url)}
            fallbackText={name || 'Service'}
            shape="circle"
          />

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Commercial Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Summary of regulatory coverage..."
              rows={2}
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Standard Scope Deliverables</label>
            <Textarea
              value={detailedScope}
              onChange={(e) => setDetailedScope(e.target.value)}
              placeholder="Detailed dossiers, lab testing, technical file reviews..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Min Price (₹)</label>
              <Input
                type="number"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value ? Number(e.target.value) : '')}
                placeholder="e.g. 150000"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Max Price (₹)</label>
              <Input
                type="number"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value ? Number(e.target.value) : '')}
                placeholder="e.g. 350000"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                setIsAddOpen(false);
                setEditingService(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
              {editingService ? 'Save Changes' : 'Create Service'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Pricing Tier Detail Modal */}
      {pricingService && (
        <Modal
          isOpen={!!pricingService}
          onClose={() => setPricingService(null)}
          title={`Pricing Configuration: ${pricingService.name}`}
          size="sm"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded bg-slate-50 border border-slate-200">
              <div className="text-slate-500 font-semibold mb-1">Current Pricing Structure</div>
              <div className="font-bold text-base text-slate-900">
                {pricingService.suggestedPriceMin && pricingService.suggestedPriceMax
                  ? `${formatCurrency(pricingService.suggestedPriceMin)} - ${formatCurrency(pricingService.suggestedPriceMax)}`
                  : pricingService.suggestedPriceMin
                  ? formatCurrency(pricingService.suggestedPriceMin)
                  : 'Custom Quotation'}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Standard Engagement Duration: {pricingService.defaultDuration} {pricingService.durationUnit.toLowerCase()}
              </div>
            </div>

            <div className="p-3 bg-blue-50 rounded border border-blue-100 text-slate-600 text-[11px]">
              Pricing figures are suggested defaults populated into newly generated proformas. Commercial values are snapshotted upon invoice creation.
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={() => setPricingService(null)} variant="primary" size="sm">
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
