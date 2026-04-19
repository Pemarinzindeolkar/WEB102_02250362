const express = require('express');
const cors = require('cors');
const prisma = require('./prisma');

const app = express();
const port = 5100; // Using a different port from the original app

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/students', async (req, res) => {
  try {
    // Using Prisma to fetch all students
    const students = await prisma.students.findMany();
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/students/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    // Using Prisma to fetch a student by ID
    const student = await prisma.students.findUnique({
      where: { id }
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json(student);
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/students', async (req, res) => {
  try {
    const { name, email, course, enrollment_date } = req.body;

    // Using Prisma to create a new student
    const newStudent = await prisma.students.create({
      data: {
        name,
        email,
        course,
        enrollment_date: new Date(enrollment_date)
      }
    });

    res.status(201).json(newStudent);
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Gracefully shut down Prisma when the app terminates
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

// Start the server
app.listen(port, () => {
  console.log(`Prisma server running on http://localhost:${port}`);
});