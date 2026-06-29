const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'tt_session';

function signSession(user) {
  return jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: '7d'
  });
}

function verifySession(token) {
  return jwt.verify(token, JWT_SECRET);
}

function getTokenFromRequest(req) {
  const authHeader = req.headers.authorization || '';
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }

  const cookieHeader = req.headers.cookie || '';
  const sessionCookie = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${COOKIE_NAME}=`));

  if (!sessionCookie) {
    return null;
  }

  return decodeURIComponent(sessionCookie.split('=').slice(1).join('='));
}

function buildAuthCookie(token) {
  const secure = process.env.NODE_ENV === 'production' ? 'Secure' : null;

  return [
    `${COOKIE_NAME}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=604800',
    secure
  ]
    .filter(Boolean)
    .join('; ');
}

function clearAuthCookie() {
  return [
    `${COOKIE_NAME}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0'
  ].join('; ');
}

module.exports = {
  buildAuthCookie,
  clearAuthCookie,
  getTokenFromRequest,
  signSession,
  verifySession
};
