const express = require("express");
const router = express.Router();
const { registerDeviceToken, removeDeviceToken } = require("../controllers/firebaseController");
const { protect } = require("../middleware/auth");

router.post("/register-device", protect, registerDeviceToken);
router.post("/remove-device", protect, removeDeviceToken);

module.exports = router;
