const { getPool } = require('../../_lib/db');
const { verifyToken } = require('../../_lib/auth');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });

  const decoded = verifyToken(req);
  if (!decoded) return res.status(401).json({ error: 'Unauthorized.' });

  const pool = getPool();
  const predId = parseInt(req.query.id);
  const { feedback } = req.body;

  try {
    await pool.query(
      'UPDATE predictions SET feedback = $1 WHERE id = $2 AND user_id = $3',
      [feedback, predId, decoded.id]
    );
    return res.status(200).json({ message: 'Feedback saved.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error.' });
  }
}
