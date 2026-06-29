"use client";

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { backendUrl } from '@/lib/api';

type Lesson = {
  id: string;
  title: string;
  content: string;
  chapterTitle: string;
  courseTitle: string;
  isComplete: boolean;
};

export default function LessonViewer() {
  const router = useRouter();
  const params = useParams<{ id: string; lessonId: string }>();
  const courseId = params.id;
  const lessonId = params.lessonId;

  const [token, setToken] = useState('');
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const savedToken = localStorage.getItem('token') || '';

    if (!savedToken) {
      router.replace('/login');
      return;
    }

    setToken(savedToken);
  }, [router]);

  useEffect(() => {
    async function loadLesson() {
      if (!courseId || !lessonId || !token) {
        return;
      }

      setLoading(true);
      setError('');

      try {
        const response = await fetch(
          backendUrl(`/api/v1/courses/${courseId}/lessons/${lessonId}`),
          {
            cache: 'no-store',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            credentials: 'include'
          }
        );

        const data = await response.json();

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            router.replace('/login');
            return;
          }

          setError(data.message || 'Failed to load lesson');
          setLesson(null);
          return;
        }

        setLesson(data.data || null);
      } catch {
        setError('Server is not reachable right now');
      } finally {
        setLoading(false);
      }
    }

    loadLesson();
  }, [courseId, lessonId, router, token]);

  async function handleComplete() {
    if (!lessonId || !token) {
      return;
    }

    setSaving(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch(backendUrl('/api/v1/dashboard/complete-lesson'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({
          lessonId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          router.replace('/login');
          return;
        }

        setError(data.message || 'Could not mark lesson as complete');
        return;
      }

      setMessage(data.message || 'Lesson marked complete');
      setLesson((current) => (current ? { ...current, isComplete: true } : current));
      router.refresh();
    } catch {
      setError('Could not save progress right now');
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-4xl">
        <div className="mb-6">
          <Link href={`/courses/${courseId}`} className="text-sm font-medium text-slate-600 hover:text-slate-950">
            Back to course
          </Link>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-slate-600">
            Loading lesson...
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-red-700">
            {error}
          </div>
        ) : lesson ? (
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)] sm:p-8">
            <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-slate-600">
              <span>{lesson.courseTitle}</span>
              <span>-</span>
              <span>{lesson.chapterTitle}</span>
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              {lesson.title}
            </h1>

            <div className="mt-6 whitespace-pre-line rounded-2xl bg-slate-50 p-5 text-sm leading-7 text-slate-700 sm:text-base">
              {lesson.content}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleComplete}
                disabled={saving || lesson.isComplete}
                className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {lesson.isComplete ? 'Completed' : saving ? 'Saving...' : 'Mark as complete'}
              </button>

              {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
            </div>
          </article>
        ) : null}
      </section>
    </main>
  );
}
