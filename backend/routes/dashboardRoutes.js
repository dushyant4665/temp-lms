const express = require('express');
const router = express.Router();
const dashboardCtrl = require('../controllers/dashboardController');
const requireAuth = require('../middleware/authMiddleware');

router.get('/', requireAuth, dashboardCtrl.getDashboardProgress);
router.post('/complete-lesson', requireAuth, dashboardCtrl.completeLesson);

module.exports = router;
