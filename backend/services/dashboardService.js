const prisma = require('../config/db');

async function getDashboardOverview(userId) {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    orderBy: { enrolledAt: 'desc' },
    include: {
      course: {
        include: {
          chapters: {
            include: {
              lessons: true
            }
          }
        }
      },
      completions: true
    }
  });

  return enrollments.map((enrollment) => {
    const totalLessons = enrollment.course.chapters.reduce(
      (count, chapter) => count + chapter.lessons.length,
      0
    );

    return {
      courseId: enrollment.course.id,
      title: enrollment.course.title,
      description: enrollment.course.description,
      totalLessons,
      completedLessons: enrollment.completions.length,
      progressText: `${enrollment.completions.length} of ${totalLessons} lessons complete`,
      continueLessonId:
        enrollment.completions[0]?.lessonId ||
        enrollment.course.chapters.flatMap((chapter) => chapter.lessons).find(Boolean)?.id ||
        null
    };
  });
}

module.exports = {
  getDashboardOverview
};
