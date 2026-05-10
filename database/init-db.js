// init-db.js
// Run this script from your terminal to create tables and insert dummy data directly into your database.
require('dotenv').config({ path: '../.env' }); // Make sure dotenv is loaded
const fs = require('fs');
const path = require('path');
const pool = require('./db');

async function initializeDatabase() {
  console.log('Reading schema.sql...');
  const schemaPath = path.join(__dirname, 'schema.sql');
  
  try {
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('Executing schema on the database...');
    // Execute the raw SQL string
    await pool.query(schemaSql);
    
    console.log('✅ Database initialized successfully! Tables and dummy data created.');
  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
  } finally {
    // Close the connection pool so the script can exit
    await pool.end();
  }
}

initializeDatabase();
