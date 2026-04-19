const { getPool } = require('./_lib/db');

// ONE-TIME SETUP: Makes the first registered user an admin
// DELETE THIS FILE AFTER USING IT!

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email required.' });
  }

  const pool = getPool();

  try {
    const result = await pool.query(
      'UPDATE users SET role = $1 WHERE email = $2 RETURNING id, full_name, email, role',
      ['admin', email]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found with that email.' });
    }

    return res.status(200).json({ 
      message: 'User promoted to admin successfully!',
      user: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || 'Server error.' });
  }
}
