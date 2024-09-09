const { saveSessionToDB, saveSessionPose } = require('../models/sessionModel');
const db = require('../database');

const handleSessionData = async (req, res) => {
  const { user_id, duration, calories_burned } = req.body;

  if (!user_id || !duration || !calories_burned) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const session = await saveSessionToDB(user_id, duration, calories_burned);
    res.status(201).json({ message: 'Session data saved successfully', session });
  } catch (error) {
    console.error('Error saving session data:', error);
    res.status(500).json({ error: 'Failed to save session data' });
  }
};

const handleSessionPoseData = async (req, res) => {
  const { pose_id, duration } = req.body;
  const { sessionId } = req.params;  // Get sessionId from URL parameters

  if (!sessionId || !pose_id || !duration) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const sessionPose = await saveSessionPose(sessionId, pose_id, duration);
    res.status(201).json({ message: 'Session pose data saved successfully', sessionPose });
  } catch (error) {
    console.error('Error saving session pose data:', error);
    res.status(500).json({ error: 'Failed to save session pose data' });
  }
};

// Start a new session
const startSession = async (req, res) => {
    const { user_id } = req.body;
  
    if (!user_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
  
    try {
      const result = await db.query(
        'INSERT INTO sessions (user_id, date) VALUES ($1, CURRENT_DATE) RETURNING session_id',
        [user_id]
      );
      res.status(201).json({ message: 'Session started successfully', session_id: result.rows[0].session_id });
    } catch (error) {
      console.error('Error starting session:', error);
      res.status(500).json({ error: 'Failed to start session' });
    }
  };
  
  // Function to get the MET value from the categories table
const getMETValueForCategory = async (category_id) => {
    const result = await db.query('SELECT met_value FROM categories WHERE category_id = $1', [category_id]);
    return result.rows[0].met_value;
};

// Function to get the user's weight
const getUserWeight = async (user_id) => {
    try {
        const result = await db.query('SELECT weight FROM users WHERE user_id = $1', [user_id]);

        if (result.rowCount === 0) {
            throw new Error('User not found');
        }

        const { weight } = result.rows[0];

        if (weight === null || weight === undefined) {
            throw new Error('User weight not found');
        }

        return weight;
    } catch (error) {
        console.error('Error getting user weight:', error.message);
        throw error;  // Re-throw the error so it can be caught in the calling function
    }
};

// Function to handle pausing the session
const pauseSession = async (req, res) => {
    const { session_id } = req.body;

    if (!session_id) {
        return res.status(400).json({ error: 'Missing session_id' });
    }

    try {
        // Update the session with the pause start time
        await db.query(
            `UPDATE sessions SET last_pause_start = CURRENT_TIMESTAMP WHERE session_id = $1`,
            [session_id]
        );
        res.status(200).json({ message: 'Session paused successfully' });
    } catch (error) {
        console.error('Error pausing session:', error.message);  // Log only the error message, not the full object
        res.status(500).json({ error: 'Failed to pause session' });
    }
};

// Function to handle resuming the session
const resumeSession = async (req, res) => {
    const { session_id } = req.body;

    if (!session_id) {
        return res.status(400).json({ error: 'Missing session_id' });
    }

    try {
        // Fetch the session to ensure it exists and is paused
        const session = await db.query('SELECT last_pause_start, total_pause_duration FROM sessions WHERE session_id = $1', [session_id]);

        if (session.rowCount === 0) {
            return res.status(404).json({ error: 'Session not found' });
        }

        const { last_pause_start, total_pause_duration } = session.rows[0];

        // Calculate the duration of the pause
        const pauseDuration = Math.floor((new Date() - new Date(last_pause_start)) / 1000);

        // Update the session to add the pause duration to total_pause_duration
        await db.query(
            `UPDATE sessions SET total_pause_duration = $2, last_pause_start = NULL WHERE session_id = $1`,
            [session_id, total_pause_duration + pauseDuration]
        );

        res.status(200).json({ message: 'Session resumed successfully' });
    } catch (error) {
        console.error('Error resuming session:', error.message);
        res.status(500).json({ error: 'Failed to resume session' });
    }
};

const finishSession = async (req, res) => {
    const { session_id, category_id, user_id } = req.body;

    if (!session_id || !category_id || !user_id) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // Ensure the session's `updated_at` is the current timestamp
        await db.query(
            `UPDATE sessions SET updated_at = CURRENT_TIMESTAMP WHERE session_id = $1`,
            [session_id]
        );

        // Get the session start time, end time, and total pause duration
        const sessionResult = await db.query(
            `SELECT created_at, updated_at, total_pause_duration FROM sessions WHERE session_id = $1`,
            [session_id]
        );

        if (sessionResult.rowCount === 0) {
            return res.status(404).json({ error: 'Session not found' });
        }

        const { created_at, updated_at, total_pause_duration } = sessionResult.rows[0];

        // Debugging logs for timestamps and pause duration
        console.log(`created_at: ${created_at}, updated_at: ${updated_at}`);
        console.log(`total_pause_duration: ${total_pause_duration}`);

        // Calculate the total session duration in seconds
        const totalDuration = Math.floor((new Date(updated_at) - new Date(created_at)) / 1000);

        console.log(`totalDuration: ${totalDuration}`);

        // Calculate the active duration (excluding pauses)
        const activeDuration = totalDuration - total_pause_duration;

        console.log(`activeDuration: ${activeDuration}`);

        // Ensure active duration is non-negative and meets the minimum requirement
        if (activeDuration <= 0) {
            return res.status(400).json({ error: 'Active duration must be greater than zero' });
        }

        const durationHours = activeDuration / 3600; // Convert to hours

        // Get the user's weight
        const userWeight = await getUserWeight(user_id);

        // Get the MET value for the category
        const MET = await getMETValueForCategory(category_id);

        // Calculate calories burned using the MET-based formula and ensure it's non-negative
        const calories_burned = Math.max(0, Math.floor(MET * userWeight * durationHours));

        // Update the session with the calculated active duration and calories burned
        await db.query(
            `UPDATE sessions SET duration = $2, calories_burned = $3 WHERE session_id = $1`,
            [session_id, activeDuration, calories_burned]
        );

        // Log the progress in the progress table
        await db.query(
            `INSERT INTO progress (user_id, date, metric, value) VALUES ($1, CURRENT_DATE, 'calories_burned', $2)`,
            [user_id, calories_burned]
        );

        await db.query(
            `INSERT INTO progress (user_id, date, metric, value) VALUES ($1, CURRENT_DATE, 'duration', $2)`,
            [user_id, activeDuration]
        );

        res.status(200).json({ message: 'Session finished successfully', duration: activeDuration, calories_burned });
    } catch (error) {
        console.error('Error finishing session:', error.message);
        res.status(500).json({ error: 'Failed to finish session' });
    }
};


module.exports = { handleSessionData, handleSessionPoseData, startSession, pauseSession, resumeSession, finishSession };
