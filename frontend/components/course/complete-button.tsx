"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { backendUrl } from '@/lib/api';

type CompleteButtonProps = {
  courseId: string;
  lessonId: string;
};

export function CompleteButton({ courseId, lessonId }: CompleteButtonProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleComplete() {
    setPending(true);
    setMessage(null);

    const response = await fetch(backendUrl(`/api/courses/${courseId}/lessons/${lessonId}/complete`), {
      method: 'POST',
      credentials: 'include'
    });
    const result = await response.json();

    if (!response.ok) {
      setMessage(result.message || 'Unable to save progress');
      setPending(false);
      return;
    }

    setMessage('Marked complete');
    setPending(false);
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <Button onClick={handleComplete} disabled={pending}>
        {pending ? 'Saving...' : 'Mark as complete'}
      </Button>
      {message ? <p className="text-sm text-slate-600">{message}</p> : null}
    </div>
  );
}
