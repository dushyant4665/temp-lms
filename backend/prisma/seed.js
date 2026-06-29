require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  await prisma.lessonCompletion.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.chapter.deleteMany();
  await prisma.course.deleteMany();
  await prisma.user.deleteMany();

  const user = await prisma.user.create({
    data: {
      email: 'student@assignment.dev',
      name: 'Assignment Student'
    }
  });

  const courses = [
    {
      title: 'Next.js App Router Fundamentals',
      description: 'Build clean server and client components, routes, and data fetching flows.',
      price: 1499,
      chapters: [
        {
          title: 'App Router Basics',
          lessons: [
            {
              title: 'Folder Structure and Routing',
              content: 'Learn how the App Router maps folders to routes and how to keep the project simple.'
            },
            {
              title: 'Server Components vs Client Components',
              content: 'Understand when to render on the server and when to use client-side hooks.'
            }
          ]
        },
        {
          title: 'Data Fetching',
          lessons: [
            {
              title: 'Server Side Fetching',
              content: 'Fetch data directly inside async server components without adding extra complexity.'
            },
            {
              title: 'Client Fetching with Hooks',
              content: 'Use useEffect and fetch for simple client-side workflows like login and dashboard refresh.'
            }
          ]
        }
      ]
    },
    {
      title: 'Node.js and Express API Design',
      description: 'Create clean REST APIs with auth, validation, and predictable controller structure.',
      price: 1299,
      chapters: [
        {
          title: 'API Structure',
          lessons: [
            {
              title: 'Routes, Controllers, and Services',
              content: 'Keep the request handling thin and move the core logic into readable service functions.'
            },
            {
              title: 'Validation and Error Handling',
              content: 'Use simple validation and return clear HTTP errors so the frontend can react properly.'
            }
          ]
        },
        {
          title: 'Authentication',
          lessons: [
            {
              title: 'JWT Sessions',
              content: 'Generate JWT tokens after login and use them in Authorization headers for protected APIs.'
            },
            {
              title: 'Middleware Protection',
              content: 'Check tokens in middleware before allowing access to dashboard or lesson routes.'
            }
          ]
        }
      ]
    },
    {
      title: 'Prisma and PostgreSQL for Real Apps',
      description: 'Model relations, seed nested data, and query your learning platform cleanly.',
      price: 1399,
      chapters: [
        {
          title: 'Schema Design',
          lessons: [
            {
              title: 'One-to-Many Relations',
              content: 'Model courses, chapters, and lessons in a way that is easy to query and maintain.'
            },
            {
              title: 'Unique Constraints',
              content: 'Use composite unique keys for enrollments and completion records to prevent duplicates.'
            }
          ]
        },
        {
          title: 'Data Seeding',
          lessons: [
            {
              title: 'Nested Creates',
              content: 'Seed realistic course hierarchies using nested create calls instead of scattered inserts.'
            },
            {
              title: 'Clean Resets',
              content: 'Delete dependent tables in the right order before seeding fresh data.'
            }
          ]
        }
      ]
    },
    {
      title: 'Frontend State with React Hooks',
      description: 'Manage login, dashboard, and lesson states without Redux or Zustand.',
      price: 1199,
      chapters: [
        {
          title: 'Basic Hook Patterns',
          lessons: [
            {
              title: 'useState for Form State',
              content: 'Keep forms simple by storing values directly in local component state.'
            },
            {
              title: 'useEffect for Side Effects',
              content: 'Fetch data after mount and respond to route changes with predictable side effects.'
            }
          ]
        },
        {
          title: 'Local Storage and Redirects',
          lessons: [
            {
              title: 'Persisting Session Data',
              content: 'Store token and userId in localStorage after login so the frontend can stay in sync.'
            },
            {
              title: 'Protected Navigation',
              content: 'Redirect users to login if the token is missing and keep the dashboard guarded.'
            }
          ]
        }
      ]
    },
    {
      title: 'Deployment and Production Readiness',
      description: 'Learn the small checks that make a take-home app feel complete and stable.',
      price: 999,
      chapters: [
        {
          title: 'Environment Setup',
          lessons: [
            {
              title: 'Managing .env Files',
              content: 'Keep local secrets separate and make sure backend and frontend env values match.'
            },
            {
              title: 'Dockerized PostgreSQL',
              content: 'Run Postgres in Docker so the backend has a reliable database during local development.'
            }
          ]
        },
        {
          title: 'Testing the Flow',
          lessons: [
            {
              title: 'Manual API Verification',
              content: 'Hit login, courses, dashboard, and completion endpoints in order to verify the whole flow.'
            },
            {
              title: 'Common Runtime Bugs',
              content: 'Fix stale build caches, wrong ports, and broken env values before submission.'
            }
          ]
        }
      ]
    }
  ];

  for (const courseData of courses) {
    await prisma.course.create({
      data: {
        title: courseData.title,
        description: courseData.description,
        price: courseData.price,
        chapters: {
          create: courseData.chapters.map((chapter, chapterIndex) => ({
            title: chapter.title,
            position: chapterIndex + 1,
            lessons: {
              create: chapter.lessons.map((lesson, lessonIndex) => ({
                title: lesson.title,
                content: lesson.content,
                position: lessonIndex + 1
              }))
            }
          }))
        }
      }
    });
  }

  const firstCourse = await prisma.course.findFirst({
    orderBy: { createdAt: 'asc' },
    include: {
      chapters: {
        orderBy: { position: 'asc' },
        include: {
          lessons: {
            orderBy: { position: 'asc' }
          }
        }
      }
    }
  });

  if (firstCourse) {
    const enrollment = await prisma.enrollment.create({
      data: {
        userId: user.id,
        courseId: firstCourse.id
      }
    });

    const firstLesson = firstCourse.chapters[0]?.lessons[0];
    if (firstLesson) {
      await prisma.lessonCompletion.create({
        data: {
          enrollmentId: enrollment.id,
          lessonId: firstLesson.id
        }
      });
    }
  }

  console.log('Seed complete. 5 courses created.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
