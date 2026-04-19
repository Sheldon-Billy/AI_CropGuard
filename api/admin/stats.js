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
    const [u, p, f] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM users WHERE role='farmer'"),
      pool.query('SELECT COUNT(*) FROM predictions'),
      pool.query('SELECT COUNT(*) FROM predictions WHERE feedback IS NOT NULL')
    ]);
    return res.status(200).json({
      total_farmers:     parseInt(u.rows[0].count),
      total_predictions: parseInt(p.rows[0].count),
      total_feedback:    parseInt(f.rows[0].count)
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error.' });
  }
}
