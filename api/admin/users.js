const { getPool } = require('../_lib/db');
const { verifyToken } = require('../_lib/auth');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed.' });

  const decoded = verifyToken(req);
  if (!decoded || decoded.role !== 'admin') return res.status(403).json({ error: 'Admin access required.' });

  const pool = getPool();

  try {
    const result = await pool.query(
      'SELECT id, full_name, email, phone, farm_location, primary_crops, role, registered_at FROM users ORDER BY registered_at DESC'
    );
    return res.status(200).json({ users: result.rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error.' });
  }
}
