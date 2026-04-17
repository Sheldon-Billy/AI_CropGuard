const http = require('http');
const fs   = require('fs');
const path = require('path');
const jwt  = require('jsonwebtoken');
const { Pool } = require('pg');

const PORT       = 3000;
const JWT_SECRET = 'cropguard_jwt_secret_2026';

// ── PostgreSQL connection ─────────────────────────────────
const pool = new Pool({
  host:     'ep-ancient-thunder-anunhlwp-pooler.c-6.us-east-1.aws.neon.tech',
  database: 'neondb',
  user:     'neondb_owner',
  password: 'npg_PHf7DTc5zgeO',
  port:     5432,
  ssl:      { rejectUnauthorized: false }
});

// ── Create tables ─────────────────────────────────────────
async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id            SERIAL PRIMARY KEY,
        full_name     VARCHAR(100) NOT NULL,
        email         VARCHAR(100) UNIQUE,
        phone         VARCHAR(20)  UNIQUE,
        password      VARCHAR(255) NOT NULL,
        farm_location VARCHAR(200),
        primary_crops TEXT,
        role          VARCHAR(20)  NOT NULL DEFAULT 'farmer',
        registered_at TIMESTAMP    NOT NULL DEFAULT NOW(),
        CONSTRAINT chk_contact CHECK (email IS NOT NULL OR phone IS NOT NULL)
      )
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS predictions (
        id              SERIAL PRIMARY KEY,
        user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        disease_name    VARCHAR(150),
        disease_type    VARCHAR(50),
        crop_type       VARCHAR(50),
        causes          TEXT,
        prevention      TEXT,
        future          TEXT,
        recommendations TEXT,
        image_data      TEXT,
        feedback        VARCHAR(20),
        created_at      TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    console.log('Database ready.');
  } catch (err) {
    console.error('DB init error:', err.message);
  }
}
initDB();

// ── Helpers ───────────────────────────────────────────────
function tryParse(val) {
  try { return JSON.parse(val); } catch { return val; }
}

function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try { resolve(JSON.parse(body)); }
      catch { resolve({}); }
    });
  });
}

function send(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS'
  });
  res.end(JSON.stringify(data));
}

function serveStatic(res, filePath) {
  const ext = path.extname(filePath);
  const mime = {
    '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript',
    '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
    '.webp': 'image/webp', '.avif': 'image/avif', '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
  };
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); }
    else { res.writeHead(200, { 'Content-Type': mime[ext] || 'application/octet-stream' }); res.end(data); }
  });
}

function verifyToken(req) {
  const token = (req.headers['authorization'] || '').replace('Bearer ', '').trim();
  if (!token) return null;
  try { return jwt.verify(token, JWT_SECRET); }
  catch { return null; }
}

