const { analyzeComplaint: analyzeComplaintService } = require("../services/aiService");

const analyzeComplaint = async (req, res, next) => {
  try {
    const { title, description } = req.body || {};

    const result = await analyzeComplaintService({ title, description });

    return res.status(200).json({
      success: true,
      message: "AI analysis completed successfully",
      data: result,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Unable to analyze complaint",
    });
  }
};

module.exports = {
  analyzeComplaint,
};
