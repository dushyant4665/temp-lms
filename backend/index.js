require('dotenv').config();
const express = require('express');
const prisma = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();
app.use(express.json());

const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:3000';

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

app.get('/api/health', (req, res) => {
  return res.json({ ok: true, service: 'assignment-backend' });
});

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);

app.post('/api/dev/seed', async (req, res) => {
  try {
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

    const course = await prisma.course.create({
      data: {
        title: 'Production-Ready Full-Stack Systems',
        description: 'A practical course for building real apps with strong backend architecture.',
        price: 4999,
        chapters: {
          create: [
            {
              title: 'Architecture and Setup',
              position: 1,
              lessons: {
                create: [
                  {
                    title: 'Project Structure',
                    position: 1,
                    content: 'Separate UI, backend, and shared concerns so the app scales cleanly.'
                  },
                  {
                    title: 'Data Layer Design',
                    position: 2,
                    content: 'Keep Prisma and business rules in the backend, never in the frontend.'
                  }
                ]
              }
            },
            {
              title: 'Auth and Enrollment',
              position: 2,
              lessons: {
                create: [
                  {
                    title: 'Cookie Sessions',
                    position: 1,
                    content: 'Use httpOnly cookies so the browser keeps your session secure.'
                  },
                  {
                    title: 'Lesson Completion',
                    position: 2,
                    content: 'Persist completion as a relational record tied to enrollment.'
                  }
                ]
              }
            }
          ]
        }
      },
      include: {
        chapters: {
          include: {
            lessons: true
          }
        }
      }
    });

    const enrollment = await prisma.enrollment.create({
      data: {
        userId: user.id,
        courseId: course.id
      }
    });

    await prisma.lessonCompletion.create({
      data: {
        enrollmentId: enrollment.id,
        lessonId: course.chapters[0].lessons[0].id
      }
    });

    return res.json({
      success: true,
      message: 'Database seeding completed',
      data: { user, courseId: course.id }
    });
  } catch (error) {
    return res.status(500).json({ success: false, msg: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Decoupled Production Hub active on: http://localhost:${PORT}`));
