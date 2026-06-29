import Link from 'next/link';
import { backendUrl } from '@/lib/api';

type Course = {
  id: string;
  title: string;
  description: string;
  price: number;
};

async function getCourses(): Promise<Course[]> {
  try {
    const response = await fetch(backendUrl('/api/v1/courses'), {
      cache: 'no-store'
    });

    const data = await response.json();

    if (!response.ok) {
      return [];
    }

    return Array.isArray(data.data) ? data.data : [];
  } catch {
    return [];
  }
}

export default async function CoursesPage() {
  const courses = await getCourses();

  return (
    <main className="min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-6xl">
        <div className="mb-10 space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            Public Catalogue
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Browse available courses
          </h1>
          <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            A simple course listing page that loads data directly from the Express backend.
          </p>
        </div>

        {courses.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white/80 p-8 text-slate-600">
            No courses found right now.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => (
              <article
                key={course.id}
                className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]"
              >
                <div className="mb-4 flex items-center justify-between gap-4">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                    Course
                  </span>
                  <span className="text-sm font-semibold text-slate-950">
                    ${course.price.toFixed(2)}
                  </span>
                </div>

                <h2 className="text-xl font-semibold text-slate-950">{course.title}</h2>
                <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">
                  {course.description}
                </p>

                <Link
                  href={`/courses/${course.id}`}
                  className="mt-6 inline-flex h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 text-sm font-medium text-slate-950 transition hover:border-slate-950 hover:bg-slate-50"
                >
                  View Details
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
