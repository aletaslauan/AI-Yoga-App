const express = require('express');
const { getAllPoses, getPoseById } = require('../controllers/poseController');
const router = express.Router();

// Route to get all poses
router.get('/poses', getAllPoses);

// Route to get a specific pose by ID
router.get('/poses/:poseId', getPoseById);

module.exports = router;