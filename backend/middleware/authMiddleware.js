const prisma = require('../config/db');
const { getTokenFromRequest, verifySession } = require('../lib/jwt');

const requireAuth = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);
    if (!token) {
      return res.status(401).json({ success: false, message: 'Missing session token' });
    }

    const decoded = verifySession(token);
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

    if (!user) {
      return res.status(403).json({ success: false, message: 'User not found' });
    }

    req.user = {
      userId: user.id,
      email: user.email,
      name: user.name
    };
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired session token' });
  }
};

module.exports = requireAuth;
