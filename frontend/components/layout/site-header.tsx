import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/courses" className="text-lg font-semibold tracking-tight text-slate-950">
          Assignment
        </Link>
        <nav className="flex items-center gap-3">
          <Link href="/courses" className="text-sm text-slate-600 hover:text-slate-950">
            Courses
          </Link>
          <Link href="/dashboard" className="text-sm text-slate-600 hover:text-slate-950">
            Dashboard
          </Link>
          <Link href="/login">
            <Button size="sm">Login</Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
