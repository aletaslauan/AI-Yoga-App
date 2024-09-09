const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const pool = require('../database')
const authenticateToken = require('../middleware/auth')

const router = express.Router()

// Admin Registration
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body
  const hashedPassword = await bcrypt.hash(password, 10)

  try {
    const newAdmin = await pool.query(
      `INSERT INTO Admins (name, email, password_hash)
       VALUES ($1, $2, $3) RETURNING *`,
      [name, email, hashedPassword]
    )
    res.status(201).json(newAdmin.rows[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Admin Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body

  try {
    const admin = await pool.query('SELECT * FROM Admins WHERE email = $1', [
      email,
    ])
    if (admin.rows.length === 0)
      return res.status(404).json({ error: 'Admin not found' })

    const isValid = await bcrypt.compare(password, admin.rows[0].password_hash)
    if (!isValid) return res.status(401).json({ error: 'Invalid password' })

    const token = jwt.sign(
      { admin_id: admin.rows[0].admin_id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    )
    res.json({ token })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const admin = await pool.query('SELECT * FROM Admins WHERE admin_id = $1', [
      req.user.admin_id,
    ])
    if (admin.rows.length === 0)
      return res.status(404).json({ error: 'Admin not found' })
    res.json(admin.rows[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Middleware to authenticate admin
const authenticateAdmin = (req, res, next) => {
  authenticateToken(req, res, () => {
    if (!req.user.admin_id) return res.sendStatus(403) // Forbidden
    next()
  })
}

// Log function
const logAction = async (
  action,
  admin_id,
  user_id = null,
  session_id = null,
  pose_id = null,
  category_id = null,
  details = ''
) => {
  try {
    await pool.query(
      `INSERT INTO ApplicationLogs (action, admin_id, user_id, session_id, pose_id, category_id, details)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [action, admin_id, user_id, session_id, pose_id, category_id, details]
    )
  } catch (logError) {
    console.error('Error logging action:', logError.message)
  }
}

// Helper function to check if records exists
const checkUserExists = async (user_id) => {
  const result = await pool.query('SELECT * FROM Users WHERE user_id = $1', [
    user_id,
  ])
  return result.rows.length > 0
}

const checkPoseExists = async (pose_id) => {
  const result = await pool.query('SELECT * FROM Poses WHERE pose_id = $1', [
    pose_id,
  ])
  return result.rows.length > 0
}

const checkCategoryExists = async (category_id) => {
  const result = await pool.query(
    'SELECT * FROM Categories WHERE category_id = $1',
    [category_id]
  )
  return result.rows.length > 0
}

const checkSessionExists = async (session_id) => {
  const result = await pool.query(
    'SELECT * FROM Sessions WHERE session_id = $1',
    [session_id]
  )
  return result.rows.length > 0
}

// CRUD Operations to Manage Users
router.get('/users', authenticateAdmin, async (req, res) => {
  try {
    const users = await pool.query('SELECT * FROM Users')
    res.json(users.rows)

    // Log the action
    await logAction('Read Users', req.user.admin_id)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.post('/users', authenticateAdmin, async (req, res) => {
  const {
    name,
    email,
    password,
    age,
    gender,
    fitness_level,
    goals,
    health_conditions,
    weight
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
        weight
      ]
    )
    // Log the action
    try {
      await pool.query(
        `INSERT INTO ApplicationLogs (action, admin_id, user_id, details)
         VALUES ($1, $2, $3, $4)`,
        [
          'Create User',
          req.user.admin_id,
          newUser.rows[0].user_id,
          JSON.stringify(newUser.rows[0]),
        ]
      )
    } catch (logError) {
      console.error('Error logging action:', logError.message)
    }

    res.status(201).json(newUser.rows[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get all users
router.get('/users', authenticateToken, async (req, res) => {
  try {
    const users = await pool.query('SELECT * FROM Users')
    res.json(users.rows)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get user by ID
router.get('/users/:id', authenticateToken, async (req, res) => {
  try {
    const user = await pool.query('SELECT * FROM Users WHERE user_id = $1', [
      req.params.id,
    ])
    res.json(user.rows[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Edit user
// router.put('/users/:id', authenticateToken, async (req, res) => {
//   const { name, email, age, gender, fitness_level, goals, health_conditions, weight } =
//     req.body
//   try {
//     const updatedUser = await pool.query(
//       `UPDATE Users SET name = $1, email = $2, age = $3, gender = $4, fitness_level = $5, goals = $6, health_conditions = $7, weight = $8 WHERE user_id = $9 RETURNING *`,
//       [
//         name,
//         email,
//         age,
//         gender,
//         fitness_level,
//         goals,
//         health_conditions,
//         weight,
//         req.params.id,
//       ]
//     )
//     res.json(updatedUser.rows[0])
//   } catch (error) {
//     res.status(500).json({ error: error.message })
//   }
// })


// Add new user
router.post('/users', authenticateToken, async (req, res) => {
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
      `INSERT INTO Users (name, email, password_hash, age, gender, fitness_level, goals, health_conditions, weight) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
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
    res.json(newUser.rows[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Update user
// router.put('/users/:id', authenticateToken, async (req, res) => {
//   const { id } = req.params
//   const { name, email, age, gender, fitness_level, goals, health_conditions, weight } =
//     req.body

//   try {
//     const updatedUser = await pool.query(
//       `UPDATE users SET name = $1, email = $2, age = $3, gender = $4, fitness_level = $5, goals = $6, health_conditions = $7, weight = $8 WHERE user_id = $9 RETURNING *`,
//       [name, email, age, gender, fitness_level, goals, health_conditions, weight, id]
//     )
//     if (updatedUser.rows.length === 0) {
//       res.status(404).json({ error: 'User not found' })
//     } else {
//       res.json(updatedUser.rows[0])
//     }
//   } catch (error) {
//     console.error('Error updating user:', error)
//     res.status(500).json({ error: error.message })
//   }
// })

// Update User with Logging
router.put('/users/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params
  const { name, email, age, gender, fitness_level, goals, health_conditions, weight } =
    req.body

  try {
    // Check if user exists
    const userExists = await checkUserExists(id)
    if (!userExists) return res.status(404).json({ error: 'User not found' })

    const updatedUser = await pool.query(
      `UPDATE Users SET name = $1, email = $2, age = $3, gender = $4, fitness_level = $5, goals = $6, health_conditions = $7,  weight = $8, updated_at = NOW()
       WHERE user_id = $9 RETURNING *`,
      [name, email, age, gender, fitness_level, goals, health_conditions, weight, id]
    )

    // Log the action
    await logAction(
      'Update User',
      req.user.admin_id,
      id,
      null,
      null,
      null,
      JSON.stringify(updatedUser.rows[0])
    )

    res.json(updatedUser.rows[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Delete User with Logging
router.delete('/users/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params

  try {
    // Check if user exists
    const userExists = await checkUserExists(id)
    if (!userExists) return res.status(404).json({ error: 'User not found' })

    await pool.query('DELETE FROM Users WHERE user_id = $1', [id])

    // Log the action
    await logAction('Delete User', req.user.admin_id, id)

    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// View Application Logs
router.get('/logs', authenticateAdmin, async (req, res) => {
  try {
    const logs = await pool.query(
      'SELECT * FROM ApplicationLogs ORDER BY timestamp DESC'
    )
    res.json(logs.rows)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Manage Sessions
// CRUD Operations for Sessions
router.post('/sessions', authenticateAdmin, async (req, res) => {
  const { user_id, date, duration, calories_burned } = req.body

  try {
    const userExists = await checkUserExists(user_id)
    if (!userExists) return res.status(404).json({ error: 'User not found' })

    const newSession = await pool.query(
      `INSERT INTO Sessions (user_id, date, duration, calories_burned)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [user_id, date, duration, calories_burned]
    )

    await logAction(
      'Create Session',
      req.user.admin_id,
      user_id,
      newSession.rows[0].session_id,
      null,
      null,
      JSON.stringify(newSession.rows[0])
    )

    res.status(201).json(newSession.rows[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.get('/sessions', authenticateAdmin, async (req, res) => {
  try {
    const sessions = await pool.query('SELECT * FROM Sessions')

    await logAction('Read Sessions', req.user.admin_id)

    res.json(sessions.rows)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.put('/sessions/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params
  const { user_id, date, duration, calories_burned } = req.body

  try {
    const sessionExists = await checkSessionExists(id)
    if (!sessionExists)
      return res.status(404).json({ error: 'Session not found' })

    const updatedSession = await pool.query(
      `UPDATE Sessions SET user_id = $1, date = $2, duration = $3, calories_burned = $4, updated_at = NOW()
       WHERE session_id = $5 RETURNING *`,
      [user_id, date, duration, calories_burned, id]
    )

    await logAction(
      'Update Session',
      req.user.admin_id,
      user_id,
      id,
      null,
      null,
      JSON.stringify(updatedSession.rows[0])
    )

    res.json(updatedSession.rows[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.delete('/sessions/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params

  try {
    const sessionExists = await checkSessionExists(id)
    if (!sessionExists)
      return res.status(404).json({ error: 'Session not found' })

    await pool.query('DELETE FROM Sessions WHERE session_id = $1', [id])

    await logAction('Delete Session', req.user.admin_id, null, id)

    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Manage Poses
// CRUD Operations for Poses
router.post('/poses', authenticateAdmin, async (req, res) => {
  const { name, category_id, description, video_url } = req.body

  try {
    const newPose = await pool.query(
      `INSERT INTO Poses (name, category_id, description, video_url)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, category_id, description, video_url]
    )

    await logAction(
      'Create Pose',
      req.user.admin_id,
      null,
      null,
      newPose.rows[0].pose_id,
      null,
      JSON.stringify(newPose.rows[0])
    )

    res.status(201).json(newPose.rows[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.get('/poses', authenticateAdmin, async (req, res) => {
  try {
    const poses = await pool.query('SELECT * FROM Poses')

    await logAction('Read Poses', req.user.admin_id)

    res.json(poses.rows)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.put('/poses/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params
  const { name, category_id, description, video_url } = req.body

  try {
    const poseExists = await checkPoseExists(id)
    if (!poseExists) return res.status(404).json({ error: 'Pose not found' })

    const updatedPose = await pool.query(
      `UPDATE Poses SET name = $1, category_id = $2, description = $3, video_url = $4, updated_at = NOW()
       WHERE pose_id = $5 RETURNING *`,
      [name, category_id, description, video_url, id]
    )

    await logAction(
      'Update Pose',
      req.user.admin_id,
      null,
      null,
      id,
      null,
      JSON.stringify(updatedPose.rows[0])
    )

    res.json(updatedPose.rows[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.delete('/poses/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params

  try {
    const poseExists = await checkPoseExists(id)
    if (!poseExists) return res.status(404).json({ error: 'Pose not found' })

    await pool.query('DELETE FROM Poses WHERE pose_id = $1', [id])

    await logAction('Delete Pose', req.user.admin_id, null, null, id)

    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Manage Categories
// CRUD Operations for Categories
router.post('/categories', authenticateAdmin, async (req, res) => {
  const { name, description } = req.body

  try {
    const newCategory = await pool.query(
      `INSERT INTO Categories (name, description)
       VALUES ($1, $2) RETURNING *`,
      [name, description]
    )

    await logAction(
      'Create Category',
      req.user.admin_id,
      null,
      null,
      null,
      newCategory.rows[0].category_id,
      JSON.stringify(newCategory.rows[0])
    )

    res.status(201).json(newCategory.rows[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.get('/categories', authenticateAdmin, async (req, res) => {
  try {
    const categories = await pool.query('SELECT * FROM Categories')

    await logAction('Read Categories', req.user.admin_id)

    res.json(categories.rows)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.put('/categories/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params
  const { name, description } = req.body

  try {
    const categoryExists = await checkCategoryExists(id)
    if (!categoryExists)
      return res.status(404).json({ error: 'Category not found' })

    const updatedCategory = await pool.query(
      `UPDATE Categories SET name = $1, description = $2, updated_at = NOW()
       WHERE category_id = $3 RETURNING *`,
      [name, description, id]
    )

    await logAction(
      'Update Category',
      req.user.admin_id,
      null,
      null,
      null,
      id,
      JSON.stringify(updatedCategory.rows[0])
    )

    res.json(updatedCategory.rows[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.delete('/categories/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params

  try {
    const categoryExists = await checkCategoryExists(id)
    if (!categoryExists)
      return res.status(404).json({ error: 'Category not found' })

    await pool.query('DELETE FROM Categories WHERE category_id = $1', [id])

    await logAction('Delete Category', req.user.admin_id, null, null, null, id)

    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
