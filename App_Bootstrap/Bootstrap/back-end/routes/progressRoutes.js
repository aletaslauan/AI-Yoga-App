const express = require('express');
const { getProgressByUser } = require('../controllers/progressController');
const router = express.Router();

router.get('/:user_id', getProgressByUser); // Adjust the path as necessary

module.exports = router;
