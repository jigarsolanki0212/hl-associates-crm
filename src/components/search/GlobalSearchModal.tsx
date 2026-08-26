'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Inbox,
  Users,
  Briefcase,
  FileText,
  ArrowRight,
  Loader2,
  X,
  Sparkles,
  TrendingUp,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';

interface SearchResult {
  id: string;
  type: 'INQUIRY' | 'CLIENT' | 'SERVICE' | 'PROFORMA';
  title: string;
  subtitle: string;
  status?: string;
  link: string;
}

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Auto-focus and reset query on modal open
  React.useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 50);
    } else {
      // Clear query on close so next open starts fresh
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Debounced live API search
  React.useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSelectedIndex(0);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        if (data.success) {
          setResults(data.data || []);
          setSelectedIndex(0);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Keyboard navigation (ArrowUp, ArrowDown, Enter, ESC)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (results.length > 0 ? (prev + 1) % results.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (results.length > 0 ? (prev - 1 + results.length) % results.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results.length > 0 && results[selectedIndex]) {
        handleSelect(results[selectedIndex].link);
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleSelect = (link: string) => {
    setQuery('');
    setResults([]);
    onClose();
    router.push(link);
  };

  const handleApplyPreset = (term: string) => {
    setQuery(term);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'INQUIRY':
        return <Inbox className="w-4 h-4 text-[#0040e0]" />;
      case 'CLIENT':
        return <Users className="w-4 h-4 text-emerald-600" />;
      case 'SERVICE':
        return <Briefcase className="w-4 h-4 text-purple-600" />;
      case 'PROFORMA':
        return <FileText className="w-4 h-4 text-amber-600" />;
      default:
        return <Search className="w-4 h-4 text-slate-400" />;
    }
  };

  const quickSearchSuggestions = [
    { label: 'ISO 13485 QMS', query: 'ISO 13485' },
    { label: 'CDSCO License', query: 'CDSCO' },
    { label: 'CE / EU MDR', query: 'CE / EU MDR' },
    { label: 'FDA 510(k)', query: 'FDA 510' },
    { label: 'Vanguard', query: 'Vanguard' },
    { label: 'Apex Global', query: 'Apex' },
  ];

  const quickNavigationLinks = [
    { label: 'Inquiries Pipeline', link: '/inquiries', icon: Inbox, desc: 'Manage commercial leads' },
    { label: 'Client Directory', link: '/clients', icon: Users, desc: 'Active accounts & 360° view' },
    { label: 'Renewals & Milestones', link: '/renewals', icon: Clock, desc: '60d, 30d, 15d license expiry' },
    { label: 'Services Catalog', link: '/services', icon: Briefcase, desc: 'Regulatory service scopes' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="space-y-3.5">
        {/* Search Input Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search inquiries, clients, services, proformas..."
            className="w-full h-12 pl-11 pr-10 rounded-lg bg-slate-50 border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:outline-none focus:border-[#0040e0] focus:ring-2 focus:ring-[#0040e0]/20 focus:bg-white shadow-xs"
          />
          {isLoading ? (
            <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-[#0040e0]" />
          ) : query ? (
            <button
              onClick={() => {
                setQuery('');
                setResults([]);
                inputRef.current?.focus();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              aria-label="Clear search input"
            >
              <X className="w-4 h-4" />
            </button>
          ) : null}
        </div>

        {/* Results or Instant Suggestions */}
        <div className="max-h-[380px] overflow-y-auto space-y-1.5 pt-1 touch-scroll">
          {/* Active Search Results */}
          {query.trim() && (
            <>
              {isLoading && (
                <div className="space-y-2 py-1">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={`search-skel-${i}`} className="p-3 rounded-lg border border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
                        <div className="space-y-1.5 flex-1 max-w-[200px]">
                          <Skeleton className="h-3.5 w-full" />
                          <Skeleton className="h-2.5 w-2/3" />
                        </div>
                      </div>
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                  ))}
                </div>
              )}

              {results.length === 0 && !isLoading && (
                <div className="text-center py-10 text-slate-400 text-xs">
                  No matching records found for <span className="font-semibold text-slate-700">&ldquo;{query}&rdquo;</span>.
                </div>
              )}

              {results.map((item, index) => (
                <button
                  key={`${item.type}-${item.id}`}
                  onClick={() => handleSelect(item.link)}
                  className={`w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between group cursor-pointer ${
                    selectedIndex === index
                      ? 'bg-blue-50/80 border-[#0040e0]/40 shadow-xs'
                      : 'border-transparent hover:bg-slate-50 hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded bg-white border border-slate-100 shadow-2xs shrink-0">
                      {getIcon(item.type)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 truncate">{item.title}</span>
                        {item.status && <Badge variant="normal">{item.status}</Badge>}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">{item.subtitle}</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#0040e0] shrink-0 transition-transform group-hover:translate-x-0.5" />
                </button>
              ))}
            </>
          )}

          {/* Empty Search: Instant Suggestions & Shortcuts */}
          {!query.trim() && (
            <div className="space-y-4 py-2">
              {/* Quick Search Chips */}
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#0040e0]" />
                  <span>Suggested Searches</span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {quickSearchSuggestions.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => handleApplyPreset(item.query)}
                      className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 hover:bg-[#e5eeff] text-slate-700 hover:text-[#0040e0] border border-slate-200 transition-colors cursor-pointer"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Navigation Links */}
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Quick Navigation</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {quickNavigationLinks.map((nav) => {
                    const Icon = nav.icon;
                    return (
                      <button
                        key={nav.label}
                        onClick={() => handleSelect(nav.link)}
                        className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white hover:border-[#0040e0]/40 transition-all text-left group cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="w-4 h-4 text-slate-500 group-hover:text-[#0040e0] shrink-0" />
                          <div>
                            <div className="text-xs font-bold text-slate-900 group-hover:text-[#0040e0] transition-colors">
                              {nav.label}
                            </div>
                            <div className="text-[10px] text-slate-400">{nav.desc}</div>
                          </div>
                        </div>
                        <ExternalLink className="w-3 h-3 text-slate-300 group-hover:text-[#0040e0] shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">↑</kbd>{' '}
              <kbd className="px-1 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">↓</kbd> to navigate
            </span>
            <span>
              <kbd className="px-1 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">↵</kbd> to select
            </span>
          </div>
          <span>
            <kbd className="px-1 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">ESC</kbd> to close
          </span>
        </div>
      </div>
    </Modal>
  );
}
