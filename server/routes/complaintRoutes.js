const express = require('express');
const router = express.Router();
const { getComplaints, createComplaint } = require('../controllers/complaintController');

router.get('/', getComplaints);
router.post('/', createComplaint);

module.exports = router;
