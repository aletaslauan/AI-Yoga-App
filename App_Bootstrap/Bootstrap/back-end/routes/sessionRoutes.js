const express = require('express');
const { handleSessionData, handleSessionPoseData, startSession, stopSession, resumeSession, finishSession, pauseSession } = require('../controllers/sessionController');
const router = express.Router();

router.post('/sessions', handleSessionData);
//router.post('/sessionposes', handleSessionPoseData);
router.post('/sessions/:sessionId/poses', handleSessionPoseData);

// Start a new session
router.post('/sessions/start', startSession);

router.post('/sessions/pause', pauseSession);

// Resume session route
router.put('/sessions/resume', resumeSession);

// Stop an ongoing session
//router.put('/sessions/:session_id/stop', stopSession);

// Finish a session and record progress
router.put('/sessions/finish', finishSession);

module.exports = router;
