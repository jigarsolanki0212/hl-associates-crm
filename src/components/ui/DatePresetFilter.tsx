import * as React from 'react';
import {
  format,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
} from 'date-fns';
import { Calendar, Filter, X } from 'lucide-react';
import { Button } from './Button';

export type DatePreset =
  | 'ALL'
  | 'TODAY'
  | 'THIS_WEEK'
  | 'THIS_MONTH'
  | 'LAST_30_DAYS'
  | 'THIS_QUARTER'
  | 'THIS_YEAR'
  | 'CUSTOM';

export interface DateFilterValue {
  preset: DatePreset;
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
}

interface DatePresetFilterProps {
  value: DateFilterValue;
  onChange: (val: DateFilterValue) => void;
  className?: string;
}

export function getDateRangeFromPreset(preset: DatePreset): { startDate?: string; endDate?: string } {
  const now = new Date();
  const formatIso = (d: Date) => format(d, 'yyyy-MM-dd');

  switch (preset) {
    case 'TODAY':
      return { startDate: formatIso(now), endDate: formatIso(now) };
    case 'THIS_WEEK':
      return {
        startDate: formatIso(startOfWeek(now, { weekStartsOn: 1 })),
        endDate: formatIso(endOfWeek(now, { weekStartsOn: 1 })),
      };
    case 'THIS_MONTH':
      return {
        startDate: formatIso(startOfMonth(now)),
        endDate: formatIso(endOfMonth(now)),
      };
    case 'LAST_30_DAYS':
      return {
        startDate: formatIso(subDays(now, 30)),
        endDate: formatIso(now),
      };
    case 'THIS_QUARTER':
      return {
        startDate: formatIso(startOfQuarter(now)),
        endDate: formatIso(endOfQuarter(now)),
      };
    case 'THIS_YEAR':
      return {
        startDate: formatIso(startOfYear(now)),
        endDate: formatIso(endOfYear(now)),
      };
    case 'ALL':
    default:
      return { startDate: undefined, endDate: undefined };
  }
}

export function DatePresetFilter({ value, onChange, className = '' }: DatePresetFilterProps) {
  const [isCustom, setIsCustom] = React.useState(value.preset === 'CUSTOM');
  const [customStart, setCustomStart] = React.useState(value.startDate || '');
  const [customEnd, setCustomEnd] = React.useState(value.endDate || '');

  const presets: { id: DatePreset; label: string }[] = [
    { id: 'ALL', label: 'All Time' },
    { id: 'TODAY', label: 'Today' },
    { id: 'THIS_WEEK', label: 'This Week' },
    { id: 'THIS_MONTH', label: 'This Month' },
    { id: 'LAST_30_DAYS', label: 'Last 30 Days' },
    { id: 'THIS_QUARTER', label: 'This Quarter' },
    { id: 'THIS_YEAR', label: 'This Year' },
    { id: 'CUSTOM', label: 'Custom Range' },
  ];

  const handlePresetSelect = (p: DatePreset) => {
    if (p === 'CUSTOM') {
      setIsCustom(true);
      onChange({
        preset: 'CUSTOM',
        startDate: customStart || undefined,
        endDate: customEnd || undefined,
      });
    } else {
      setIsCustom(false);
      const range = getDateRangeFromPreset(p);
      onChange({
        preset: p,
        startDate: range.startDate,
        endDate: range.endDate,
      });
    }
  };

  const handleCustomApply = () => {
    onChange({
      preset: 'CUSTOM',
      startDate: customStart || undefined,
      endDate: customEnd || undefined,
    });
  };

  const handleReset = () => {
    setIsCustom(false);
    setCustomStart('');
    setCustomEnd('');
    onChange({ preset: 'ALL', startDate: undefined, endDate: undefined });
  };

  return (
    <div className={`flex flex-wrap items-center gap-2 text-xs ${className}`}>
      <div className="flex items-center gap-1.5 font-semibold text-slate-700 shrink-0">
        <Calendar className="w-3.5 h-3.5 text-[#0040e0]" />
        <span>Date:</span>
      </div>

      {/* Preset Pill Buttons */}
      <div className="flex items-center gap-1 overflow-x-auto py-0.5 max-w-full">
        {presets.map((p) => {
          const isActive = value.preset === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => handlePresetSelect(p.id)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all shrink-0 cursor-pointer border ${
                isActive
                  ? 'bg-[#0040e0] text-white border-[#0040e0] shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Custom Range Inputs */}
      {isCustom && (
        <div className="flex items-center gap-1.5 bg-blue-50/70 border border-blue-200/80 rounded-lg px-2.5 py-1 text-xs">
          <input
            type="date"
            value={customStart}
            onChange={(e) => setCustomStart(e.target.value)}
            className="bg-white border border-slate-300 rounded px-2 py-0.5 text-xs text-slate-800 font-medium focus:ring-1 focus:ring-[#0040e0] outline-none"
          />
          <span className="text-slate-500 font-bold">to</span>
          <input
            type="date"
            value={customEnd}
            onChange={(e) => setCustomEnd(e.target.value)}
            className="bg-white border border-slate-300 rounded px-2 py-0.5 text-xs text-slate-800 font-medium focus:ring-1 focus:ring-[#0040e0] outline-none"
          />
          <Button
            size="sm"
            onClick={handleCustomApply}
            className="bg-[#0040e0] text-white h-6 px-2 text-[11px]"
          >
            Apply
          </Button>
        </div>
      )}

      {/* Reset Indicator if filtered */}
      {value.preset !== 'ALL' && (
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-red-600 ml-auto cursor-pointer"
          title="Reset date filter"
        >
          <X className="w-3 h-3" /> Clear Filter
        </button>
      )}
    </div>
  );
}
