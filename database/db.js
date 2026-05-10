// db.js
// PostgreSQL connection using pg and dotenv for NeonDB

require('dotenv').config();
const { Pool } = require('pg');

// Initialize the database connection pool using connection string
// NeonDB provides a DATABASE_URL you can use directly.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for some hosted PostgreSQL like NeonDB
  }
});

// Test the connection
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  console.log('Successfully connected to NeonDB PostgreSQL database!');
  release();
});

module.exports = pool;
