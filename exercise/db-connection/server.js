const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL connection
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'student_records',
  password: '',
  port: 5432
});

pool.connect()
  .then(client => {
    console.log('Connected to PostgreSQL database');
    client.release();
  })
  .catch(err => {
    console.error('PostgreSQL connection error!', err);
  });

// Root endpoint
app.get('/', (req, res) => {
  res.send('Student Records API is running (PostgreSQL)');
});

// GET API
app.get('/api/students', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM students');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching students:', err);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// POST API
app.post('/api/students', async (req, res) => {
  const { name, email, course, enrollment_date } = req.body;

  if (!name || !email || !course || !enrollment_date) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO students (name, email, course, enrollment_date) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, email, course, enrollment_date]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error adding student:', err);
    res.status(500).json({ error: 'Failed to add student' });
  }
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});