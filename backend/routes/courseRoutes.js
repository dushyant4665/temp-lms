const express = require('express');
const router = express.Router();
const courseCtrl = require('../controllers/courseController');

router.get('/', courseCtrl.getCourses);
router.get('/:id', courseCtrl.getCourseById);
router.post('/:id/enroll', courseCtrl.enrollCourse);
router.get('/:id/lessons/:lessonId', courseCtrl.getLesson);
router.post('/:id/lessons/:lessonId/complete', courseCtrl.markLessonComplete);

module.exports = router; // Yeh line mandatory hai!
