const User = require("../models/User");

const registerDeviceToken = async (req, res) => {
  try {
    const { deviceToken } = req.body;

    if (!deviceToken || typeof deviceToken !== "string") {
      return res.status(400).json({
        success: false,
        message: "Valid deviceToken is required",
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Authenticated user not found",
      });
    }

    const tokenExists = user.firebaseDeviceTokens.includes(deviceToken);
    if (!tokenExists) {
      user.firebaseDeviceTokens.push(deviceToken);
      await user.save();
    }

    return res.status(200).json({
      success: true,
      message: "Device token registered successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while registering device token",
    });
  }
};

const removeDeviceToken = async (req, res) => {
  try {
    const { deviceToken } = req.body;

    if (!deviceToken || typeof deviceToken !== "string") {
      return res.status(400).json({
        success: false,
        message: "Valid deviceToken is required",
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Authenticated user not found",
      });
    }

    user.firebaseDeviceTokens = user.firebaseDeviceTokens.filter((token) => token !== deviceToken);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Device token removed successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while removing device token",
    });
  }
};

module.exports = {
  registerDeviceToken,
  removeDeviceToken,
};
