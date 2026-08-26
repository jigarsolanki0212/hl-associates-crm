'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Lock, Mail, ShieldCheck, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState('admin@hlassociates.com');
  const [password, setPassword] = React.useState('Password123!');
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error?.message || 'Invalid work email or password.');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid login credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen min-h-dvh bg-[#fbf9fa] flex flex-col justify-center items-center p-3 sm:p-6 py-6 sm:py-12 overflow-y-auto touch-scroll">
      <div className="w-full max-w-[420px] bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-card my-auto animate-fade-in">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center p-2 mb-3 ring-1 ring-slate-100">
            <img src="/logo.svg" alt="HL Associates" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">HL Associates CRM</h1>
          <p className="text-xs text-slate-500 mt-0.5">Enterprise Regulatory Compliance Suite</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-medium flex items-center gap-2 animate-fade-in">
              <div className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Work Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@hlassociates.com"
              leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full mt-2 bg-[#0040e0] text-white hover:bg-[#0035b8] font-bold"
            isLoading={isLoading}
          >
            {isLoading ? 'Signing In...' : 'Sign In to CRM'}
          </Button>
        </form>

        {/* Demo Accounts Quick-Fill */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Fast Login (Demo Accounts):</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => {
                setEmail('admin@hlassociates.com');
                setPassword('Password123!');
                setError(null);
              }}
              className="p-2.5 rounded-lg bg-slate-50/80 border border-slate-200 hover:bg-blue-50/80 hover:border-blue-200 active:bg-blue-100 text-left transition-colors cursor-pointer"
            >
              <div className="font-bold text-slate-800 text-xs">Admin Role</div>
              <div className="text-[11px] text-slate-500 truncate">Alex Mercer</div>
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail('sales@hlassociates.com');
                setPassword('Password123!');
                setError(null);
              }}
              className="p-2.5 rounded-lg bg-slate-50/80 border border-slate-200 hover:bg-blue-50/80 hover:border-blue-200 active:bg-blue-100 text-left transition-colors cursor-pointer"
            >
              <div className="font-bold text-slate-800 text-xs">Sales Role</div>
              <div className="text-[11px] text-slate-500 truncate">Sarah Jenkins</div>
            </button>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-slate-400 mt-4 sm:mt-6 pb-safe">
        &copy; {new Date().getFullYear()} HL Associates. Secure Compliance Portal.
      </div>
    </div>
  );
}
