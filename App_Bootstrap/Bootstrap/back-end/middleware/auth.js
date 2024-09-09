// middleware/auth.js
const jwt = require('jsonwebtoken')
const pool = require('../database')

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) return res.sendStatus(401)

  pool.query(
    'SELECT * FROM TokenBlacklist WHERE token = $1',
    [token],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message })

      if (result.rows.length > 0) return res.sendStatus(403) // Token is blacklisted

      jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403)
        req.user = user
        next()
      })
    }
  )
}

module.exports = authenticateToken
