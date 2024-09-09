const express = require('express');
const { fetchCalendarData } = require('../controllers/calendarController');
const router = express.Router();

router.get('/calendar', fetchCalendarData);

module.exports = router;
