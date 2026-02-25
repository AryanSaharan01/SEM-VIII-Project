const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  console.error('Unexpected PG pool error', err);
});

const query = (text, params) => pool.query(text, params);

const getClient = () => pool.connect();

const testConnection = async () => {
  const client = await pool.connect();
  console.log('✅ PostgreSQL connected');
  client.release();
};

module.exports = { query, getClient, testConnection, pool };
