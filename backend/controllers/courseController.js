const { z } = require('zod');
const { getTokenFromRequest, verifySession } = require('../lib/jwt');
const {
  completeLesson,
  enroll,
  getCourse,
  getEnrolledLesson,
  listCourses
} = require('../services/courseService');

async function getUserId(req) {
  const token = getTokenFromRequest(req);
  if (!token) {
    return null;
  }

  try {
    const payload = verifySession(token);
    return payload.userId;
  } catch (error) {
    return null;
  }
}

const getCourses = async (req, res) => {
  try {
    const userId = await getUserId(req);
    const courses = await listCourses(userId);
    return res.json({ success: true, data: courses });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to load courses' });
  }
};

const getCourseById = async (req, res) => {
  try {
    const params = z.object({ id: z.string().min(1) }).parse(req.params);
    const userId = await getUserId(req);
    const course = await getCourse(params.id, userId);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    return res.json({
      success: true,
      data: course
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: 'Invalid course identifier' });
  }
};

const enrollCourse = async (req, res) => {
  try {
    const params = z.object({ id: z.string().min(1) }).parse(req.params);
    const userId = await getUserId(req);

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Please log in to enroll' });
    }

    const enrollment = await enroll(userId, params.id);

    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    return res.json({
      success: true,
      data: {
        courseId: enrollment.courseId,
        enrollmentId: enrollment.id
      }
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: 'Unable to enroll' });
  }
};

const getLesson = async (req, res) => {
  try {
    const params = z.object({
      id: z.string().min(1),
      lessonId: z.string().min(1)
    }).parse(req.params);
    const userId = await getUserId(req);

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Please log in to continue' });
    }

    const lesson = await getEnrolledLesson(userId, params.id, params.lessonId);
    if (!lesson) {
      return res.status(403).json({ success: false, message: 'You must be enrolled to view this lesson' });
    }

    return res.json({ success: true, data: lesson.lesson });
  } catch (error) {
    return res.status(400).json({ success: false, message: 'Unable to load lesson' });
  }
};

const markLessonComplete = async (req, res) => {
  try {
    const params = z.object({
      id: z.string().min(1),
      lessonId: z.string().min(1)
    }).parse(req.params);
    const userId = await getUserId(req);

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Please log in to continue' });
    }

    const result = await completeLesson(userId, params.id, params.lessonId);

    if (result.status === 'missing') {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    if (result.status === 'forbidden') {
      return res.status(403).json({ success: false, message: 'Not enrolled in this course' });
    }

    return res.json({ success: true, message: 'Lesson marked complete' });
  } catch (error) {
    return res.status(400).json({ success: false, message: 'Unable to update completion state' });
  }
};

module.exports = {
  enrollCourse,
  getCourseById,
  getCourses,
  getLesson,
  markLessonComplete
};
