const db = require('../database');

const getProgressByDate = (userId, date) => {
  const query = `
    SELECT metric, value
    FROM Progress
    WHERE user_id = $1 AND date = $2;
  `;
  return db.query(query, [userId, date]);
};

module.exports = { getProgressByDate };
