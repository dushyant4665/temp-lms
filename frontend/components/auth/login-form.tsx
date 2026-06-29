"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { backendUrl } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function LoginForm({ nextPath = '/dashboard' }: { nextPath?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function requestOtp() {
    setLoading(true);
    setError(null);
    setStatus('');

    try {
      const response = await fetch(backendUrl('/api/auth/otp-request'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: email.trim() })
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || 'Unable to send OTP');
        return;
      }

      setStep('otp');
      setDevOtp(result.devOtp || null);
      setStatus(result.message || 'OTP sent');
    } catch {
      setError('Server is not reachable');
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp() {
    setLoading(true);
    setError(null);
    setStatus('');

    try {
      const response = await fetch(backendUrl('/api/auth/otp-verify'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: email.trim(), otp: otp.trim() })
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || 'Invalid code');
        return;
      }

      router.push(nextPath);
      router.refresh();
    } catch {
      setError('Server is not reachable');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="max-w-md border-slate-200 bg-white/90">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>
          Type your email, get a code, then enter that code to sign in.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        {step === 'otp' ? (
          <>
            <Input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(event) => setOtp(event.target.value)}
            />
            <Button onClick={verifyOtp} disabled={loading || !otp}>
              Verify OTP
            </Button>
          </>
        ) : (
          <Button onClick={requestOtp} disabled={loading || !email}>
            Request OTP
          </Button>
        )}

        {status ? <p className="text-sm text-emerald-700">{status}</p> : null}
        {devOtp ? <p className="text-sm text-amber-700">Dev OTP: {devOtp}</p> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </CardContent>
    </Card>
  );
}
