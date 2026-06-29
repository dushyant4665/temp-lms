const { z } = require('zod');
const prisma = require('../config/db');
const authService = require('../services/authService');
const {
  buildAuthCookie,
  clearAuthCookie,
  getTokenFromRequest,
  signSession,
  verifySession
} = require('../lib/jwt');

const login = async (req, res) => {
  try {
    const payload = z
      .object({
        email: z.string().email().trim().toLowerCase(),
        password: z.string().min(1)
      })
      .parse(req.body);

    const user = await prisma.user.upsert({
      where: { email: payload.email },
      update: {},
      create: {
        email: payload.email
      }
    });

    const token = signSession(user);
    res.setHeader('Set-Cookie', buildAuthCookie(token));

    return res.json({
      success: true,
      token,
      userId: user.id,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    return res.status(error instanceof z.ZodError ? 400 : 500).json({
      success: false,
      message: error instanceof z.ZodError ? 'Please enter email and password' : 'Unable to log in'
    });
  }
};

const requestOtp = async (req, res) => {
  try {
    const payload = z.object({
      email: z.string().email().trim().toLowerCase()
    }).parse(req.body);

    const { otp, mailSent, mailError } = await authService.requestOtp(payload.email);

    return res.json({
      success: true,
      message: mailSent ? 'OTP sent to email' : 'OTP generated in dev mode',
      devOtp: process.env.NODE_ENV === 'production' ? undefined : otp,
      mailSent,
      mailError: process.env.NODE_ENV === 'production' ? undefined : mailError
    });
  } catch (error) {
    return res.status(error instanceof z.ZodError ? 400 : 500).json({
      success: false,
      message:
        error instanceof z.ZodError
          ? 'Please enter a valid email'
          : 'Database is not running or cannot be reached'
    });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const payload = z.object({
      email: z.string().email().trim().toLowerCase(),
      otp: z.string().trim().min(4).max(8)
    }).parse(req.body);

    const result = await authService.verifyOtp(payload.email, payload.otp);
    if (!result) {
      return res.status(400).json({ success: false, message: 'Invalid credentials or code' });
    }

    res.setHeader('Set-Cookie', buildAuthCookie(result.token));

    return res.json({
      success: true,
      token: result.token,
      userId: result.user.id,
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name
      }
    });
  } catch (error) {
    return res.status(error instanceof z.ZodError ? 400 : 500).json({
      success: false,
      message:
        error instanceof z.ZodError
          ? 'Please enter the OTP code'
          : 'Database is not running or cannot be reached'
    });
  }
};

const getSession = async (req, res) => {
  try {
    const token = getTokenFromRequest(req);
    if (!token) {
      return res.json({ success: true, user: null });
    }

    const payload = verifySession(token);
    const user = await authService.getCurrentUser(payload.userId);

    if (!user) {
      return res.json({ success: true, user: null });
    }

    return res.json({
      success: true,
      userId: user.id,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    return res.json({ success: true, user: null });
  }
};

const logout = async (req, res) => {
  res.setHeader('Set-Cookie', clearAuthCookie());
  return res.json({ success: true });
};

module.exports = {
  login,
  getSession,
  logout,
  requestOtp,
  verifyOtp
};
