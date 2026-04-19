const { getPool } = require('../_lib/db');
const { JWT_SECRET } = require('../_lib/auth');
const jwt = require('jsonwebtoken');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });

  const { email, phone, password } = req.body;

  if (!password || (!email && !phone))
    return res.status(400).json({ error: 'Password and email or phone are required.' });

  const pool = getPool();

  try {
    const result = email
      ? await pool.query('SELECT * FROM users WHERE email = $1', [email])
      : await pool.query('SELECT * FROM users WHERE phone = $1', [phone]);

    const user = result.rows[0];
    if (!user || user.password !== password)
      return res.status(401).json({ error: 'Invalid credentials.' });

    const { password: _, ...safeUser } = user;
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    return res.status(200).json({ message: 'Login successful.', token, user: safeUser });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error.' });
  }
}
