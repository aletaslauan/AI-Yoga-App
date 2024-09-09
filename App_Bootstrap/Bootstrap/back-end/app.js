require('dotenv').config()
const express = require('express')
const router = express.Router();
const cors = require('cors')
const path = require('path')
const fs = require('fs')
const bodyParser = require('body-parser');

const authRoutes = require('./routes/authRoutes')
const adminRoutes = require('./routes/adminRoutes')
const authenticateToken = require('./middleware/auth')
const uploadRoute = require('./routes/uploadRoute')
const calendarRoutes = require('./routes/calendarRoutes');
const progressRoutes = require('./routes/progressRoutes');
const sessionRoutes = require('./routes/sessionRoutes');  // Correct path to your session routes
const poseRoutes = require('./routes/poseRoutes');
const posetrackingRoutes = require('./routes/posetrackingRoutes');

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())
app.use(bodyParser.json());

app.use('/api/calendar', calendarRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api', sessionRoutes);
app.use('/api', poseRoutes);
app.use('/api/auth', authRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/upload', uploadRoute)
app.use('/api', posetrackingRoutes);


app.post('/api/savePoseData', (req, res) => {
  const poseData = req.body;

  // Save pose data logic here (e.g., save to a database)
  console.log('Pose data received:', poseData);

  res.sendStatus(200);
});

app.get('/delete-file', (_req, res) => {
  const filePath = './path/to/file.txt' // Replace with the file path you want to delete
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error(err)
      res.status(500).send('Error deleting file')
    } else {
      res.send('File deleted successfully')
    }
  })
})

app.listen(3000, () => {
  console.log('Server started on port 3000')
})

// Serve static files from the "uploads" directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Example of a protected route
app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user })
})

 app.listen(PORT, () => console.log(`Server running on port ${PORT}`))

