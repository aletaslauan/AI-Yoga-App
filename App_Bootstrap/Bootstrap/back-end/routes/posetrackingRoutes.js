const express = require('express');
const router = express.Router();
const pool = require('../database'); // Import the database connection

// Route to save pose tracking data
// Route to save pose tracking data
router.post('/pose-tracking', async (req, res) => {
    const { session_pose_id, timestamp, pose_data, accuracy, feedback } = req.body;

    // Convert accuracy from percentage (0-100) to a decimal (0-1)
    const accuracyDecimal = accuracy / 100;

    // Validate accuracy
    if (accuracyDecimal < 0 || accuracyDecimal > 1) {
      return res.status(400).json({
        status: 'error',
        message: 'Accuracy must be between 0 and 1',
      });
    }

    try {
      // Serialize pose_data to JSON string
      const poseDataString = JSON.stringify(pose_data);

      const result = await pool.query(
        `INSERT INTO public.posetracking (session_pose_id, "timestamp", pose_data, accuracy, feedback)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [session_pose_id, timestamp, poseDataString, accuracyDecimal, feedback]
      );

      res.status(201).json({
        status: 'success',
        data: result.rows[0],
      });
    } catch (err) {
      console.error('Error inserting data', err);
      res.status(500).json({
        status: 'error',
        message: 'Database error',
      });
    }
});

module.exports = router;
