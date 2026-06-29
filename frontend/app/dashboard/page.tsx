"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { backendUrl } from '@/lib/api';

type DashboardCourse = {
  courseId: string;
  title: string;
  description: string;
  totalLessons: number;
  completedLessons: number;
  progressText: string;
  continueLessonId: string | null;
};

export default function DashboardPage() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [courses, setCourses] = useState<DashboardCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const savedToken = localStorage.getItem('token') || '';

    if (!savedToken) {
      router.replace('/login');
      return;
    }

    setToken(savedToken);
  }, [router]);

  useEffect(() => {
    async function loadDashboard() {
      if (!token) {
        return;
      }

      setLoading(true);
      setError('');

      try {
        const response = await fetch(backendUrl('/api/v1/dashboard'), {
          cache: 'no-store',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        const data = await response.json();

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            router.replace('/login');
            return;
          }

          setError(data.message || 'Failed to load dashboard');
          setCourses([]);
          return;
        }

        setCourses(Array.isArray(data.data) ? data.data : []);
      } catch {
        setError('Server is not reachable right now');
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [router, token]);

  return (
    <main className="min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-6xl">
        <div className="mb-10 space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            Student Dashboard
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Your enrolled courses
          </h1>
          <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            This page loads with the Bearer token from localStorage and shows simple progress for each
            enrolled course.
          </p>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-slate-600">
            Loading dashboard...
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-red-700">
            {error}
          </div>
        ) : courses.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-slate-600">
            You are not enrolled in any course yet.
            <div className="mt-4">
              <Link
                href="/courses"
                className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Browse Courses
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => {
              const progress =
                course.totalLessons > 0
                  ? Math.round((course.completedLessons / course.totalLessons) * 100)
                  : 0;

              return (
                <article
                  key={course.courseId}
                  className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]"
                >
                  <h2 className="text-xl font-semibold text-slate-950">{course.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{course.description}</p>

                  <div className="mt-6 space-y-3">
                    <div className="flex items-center justify-between text-sm text-slate-600">
                      <span>{course.progressText}</span>
                      <span>{progress}%</span>
                    </div>

                    <div className="h-2 w-full rounded-full bg-slate-100">
                      <div
                        className="h-2 rounded-full bg-slate-950 transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {course.continueLessonId ? (
                    <Link
                      href={`/courses/${course.courseId}/lessons/${course.continueLessonId}`}
                      className="mt-6 inline-flex h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 text-sm font-medium text-slate-950 transition hover:border-slate-950 hover:bg-slate-50"
                    >
                      Continue Learning
                    </Link>
                  ) : null}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
