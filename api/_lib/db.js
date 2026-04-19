const { Pool } = require('pg');

let pool;

function getPool() {
  if (!pool) {
    pool = new Pool({
      host:     process.env.DB_HOST,
      database: process.env.DB_NAME,
      user:     process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      port:     5432,
      ssl:      { rejectUnauthorized: false }
    });
  }
  return pool;
}

module.exports = { getPool };
