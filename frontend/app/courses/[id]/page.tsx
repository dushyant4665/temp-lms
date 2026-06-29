"use client";

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { backendUrl } from '@/lib/api';

type Lesson = {
  id: string;
  title: string;
  position: number;
  isComplete: boolean;
};

type Chapter = {
  id: string;
  title: string;
  position: number;
  lessons: Lesson[];
};

type Course = {
  id: string;
  title: string;
  description: string;
  price: number;
  chapters: Chapter[];
};

type DashboardItem = {
  courseId: string;
  continueLessonId: string | null;
};

function getFirstLessonId(chapters: Chapter[]) {
  for (const chapter of chapters) {
    if (chapter.lessons.length > 0) {
      return chapter.lessons[0].id;
    }
  }

  return null;
}

function getStringParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] || '';
  }

  return value || '';
}

export default function CourseDetailPage() {
  const router = useRouter();
  const params = useParams<{ id?: string | string[] }>();
  const courseId = getStringParam(params.id);

  const [token, setToken] = useState(() => {
    if (typeof window === 'undefined') {
      return '';
    }

    return localStorage.getItem('token') || '';
  });
  const [course, setCourse] = useState<Course | null>(null);
  const [continueLessonId, setContinueLessonId] = useState<string | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setToken(localStorage.getItem('token') || '');
  }, []);

  useEffect(() => {
    async function loadPage() {
      if (!courseId) {
        return;
      }

      setLoading(true);
      setError('');

      try {
        const headers: HeadersInit = {};
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const courseResponse = await fetch(backendUrl(`/api/v1/courses/${courseId}`), {
          cache: 'no-store',
          headers,
          credentials: 'include'
        });

        const courseData = await courseResponse.json();

        if (!courseResponse.ok) {
          setError(courseData.message || 'Failed to load course');
          setCourse(null);
          return;
        }

        const loadedCourse = courseData.data as Course;
        setCourse(loadedCourse);

        if (!token) {
          setIsEnrolled(false);
          setContinueLessonId(getFirstLessonId(loadedCourse.chapters));
          return;
        }

        const dashboardResponse = await fetch(backendUrl('/api/v1/dashboard'), {
          cache: 'no-store',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        if (dashboardResponse.ok) {
          const dashboardData = await dashboardResponse.json();
          const enrolledCourses = Array.isArray(dashboardData.data) ? (dashboardData.data as DashboardItem[]) : [];
          const enrolledCourse = enrolledCourses.find((item) => item.courseId === courseId);

          if (enrolledCourse) {
            setIsEnrolled(true);
            setContinueLessonId(enrolledCourse.continueLessonId || getFirstLessonId(loadedCourse.chapters));
          } else {
            setIsEnrolled(false);
            setContinueLessonId(getFirstLessonId(loadedCourse.chapters));
          }
        } else if (dashboardResponse.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          setIsEnrolled(false);
          setContinueLessonId(getFirstLessonId(loadedCourse.chapters));
        } else {
          setIsEnrolled(false);
          setContinueLessonId(getFirstLessonId(loadedCourse.chapters));
        }
      } catch {
        setError('Server is not reachable right now');
      } finally {
        setLoading(false);
      }
    }

    loadPage();
  }, [courseId, token]);

  const isLoggedIn = Boolean(token);
  const firstLessonId = useMemo(() => (course ? getFirstLessonId(course.chapters) : null), [course]);

  async function handleEnroll() {
    if (!courseId) {
      setError('Invalid course link');
      return;
    }

    const currentToken = token || localStorage.getItem('token') || '';
    if (!currentToken) {
      router.push('/login');
      return;
    }

    setActionLoading(true);
    setError('');

    try {
      const response = await fetch(backendUrl(`/api/v1/courses/${courseId}/enroll`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentToken}`
        },
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          router.push('/login');
          return;
        }

        setError(data.message || 'Unable to enroll');
        return;
      }

      setIsEnrolled(true);
      setContinueLessonId(firstLessonId);
      router.refresh();
    } catch {
      setError('Could not enroll right now');
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <main className="min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-6xl">
        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-slate-600">
            Loading course...
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-red-700">
            {error}
          </div>
        ) : course ? (
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)] sm:p-8">
              <div className="mb-4 flex items-center justify-between gap-4">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                  Course Details
                </span>
                <span className="text-sm font-semibold text-slate-950">
                  ${course.price.toFixed(2)}
                </span>
              </div>

              <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                {course.title}
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
                {course.description}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                {!isLoggedIn ? (
                  <button
                    type="button"
                    onClick={() => router.push('/login')}
                    className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800"
                  >
                    Log in to Enroll
                  </button>
                ) : isEnrolled && continueLessonId ? (
                  <Link
                    href={`/courses/${course.id}/lessons/${continueLessonId}`}
                    className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800"
                  >
                    Continue Learning
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={handleEnroll}
                    disabled={actionLoading}
                    className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {actionLoading ? 'Enrolling...' : 'Enroll Now'}
                  </button>
                )}

                <Link
                  href="/courses"
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 text-sm font-medium text-slate-950 transition hover:border-slate-950 hover:bg-slate-50"
                >
                  Back to Courses
                </Link>
              </div>
            </article>

            <aside className="rounded-3xl border border-slate-200 bg-slate-950 p-6 text-white shadow-[0_18px_50px_rgba(15,23,42,0.12)] sm:p-8">
              <h2 className="text-xl font-semibold">Chapters and Lessons</h2>
              <div className="mt-6 space-y-5">
                {course.chapters.length > 0 ? (
                  course.chapters.map((chapter) => (
                    <div key={chapter.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-sm font-medium text-white/70">Chapter {chapter.position}</p>
                      <h3 className="mt-1 text-base font-semibold text-white">{chapter.title}</h3>
                      <div className="mt-4 space-y-2">
                        {chapter.lessons.map((lesson) => (
                          <div
                            key={lesson.id}
                            className="flex items-center justify-between rounded-xl bg-white/10 px-3 py-2 text-sm"
                          >
                            <span>{lesson.title}</span>
                            <span className="text-white/70">
                              {lesson.isComplete ? 'Complete' : 'Pending'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-white/70">No chapters found for this course.</p>
                )}
              </div>
            </aside>
          </div>
        ) : null}
      </section>
    </main>
  );
}
