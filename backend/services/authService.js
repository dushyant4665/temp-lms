const prisma = require('../config/db');
const { signSession } = require('../lib/jwt');
const { sendOtpEmail } = require('./mailer');

function cleanText(value) {
  return String(value || '').trim();
}

function cleanEmail(value) {
  return cleanText(value).toLowerCase();
}

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function requestOtp(email) {
  const safeEmail = cleanEmail(email);
  const otp = cleanText(process.env.MOCK_OTP) || generateOtp();
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

  const user = await prisma.user.upsert({
    where: { email: safeEmail },
    update: { otp, otpExpiresAt },
    create: { email: safeEmail, otp, otpExpiresAt }
  });

  const mailResult = await sendOtpEmail(safeEmail, otp);

  return { otp, user, mailSent: mailResult.sent, mailError: mailResult.error || null };
}

async function verifyOtp(email, otp) {
  const safeEmail = cleanEmail(email);
  const safeOtp = cleanText(otp);
  const user = await prisma.user.findUnique({ where: { email: safeEmail } });
  if (!user) {
    return null;
  }

  const isExpired = !user.otpExpiresAt || user.otpExpiresAt.getTime() < Date.now();
  if (isExpired || cleanText(user.otp) !== safeOtp) {
    return null;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { otp: null, otpExpiresAt: null }
  });

  return {
    token: signSession(user),
    user
  };
}

async function getCurrentUser(userId) {
  return prisma.user.findUnique({ where: { id: userId } });
}

module.exports = {
  getCurrentUser,
  requestOtp,
  verifyOtp
};
