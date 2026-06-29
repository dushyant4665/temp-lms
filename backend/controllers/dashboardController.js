const { z } = require('zod');
const prisma = require('../config/db');
const { getDashboardOverview } = require('../services/dashboardService');

const getDashboardProgress = async (req, res) => {
  try {
    const report = await getDashboardOverview(req.user.userId);
    return res.json({ success: true, data: report });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Dashboard pipeline crash' });
  }
};

const completeLesson = async (req, res) => {
  try {
    const payload = z
      .object({
        lessonId: z.string().min(1)
      })
      .parse(req.body);

    const lesson = await prisma.lesson.findUnique({
      where: { id: payload.lessonId },
      include: {
        chapter: {
          select: {
            courseId: true
          }
        }
      }
    });

    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: req.user.userId,
          courseId: lesson.chapter.courseId
        }
      }
    });

    if (!enrollment) {
      return res.status(403).json({ success: false, message: 'Not enrolled in this course' });
    }

    await prisma.lessonCompletion.upsert({
      where: {
        enrollmentId_lessonId: {
          enrollmentId: enrollment.id,
          lessonId: lesson.id
        }
      },
      update: {
        completedAt: new Date()
      },
      create: {
        enrollmentId: enrollment.id,
        lessonId: lesson.id
      }
    });

    return res.json({ success: true, message: 'Lesson marked complete' });
  } catch (error) {
    return res.status(400).json({ success: false, message: 'Unable to update completion state' });
  }
};

module.exports = {
  completeLesson,
  getDashboardProgress
};
