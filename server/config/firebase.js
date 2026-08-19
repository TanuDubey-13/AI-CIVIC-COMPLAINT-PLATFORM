const admin = require("firebase-admin");

const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
const FIREBASE_CLIENT_EMAIL = process.env.FIREBASE_CLIENT_EMAIL;
const FIREBASE_PRIVATE_KEY = process.env.FIREBASE_PRIVATE_KEY;

const isFirebaseConfigured = () => {
  return Boolean(FIREBASE_PROJECT_ID && FIREBASE_CLIENT_EMAIL && FIREBASE_PRIVATE_KEY);
};

let messaging = null;

if (isFirebaseConfigured()) {
  try {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: FIREBASE_PROJECT_ID,
          clientEmail: FIREBASE_CLIENT_EMAIL,
          privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        }),
      });
    }

    messaging = admin.messaging();
  } catch (error) {
    console.error("Failed to initialize Firebase Admin SDK:", error.message);
  }
} else {
  console.warn("Firebase Admin SDK is not configured. Push notifications are disabled.");
}

module.exports = {
  admin,
  messaging,
  isFirebaseEnabled: () => Boolean(messaging),
};
