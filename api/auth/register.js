const { getPool } = require('../_lib/db');
const { JWT_SECRET } = require('../_lib/auth');
const jwt = require('jsonwebtoken');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });

  const { full_name, email, phone, password, farm_location, primary_crops } = req.body;

  if (!full_name || !password || (!email && !phone))
    return res.status(400).json({ error: 'Name, password, and email or phone are required.' });
  if (password.length < 6)
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });

  const pool = getPool();

  try {
    const result = await pool.query(
      `INSERT INTO users (full_name, email, phone, password, farm_location, primary_crops)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING id, full_name, email, phone, farm_location, primary_crops, role, registered_at`,
      [full_name, email || null, phone || null, password, farm_location || null, primary_crops || null]
    );
    const user  = result.rows[0];
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    return res.status(201).json({ message: 'Account created.', token, user });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Email or phone already registered.' });
    console.error(err);
    return res.status(500).json({ error: 'Server error.' });
  }
}
