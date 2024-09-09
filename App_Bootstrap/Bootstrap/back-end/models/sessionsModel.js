const db = require('../database');

const getSessionsByMonth = (userId, month, year) => {
  const query = `
    SELECT date, COUNT(session_id) AS sessions, SUM(duration) AS total_duration
    FROM Sessions
    WHERE user_id = $1 AND EXTRACT(MONTH FROM date) = $2 AND EXTRACT(YEAR FROM date) = $3
    GROUP BY date
    ORDER BY date;
  `;
  return db.query(query, [userId, month, year]);
};

module.exports = { getSessionsByMonth };
