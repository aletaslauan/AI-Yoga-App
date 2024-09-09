const db = require('../database'); // Database connection

// Save a new session to the Sessions table
const saveSessionToDB = async (user_id, duration, calories_burned) => {
  const query = `
    INSERT INTO Sessions (user_id, date, duration, calories_burned)
    VALUES ($1, CURRENT_DATE, $2, $3) RETURNING session_id;
  `;
  const values = [user_id, duration, calories_burned];
  const result = await db.query(query, values);
  return result.rows[0];
};

// Save pose tracking data related to a session
const saveSessionPose = async (session_id, pose_id, duration) => {
  const query = `
    INSERT INTO SessionPoses (session_id, pose_id, duration)
    VALUES ($1, $2, $3) RETURNING session_pose_id;
  `;
  const values = [session_id, pose_id, duration];
  const result = await db.query(query, values);
  return result.rows[0];
};

// Save progress related to a user
const saveProgress = async (user_id, metric, value) => {
  const query = `
    INSERT INTO Progress (user_id, date, metric, value)
    VALUES ($1, CURRENT_DATE, $2, $3) RETURNING progress_id;
  `;
  const values = [user_id, metric, value];
  const result = await db.query(query, values);
  return result.rows[0];
};

module.exports = {
  saveSessionToDB,
  saveSessionPose,
  saveProgress,
};
