const jwt = require('jsonwebtoken');
const { query } = require('../config/db');
const { AuthError } = require('../utils/errors');

const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) throw new AuthError('No token provided');

    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { rows } = await query(
      'SELECT id, email, username, display_name, avatar_url, total_xp FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (!rows[0]) throw new AuthError('User not found');

    req.user = rows[0];
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return next(new AuthError('Invalid or expired token'));
    }
    next(err);
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) return next();

    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { rows } = await query('SELECT id, email, username FROM users WHERE id = $1', [decoded.userId]);
    if (rows[0]) req.user = rows[0];
    next();
  } catch {
    next();
  }
};

module.exports = { authenticate, optionalAuth };
