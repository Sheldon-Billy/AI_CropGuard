const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'cropguard_jwt_secret_2026';

function verifyToken(req) {
  const token = (req.headers['authorization'] || '').replace('Bearer ', '').trim();
  if (!token) return null;
  try { return jwt.verify(token, JWT_SECRET); }
  catch { return null; }
}

module.exports = { verifyToken, JWT_SECRET };
