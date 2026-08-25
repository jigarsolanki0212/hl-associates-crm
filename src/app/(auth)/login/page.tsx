'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Lock, Mail, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState('admin@hlassociates.com');
  const [password, setPassword] = React.useState('Password123!');
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
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error?.message || 'Login failed');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid login credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbf9fa] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-[420px] bg-white rounded-lg border border-slate-200 p-8 shadow-card">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded bg-[#0040e0] flex items-center justify-center text-white font-bold text-lg mb-3 shadow-sm">
            HL
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">HL Associates CRM</h1>
          <p className="text-xs text-slate-500 mt-1">Enterprise Regulatory Compliance Suite</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Work Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@hlassociates.com"
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">Password</label>
              <Link href="/forgot-password" className="text-xs text-[#0040e0] hover:underline font-medium">
                Forgot password?
              </Link>
            </div>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />
          </div>

          <Button type="submit" variant="primary" size="md" className="w-full mt-2" isLoading={isLoading}>
            Sign In to CRM
          </Button>
        </form>

        {/* Demo Credentials Quick Fill */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Demo Test Accounts:</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => {
                setEmail('admin@hlassociates.com');
                setPassword('Password123!');
              }}
              className="p-2 rounded bg-slate-50 border border-slate-200 hover:bg-blue-50 text-left transition-colors cursor-pointer"
            >
              <div className="font-bold text-slate-800">Admin Account</div>
              <div className="text-[11px] text-slate-500">Alex Mercer</div>
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail('sales@hlassociates.com');
                setPassword('Password123!');
              }}
              className="p-2 rounded bg-slate-50 border border-slate-200 hover:bg-blue-50 text-left transition-colors cursor-pointer"
            >
              <div className="font-bold text-slate-800">Sales Account</div>
              <div className="text-[11px] text-slate-500">Sarah Jenkins</div>
            </button>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-slate-400 mt-6">
        &copy; {new Date().getFullYear()} HL Associates. Secure Compliance Portal.
      </div>
    </div>
  );
}
