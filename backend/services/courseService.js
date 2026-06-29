const prisma = require('../config/db');

function totalLessonsForCourse(course) {
  return course.chapters.reduce((count, chapter) => count + chapter.lessons.length, 0);
}

function completedIds(enrollment) {
  return new Set(enrollment?.completions?.map((item) => item.lessonId) || []);
}

function shapeCourse(course, enrollment = null) {
  const done = completedIds(enrollment);
  const totalLessons = totalLessonsForCourse(course);

  return {
    id: course.id,
    title: course.title,
    description: course.description,
    price: course.price,
    createdAt: course.createdAt,
    totalLessons,
    completedLessons: done.size,
    isEnrolled: Boolean(enrollment),
    progressText: `${done.size} of ${totalLessons} lessons complete`,
    continueLessonId:
      enrollment?.completions?.[0]?.lessonId ||
      course.chapters.flatMap((chapter) => chapter.lessons).find(Boolean)?.id ||
      null,
    chapters: course.chapters.map((chapter) => ({
      id: chapter.id,
      title: chapter.title,
      position: chapter.position,
      lessons: chapter.lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        position: lesson.position,
        isComplete: done.has(lesson.id)
      }))
    }))
  };
}

async function listCourses(userId = null) {
  const courses = await prisma.course.findMany({
    orderBy: [{ createdAt: 'desc' }, { title: 'asc' }],
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

  if (!userId) {
    return courses.map((course) => ({
      id: course.id,
      title: course.title,
      description: course.description,
      price: course.price
    }));
  }

  return courses.map((course) => shapeCourse(course));
}

async function getCourse(courseId, userId = null) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
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

  if (!course) {
    return null;
  }

  const enrollment = userId
    ? await prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId
          }
        },
        include: {
          completions: true
        }
      })
    : null;

  return shapeCourse(course, enrollment);
}

async function enroll(userId, courseId) {
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) {
    return null;
  }

  return prisma.enrollment.upsert({
    where: {
      userId_courseId: {
        userId,
        courseId
      }
    },
    update: {},
    create: {
      userId,
      courseId
    }
  });
}

async function getEnrolledLesson(userId, courseId, lessonId) {
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId
      }
    },
    include: {
      completions: true
    }
  });

  if (!enrollment) {
    return null;
  }

  const lesson = await prisma.lesson.findFirst({
    where: {
      id: lessonId,
      chapter: {
        courseId
      }
    },
    include: {
      chapter: {
        include: {
          course: true
        }
      }
    }
  });

  if (!lesson) {
    return null;
  }

  const done = completedIds(enrollment);

  return {
    lesson: {
      id: lesson.id,
      title: lesson.title,
      content: lesson.content,
      chapterTitle: lesson.chapter.title,
      courseTitle: lesson.chapter.course.title,
      isComplete: done.has(lesson.id)
    },
    enrollment
  };
}

async function completeLesson(userId, courseId, lessonId) {
  const lesson = await prisma.lesson.findFirst({
    where: {
      id: lessonId,
      chapter: {
        courseId
      }
    }
  });

  if (!lesson) {
    return { status: 'missing' };
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId
      }
    }
  });

  if (!enrollment) {
    return { status: 'forbidden' };
  }

  await prisma.lessonCompletion.upsert({
    where: {
      enrollmentId_lessonId: {
        enrollmentId: enrollment.id,
        lessonId
      }
    },
    update: {
      completedAt: new Date()
    },
    create: {
      enrollmentId: enrollment.id,
      lessonId
    }
  });

  return { status: 'ok' };
}

module.exports = {
  completeLesson,
  enroll,
  getCourse,
  getEnrolledLesson,
  listCourses,
  shapeCourse
};
