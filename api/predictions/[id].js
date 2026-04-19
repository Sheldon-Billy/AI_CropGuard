const { getPool } = require('../_lib/db');
const { verifyToken } = require('../_lib/auth');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(204).end();

  const decoded = verifyToken(req);
  if (!decoded) return res.status(401).json({ error: 'Unauthorized.' });

  const pool = getPool();
  const predId = parseInt(req.query.id);

  // POST /api/predictions/:id/feedback — handled via separate route
  // DELETE /api/predictions/:id
  if (req.method === 'DELETE') {
    try {
      await pool.query('DELETE FROM predictions WHERE id = $1 AND user_id = $2', [predId, decoded.id]);
      return res.status(200).json({ message: 'Deleted.' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Server error.' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed.' });
}
