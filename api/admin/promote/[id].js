const { getPool } = require('../../_lib/db');
const { verifyToken } = require('../../_lib/auth');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });

  const decoded = verifyToken(req);
  if (!decoded || decoded.role !== 'admin') return res.status(403).json({ error: 'Admin access required.' });

  const pool = getPool();
  const userId = req.query.id;

  try {
    await pool.query('UPDATE users SET role = $1 WHERE id = $2', ['admin', userId]);
    return res.status(200).json({ message: 'User promoted to admin.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error.' });
  }
}
