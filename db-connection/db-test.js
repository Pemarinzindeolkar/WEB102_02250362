const { Client } = require('pg');

const client = new Client({
  user: 'pema',
  host: 'localhost',
  database: 'school',
  password: '', // leave empty if no password
  port: 5432,
});

client.connect()
  .then(() => console.log("Connected to PostgreSQL ✅"))
  .catch(err => console.error("Connection error ❌", err))
  .finally(() => client.end());