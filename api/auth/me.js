const { getPool } = require('../_lib/db');
const { verifyToken } = require('../_lib/auth');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed.' });

  const decoded = verifyToken(req);
  if (!decoded) return res.status(401).json({ error: 'Unauthorized.' });

  const pool = getPool();

  try {
    const result = await pool.query(
      'SELECT id, full_name, email, phone, farm_location, primary_crops, role, registered_at FROM users WHERE id = $1',
      [decoded.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'User not found.' });
    return res.status(200).json({ user: result.rows[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error.' });
  }
}
