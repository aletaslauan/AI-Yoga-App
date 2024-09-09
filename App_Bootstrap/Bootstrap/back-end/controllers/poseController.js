const db = require('../database');

// Function to get all poses
const getAllPoses = async (req, res) => {
    try {
      const result = await db.query('SELECT * FROM poses');
      res.status(200).json(result.rows);
    } catch (error) {
      console.error('Error fetching poses:', error);
      res.status(500).json({ error: 'Failed to fetch poses' });
    }
  };
  
  // Function to get a specific pose by ID
  const getPoseById = async (req, res) => {
    const { poseId } = req.params;
    try {
      const result = await db.query('SELECT * FROM poses WHERE pose_id = $1', [poseId]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Pose not found' });
      }
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching pose:', error);
      res.status(500).json({ error: 'Failed to fetch pose' });
    }
  };
  
  module.exports = { getAllPoses, getPoseById };