// ── HTTP Server ───────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  const url    = req.url.split('?')[0];
  const method = req.method;

  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS'
    });
    return res.end();
  }

  // ── AUTH: REGISTER ─────────────────────────────────────
  if (url === '/api/auth/register' && method === 'POST') {
    const { full_name, email, phone, password, farm_location, primary_crops } = await parseBody(req);
    if (!full_name || !password || (!email && !phone))
      return send(res, 400, { error: 'Name, password, and email or phone are required.' });
    if (password.length < 6)
      return send(res, 400, { error: 'Password must be at least 6 characters.' });
    try {
      const result = await pool.query(
        `INSERT INTO users (full_name, email, phone, password, farm_location, primary_crops)
         VALUES ($1,$2,$3,$4,$5,$6)
         RETURNING id, full_name, email, phone, farm_location, primary_crops, role, registered_at`,
        [full_name, email || null, phone || null, password, farm_location || null, primary_crops || null]
      );
      const user  = result.rows[0];
      const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
      return send(res, 201, { message: 'Account created.', token, user });
    } catch (err) {
      if (err.code === '23505') return send(res, 409, { error: 'Email or phone already registered.' });
      return send(res, 500, { error: 'Server error.' });
    }
  }

  // ── AUTH: LOGIN ────────────────────────────────────────
  if (url === '/api/auth/login' && method === 'POST') {
    const { email, phone, password } = await parseBody(req);
    if (!password || (!email && !phone))
      return send(res, 400, { error: 'Password and email or phone are required.' });
    try {
      const result = email
        ? await pool.query('SELECT * FROM users WHERE email = $1', [email])
        : await pool.query('SELECT * FROM users WHERE phone = $1', [phone]);
      const user = result.rows[0];
      if (!user || user.password !== password)
        return send(res, 401, { error: 'Invalid credentials.' });
      const { password: _, ...safeUser } = user;
      const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
      return send(res, 200, { message: 'Login successful.', token, user: safeUser });
    } catch (err) {
      return send(res, 500, { error: 'Server error.' });
    }
  }

  // ── AUTH: ME ───────────────────────────────────────────
  if (url === '/api/auth/me' && method === 'GET') {
    const decoded = verifyToken(req);
    if (!decoded) return send(res, 401, { error: 'Unauthorized.' });
    try {
      const result = await pool.query(
        'SELECT id, full_name, email, phone, farm_location, primary_crops, role, registered_at FROM users WHERE id = $1',
        [decoded.id]
      );
      if (!result.rows.length) return send(res, 404, { error: 'User not found.' });
      return send(res, 200, { user: result.rows[0] });
    } catch { return send(res, 500, { error: 'Server error.' }); }
  }

  // ── AUTH: LOGOUT ───────────────────────────────────────
  if (url === '/api/auth/logout' && method === 'POST') {
    return send(res, 200, { message: 'Logged out.' });
  }

  // ── PREDICTIONS: SAVE ──────────────────────────────────
  if (url === '/api/predictions' && method === 'POST') {
    const decoded = verifyToken(req);
    if (!decoded) return send(res, 401, { error: 'Unauthorized.' });
    const body = await parseBody(req);
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
      return send(res, 201, { message: 'Saved.' });
    } catch (err) {
      console.error('Save prediction error:', err.message);
      return send(res, 500, { error: 'Could not save prediction.' });
    }
  }

  // ── PREDICTIONS: GET ───────────────────────────────────
  if (url === '/api/predictions' && method === 'GET') {
    const decoded = verifyToken(req);
    if (!decoded) return send(res, 401, { error: 'Unauthorized.' });
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
      return send(res, 200, { predictions: rows });
    } catch (err) {
      return send(res, 500, { error: 'Could not fetch predictions.' });
    }
  }

  // ── PREDICTIONS: FEEDBACK ──────────────────────────────
  if (url.match(/^\/api\/predictions\/\d+\/feedback$/) && method === 'POST') {
    const decoded = verifyToken(req);
    if (!decoded) return send(res, 401, { error: 'Unauthorized.' });
    const predId = parseInt(url.split('/')[3]);
    const { feedback } = await parseBody(req);
    try {
      await pool.query('UPDATE predictions SET feedback = $1 WHERE id = $2 AND user_id = $3', [feedback, predId, decoded.id]);
      return send(res, 200, { message: 'Feedback saved.' });
    } catch { return send(res, 500, { error: 'Server error.' }); }
  }

  // ── PREDICTIONS: DELETE ────────────────────────────────
  if (url.match(/^\/api\/predictions\/\d+$/) && method === 'DELETE') {
    const decoded = verifyToken(req);
    if (!decoded) return send(res, 401, { error: 'Unauthorized.' });
    const predId = parseInt(url.split('/')[3]);
    try {
      await pool.query('DELETE FROM predictions WHERE id = $1 AND user_id = $2', [predId, decoded.id]);
      return send(res, 200, { message: 'Deleted.' });
    } catch { return send(res, 500, { error: 'Server error.' }); }
  }

  // ── HEALTH ─────────────────────────────────────────────
  if (url === '/api/health' && method === 'GET') {
    return send(res, 200, { status: 'ok' });
  }

  // ── ADMIN: STATS ───────────────────────────────────────
  if (url === '/api/admin/stats' && method === 'GET') {
    const decoded = verifyToken(req);
    if (!decoded || decoded.role !== 'admin') return send(res, 403, { error: 'Admin access required.' });
    try {
      const [u, p, f] = await Promise.all([
        pool.query("SELECT COUNT(*) FROM users WHERE role='farmer'"),
        pool.query('SELECT COUNT(*) FROM predictions'),
        pool.query('SELECT COUNT(*) FROM predictions WHERE feedback IS NOT NULL')
      ]);
      return send(res, 200, {
        total_farmers:     parseInt(u.rows[0].count),
        total_predictions: parseInt(p.rows[0].count),
        total_feedback:    parseInt(f.rows[0].count)
      });
    } catch { return send(res, 500, { error: 'Server error.' }); }
  }

  // ── ADMIN: ALL USERS ───────────────────────────────────
  if (url === '/api/admin/users' && method === 'GET') {
    const decoded = verifyToken(req);
    if (!decoded || decoded.role !== 'admin') return send(res, 403, { error: 'Admin access required.' });
    try {
      const result = await pool.query(
        'SELECT id, full_name, email, phone, farm_location, primary_crops, role, registered_at FROM users ORDER BY registered_at DESC'
      );
      return send(res, 200, { users: result.rows });
    } catch { return send(res, 500, { error: 'Server error.' }); }
  }

  // ── ADMIN: ALL PREDICTIONS ─────────────────────────────
  if (url === '/api/admin/predictions' && method === 'GET') {
    const decoded = verifyToken(req);
    if (!decoded || decoded.role !== 'admin') return send(res, 403, { error: 'Admin access required.' });
    try {
      const result = await pool.query(
        `SELECT p.id, p.disease_name, p.disease_type, p.crop_type, p.recommendations, p.feedback, p.created_at,
                u.full_name, u.email
         FROM predictions p JOIN users u ON p.user_id = u.id
         ORDER BY p.created_at DESC LIMIT 200`
      );
      return send(res, 200, { predictions: result.rows });
    } catch { return send(res, 500, { error: 'Server error.' }); }
  }

  // ── ADMIN: PROMOTE USER ────────────────────────────────
  if (url.match(/^\/api\/admin\/promote\/\d+$/) && method === 'POST') {
    const decoded = verifyToken(req);
    if (!decoded || decoded.role !== 'admin') return send(res, 403, { error: 'Admin access required.' });
    const userId = url.split('/').pop();
    try {
      await pool.query('UPDATE users SET role = $1 WHERE id = $2', ['admin', userId]);
      return send(res, 200, { message: 'User promoted to admin.' });
    } catch { return send(res, 500, { error: 'Server error.' }); }
  }

  // ── STATIC FILES ───────────────────────────────────────
  const ROOT = path.join(__dirname, '..');
  let filePath = path.join(ROOT, url === '/' ? 'index.html' : url);
  if (!filePath.startsWith(ROOT)) { res.writeHead(403); return res.end('Forbidden'); }
  if (!path.extname(filePath)) filePath += '.html';
  serveStatic(res, filePath);
});

server.listen(PORT, () => {
  console.log(`CropGuard AI running at http://localhost:${PORT}`);
});
