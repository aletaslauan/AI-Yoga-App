const { getSessionsByMonth } = require('../models/sessionsModel');

const fetchCalendarData = async (req, res) => {
  const { user_id, month, year } = req.query;
  try {
    const result = await getSessionsByMonth(user_id, month, year);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching calendar data:', error);
    res.status(500).json({ error: 'Failed to fetch calendar data' });
  }
};

module.exports = { fetchCalendarData };
