const { GoogleGenerativeAI } = require("@google/generative-ai");

let cachedModel = null;

const getGeminiModel = () => {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }

  if (cachedModel) {
    return cachedModel;
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    cachedModel = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
    });
    return cachedModel;
  } catch (error) {
    console.error("Gemini client initialization failed:", error.message);
    return null;
  }
};

module.exports = {
  getGeminiModel,
};
