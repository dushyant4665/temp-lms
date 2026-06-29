import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <section className="mx-auto flex min-h-[calc(100vh-73px)] max-w-6xl flex-col justify-center px-4 py-20 sm:px-6 lg:px-8">
      <div className="max-w-3xl space-y-8">
        <div className="inline-flex rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm text-slate-600 shadow-sm">
          Take-home assessment build
        </div>
        <div className="space-y-4">
          <h1 className="text-5xl font-semibold tracking-tight text-slate-950 sm:text-7xl">
            A course platform with a real backend contract.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-slate-600">
            Browse courses, authenticate with email OTP, enroll securely, and track lesson
            progress from a Node.js data layer.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/courses">
            <Button size="lg">Explore courses</Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg">
              Login
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
