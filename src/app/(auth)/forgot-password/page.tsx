'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Mail, ArrowLeft, CheckCircle2, ShieldAlert, KeyRound } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState('');
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to submit reset request');
      }

      setIsSubmitted(true);
    } catch (err: any) {
      setError(err?.message || 'An error occurred while submitting request.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen min-h-dvh bg-[#fbf9fa] flex flex-col justify-center items-center p-4 py-8 overflow-y-auto touch-scroll">
      <div className="w-full max-w-[440px] bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-card my-auto animate-fade-in">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center p-2 mb-3 ring-1 ring-slate-100">
            <img src="/logo.svg" alt="HL Associates" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Account Recovery</h1>
          <p className="text-xs text-slate-500 mt-1">Enterprise Password Reset Assistance</p>
        </div>

        {isSubmitted ? (
          <div className="text-center space-y-4 py-2 animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto ring-4 ring-emerald-50/50">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className="font-bold text-sm text-slate-900">Recovery Instructions Dispatched</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                If an active account exists for <span className="font-bold text-slate-900">{email}</span>, a secure password recovery dispatch has been initiated.
              </p>
            </div>

            <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl text-left text-xs text-slate-700 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-[#0040e0]">
                <KeyRound className="w-4 h-4 shrink-0" />
                <span>How Password Reset Works:</span>
              </div>
              <ul className="list-disc list-inside text-[11px] text-slate-600 space-y-1 pl-1">
                <li>Check your corporate inbox for a reset verification notice.</li>
                <li>System Administrators can also reset your credentials directly via <strong>Settings &gt; Team Management</strong>.</li>
              </ul>
            </div>

            <div className="pt-2">
              <Link href="/login">
                <Button variant="primary" size="md" className="w-full bg-[#0040e0] text-white">
                  Return to Login Screen
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-medium flex items-center gap-2 animate-fade-in">
                <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Corporate Email Address</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@hlassociates.com"
                leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                required
                autoFocus
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Enter your registered corporate email to initiate account verification.
              </p>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full bg-[#0040e0] text-white hover:bg-[#0035b8] font-bold"
              isLoading={isLoading}
            >
              {isLoading ? 'Processing Request...' : 'Send Recovery Instructions'}
            </Button>

            <div className="text-center pt-2">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs text-[#0040e0] hover:underline font-semibold"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>

      <div className="text-center text-xs text-slate-400 mt-4 pb-safe">
        &copy; {new Date().getFullYear()} HL Associates. Secure Compliance Portal.
      </div>
    </div>
  );
}
