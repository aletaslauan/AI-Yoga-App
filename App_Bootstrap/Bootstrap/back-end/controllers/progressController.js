// progressController.js

const db = require('../database'); // Assuming you have a db connection module

const getProgressByUser = async (req, res) => {
  const { user_id } = req.params;
  try {
    const result = await db.query('SELECT date, metric, value FROM progress WHERE user_id = $1 ORDER BY date', [user_id]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching progress data:', error);
    res.status(500).json({ error: 'Failed to fetch progress data' });
  }
};
module.exports = {
  getProgressByUser,
};
