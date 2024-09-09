// routes/authRoutes.js
const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const multer = require('multer')
const pool = require('../database')
const authenticateToken = require('../middleware/auth') // added for profile updates
const router = express.Router()

// Configure multer for file uploads
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

// Register User
router.post('/register', async (req, res) => {
  const {
    name,
    email,
    password,
    age,
    gender,
    fitness_level,
    goals,
    health_conditions,
    weight,
  } = req.body
  const hashedPassword = await bcrypt.hash(password, 10)

  try {
    const newUser = await pool.query(
      `INSERT INTO Users (name, email, password_hash, age, gender, fitness_level, goals, health_conditions, weight)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [
        name,
        email,
        hashedPassword,
        age,
        gender,
        fitness_level,
        goals,
        health_conditions,
        weight,
      ]
    )
    res.status(201).json(newUser.rows[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Login User
router.post('/login', async (req, res) => {
  const { email, password } = req.body

  try {
    const user = await pool.query('SELECT * FROM Users WHERE email = $1', [
      email,
    ])
    if (user.rows.length === 0)
      return res.status(404).json({ error: 'User not found' })

    const isValid = await bcrypt.compare(password, user.rows[0].password_hash)
    if (!isValid) return res.status(401).json({ error: 'Invalid password' })

    const token = jwt.sign(
      { user_id: user.rows[0].user_id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    )
    res.json({ token })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Logout User
router.post('/logout', (req, res) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) return res.status(400).json({ error: 'Token is required' })

  pool.query(
    'INSERT INTO TokenBlacklist (token) VALUES ($1)',
    [token],
    (err) => {
      if (err) return res.status(500).json({ error: err.message })

      res.status(200).json({ message: 'Logged out successfully' })
    }
  )
})

// Fetch User Profile
router.get('/profile', authenticateToken, async (req, res) => {
  const { user_id } = req.user

  try {
    const result = await pool.query('SELECT * FROM Users WHERE user_id = $1', [
      user_id,
    ])
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Update User Profile with optional photo URL
router.put(
  '/profile',
  authenticateToken,
  upload.single('photo'),
  async (req, res) => {
    const { user_id } = req.user
    const {
      name,
      email,
      age,
      gender,
      fitness_level,
      goals,
      health_conditions,
      photo_url,
        weight,
    } = req.body
    const photo = req.file ? req.file.buffer : null

    try {
      const updateQuery = `
      UPDATE Users 
      SET name = $1, email = $2, age = $3, gender = $4, fitness_level = $5, goals = $6, health_conditions = $7, photo = COALESCE($8, photo), photo_url = COALESCE($9, photo_url),  weight = $10, updated_at = NOW()
      WHERE user_id = $11 RETURNING *`
      const values = [
        name,
        email,
        age,
        gender,
        fitness_level,
        goals,
        health_conditions,
        photo,
        photo_url,
        weight,
        user_id,
      ]

      const updateUser = await pool.query(updateQuery, values)

      if (updateUser.rows.length === 0) {
        return res.status(404).json({ message: 'User not found' })
      }

      res.json(updateUser.rows[0])
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }
)

module.exports = router
