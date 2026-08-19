const { messaging, isFirebaseEnabled } = require("../config/firebase");

const sendPushNotification = async (tokens, payload) => {
  if (!isFirebaseEnabled()) {
    console.warn("Firebase push notifications disabled because credentials are not configured.");
    return null;
  }

  if (!Array.isArray(tokens) || tokens.length === 0) {
    return null;
  }

  try {
    const response = await messaging.sendMulticast({
      tokens,
      notification: payload.notification,
      data: payload.data,
    });

    return response;
  } catch (error) {
    console.error("Firebase push notification failed:", error.message);
    return null;
  }
};

module.exports = {
  sendPushNotification,
};
