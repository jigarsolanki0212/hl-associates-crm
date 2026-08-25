'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Search, Inbox, Users, Briefcase, FileText, ArrowRight, Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';

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

  // Debounced search
  React.useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        if (data.success) {
          setResults(data.data || []);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Keyboard shortcut listener for CMD+K / CTRL+K
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Triggered externally by parent state or shortcut
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelect = (link: string) => {
    onClose();
    router.push(link);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'INQUIRY': return <Inbox className="w-4 h-4 text-blue-600" />;
      case 'CLIENT': return <Users className="w-4 h-4 text-emerald-600" />;
      case 'SERVICE': return <Briefcase className="w-4 h-4 text-purple-600" />;
      case 'PROFORMA': return <FileText className="w-4 h-4 text-amber-600" />;
      default: return <Search className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="space-y-4">
        {/* Search Input Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search inquiries by ID or company, clients, services, proformas..."
            className="w-full h-12 pl-11 pr-4 rounded bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-focusBlue focus:bg-white transition-all"
          />
          {isLoading && (
            <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-slate-400" />
          )}
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto space-y-1.5 pt-1">
          {query.trim() && !isLoading && results.length === 0 && (
            <div className="text-center py-10 text-slate-400 text-xs">
              No matching records found for &ldquo;{query}&rdquo;
            </div>
          )}

          {!query.trim() && (
            <div className="text-center py-8 text-slate-400 text-xs">
              Type keywords to search across all regulatory records, inquiries, and clients.
            </div>
          )}

          {results.map((item) => (
            <button
              key={`${item.type}-${item.id}`}
              onClick={() => handleSelect(item.link)}
              className="w-full text-left p-3 rounded hover:bg-slate-50 border border-transparent hover:border-slate-200 flex items-center justify-between transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded bg-slate-100 group-hover:bg-white shrink-0">
                  {getIcon(item.type)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 truncate">{item.title}</span>
                    {item.status && <Badge variant="normal">{item.status}</Badge>}
                  </div>
                  <div className="text-xs text-slate-500 truncate">{item.subtitle}</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#0040e0] shrink-0" />
            </button>
          ))}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-[11px] text-slate-400">
          <span>Navigate with mouse or keyboard</span>
          <div className="flex items-center gap-2">
            <span>ESC to close</span>
          </div>
        </div>
      </div>
    </Modal>
  );
}
