const { getPool } = require('../_lib/db');
const { verifyToken } = require('../_lib/auth');

function tryParse(val) {
  try { return JSON.parse(val); } catch { return val; }
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(204).end();

  const decoded = verifyToken(req);
  if (!decoded) return res.status(401).json({ error: 'Unauthorized.' });

  const pool = getPool();

  // GET — fetch user's predictions
  if (req.method === 'GET') {
    try {
      const result = await pool.query(
        `SELECT id, crop_type, disease_name, disease_type, causes, prevention, future,
                recommendations, image_data, feedback, created_at
         FROM predictions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`,
        [decoded.id]
      );
      const rows = result.rows.map(r => ({
        ...r,
        causes:     tryParse(r.causes),
        prevention: tryParse(r.prevention),
        future:     tryParse(r.future)
      }));
      return res.status(200).json({ predictions: rows });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Could not fetch predictions.' });
    }
  }

  // POST — save a prediction
  if (req.method === 'POST') {
    const body = req.body;
    try {
      await pool.query(
        `INSERT INTO predictions (user_id, crop_type, disease_name, disease_type, causes, prevention, future, recommendations, image_data)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [
          decoded.id,
          body.crop_type    || null,
          body.disease_name || null,
          body.disease_type || null,
          JSON.stringify(body.causes      || []),
          JSON.stringify(body.prevention  || []),
          JSON.stringify(body.future      || []),
          body.recommendations || null,
          body.image_data      || null
        ]
      );
      return res.status(201).json({ message: 'Saved.' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Could not save prediction.' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed.' });
}
