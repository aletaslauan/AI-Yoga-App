const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')

// Configurarea multer pentru încărcarea fișierelor
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  },
})

const upload = multer({ storage: storage })

// Ruta pentru încărcarea și înlocuirea fotografiei
router.post('/', upload.single('photo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' })
  }

  const { oldFilePath } = req.body

  if (oldFilePath) {
    const oldFullPath = path.join(__dirname, '..', oldFilePath)
    fs.unlink(oldFullPath, (err) => {
      if (err) {
        console.error('Error deleting old file:', err)
      }
    })
  }

  const newFilePath = `/uploads/${req.file.filename}`
  const newFullPath = path.join(__dirname, '..', newFilePath)
  const oldFileName = path.basename(oldFilePath)
  const newRenamedPath = path.join(__dirname, '..', 'uploads', oldFileName)

  fs.rename(newFullPath, newRenamedPath, (err) => {
    if (err) {
      console.error('Error renaming file:', err)
      return res.status(500).json({ error: 'Error renaming file' })
    }
    res.json({ filePath: `/uploads/${oldFileName}` })
  })
})

module.exports = router
