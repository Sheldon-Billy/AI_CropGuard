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
      `SELECT p.id, p.disease_name, p.disease_type, p.crop_type, p.recommendations, p.feedback, p.created_at,
              u.full_name, u.email
       FROM predictions p JOIN users u ON p.user_id = u.id
       ORDER BY p.created_at DESC LIMIT 200`
    );
    return res.status(200).json({ predictions: result.rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error.' });
  }
}
