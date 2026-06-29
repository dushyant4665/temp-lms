"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { backendUrl } from '@/lib/api';

type EnrollButtonProps = {
  courseId: string;
  loginHref: string;
};

export function EnrollButton({ courseId, loginHref }: EnrollButtonProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleEnroll() {
    setPending(true);
    setError(null);
    const response = await fetch(backendUrl(`/api/courses/${courseId}/enroll`), {
      method: 'POST',
      credentials: 'include'
    });

    const result = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        router.push(loginHref);
        setPending(false);
        return;
      }

      setError(result.message || 'Unable to enroll');
      setPending(false);
      return;
    }

    router.refresh();
    setPending(false);
  }

  return (
    <div className="space-y-3">
      <Button onClick={handleEnroll} disabled={pending}>
        Enroll
      </Button>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
