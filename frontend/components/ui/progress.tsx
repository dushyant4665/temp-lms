import * as React from 'react';
import { cn } from '@/lib/utils';

export function Progress({
  value,
  className
}: {
  value: number;
  className?: string;
}) {
  return (
    <div className={cn('h-2 w-full rounded-full bg-slate-100', className)}>
      <div
        className="h-2 rounded-full bg-slate-950 transition-all"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}
