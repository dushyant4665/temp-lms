const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/authController');

router.post('/otp-request', authCtrl.requestOtp);
router.post('/otp-verify', authCtrl.verifyOtp);
router.post('/login', authCtrl.login);
router.get('/me', authCtrl.getSession);
router.post('/logout', authCtrl.logout);

module.exports = router; // Yeh line mandatory hai!
