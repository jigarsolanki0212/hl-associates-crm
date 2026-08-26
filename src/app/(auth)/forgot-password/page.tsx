'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState('');
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#fbf9fa] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-[420px] bg-white rounded-lg border border-slate-200 p-8 shadow-card">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center p-2 mb-3">
            <img src="/logo.svg" alt="HL Associates" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Reset Password</h1>
          <p className="text-xs text-slate-500 mt-1">Enter your registered corporate email address</p>
        </div>

        {isSubmitted ? (
          <div className="text-center space-y-4 py-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-xs text-slate-600">
              If an active account exists for <strong>{email}</strong>, a secure password reset link has been dispatched.
            </p>
            <Link href="/login">
              <Button variant="secondary" size="md" className="w-full mt-2">
                Return to Login
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Corporate Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@hlassociates.com"
                leftIcon={<Mail className="w-4 h-4" />}
                required
              />
            </div>

            <Button type="submit" variant="primary" size="md" className="w-full" isLoading={isLoading}>
              Send Reset Link
            </Button>

            <div className="text-center pt-2">
              <Link href="/login" className="inline-flex items-center gap-1.5 text-xs text-[#0040e0] hover:underline font-medium">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
