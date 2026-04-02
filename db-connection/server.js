const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

// PostgreSQL connection pool
const pool = new Pool({
  user: 'pema',
  host: 'localhost',
  database: 'school',
  password: '',
  port: 5432,
});

// Route to get students
app.get('/api/students', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM students');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Start server
app.listen(5001, () => {
  console.log('Server running on http://localhost:5001');
});