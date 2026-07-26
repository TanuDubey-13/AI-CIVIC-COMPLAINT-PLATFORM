const Complaint = require("../models/Complaint");
const { getCategoryWithConfidence, getSeverity, getSummary } = require("../utils/aiPrompt");
const { getGeminiModel } = require("../config/gemini");

const normalizeText = (value) => {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim();
};

const buildDuplicateResult = async (title, description) => {
  const titleText = normalizeText(title);
  const descriptionText = normalizeText(description);

  try {
    const similarComplaints = await Complaint.find({
      $or: [
        { title: { $regex: titleText, $options: "i" } },
        { description: { $regex: descriptionText, $options: "i" } },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    if (!similarComplaints.length) {
      return {
        duplicate: false,
        duplicatePercentage: 0,
        matchedComplaintId: null,
      };
    }

    const combinedText = `${titleText} ${descriptionText}`.toLowerCase();
    const bestMatch = similarComplaints.reduce((best, complaint) => {
      const targetText = `${complaint.title || ""} ${complaint.description || ""}`.toLowerCase();
      const sharedWords = combinedText.split(/\s+/).filter((word) => word.length > 3 && targetText.includes(word));
      const overlapScore = sharedWords.length;
      const score = overlapScore * 15 + (targetText.includes(titleText.toLowerCase()) ? 20 : 0);

      if (!best || score > best.score) {
        return { score, complaint };
      }

      return best;
    }, null);

    const percentage = Math.min(95, Math.max(20, bestMatch.score));

    return {
      duplicate: percentage >= 45,
      duplicatePercentage: percentage,
      matchedComplaintId: bestMatch?.complaint?._id ? bestMatch.complaint._id.toString() : null,
    };
  } catch (error) {
    return {
      duplicate: false,
      duplicatePercentage: 0,
      matchedComplaintId: null,
    };
  }

  const combinedText = `${titleText} ${descriptionText}`.toLowerCase();
  const bestMatch = similarComplaints.reduce((best, complaint) => {
    const targetText = `${complaint.title || ""} ${complaint.description || ""}`.toLowerCase();
    const sharedWords = combinedText.split(/\s+/).filter((word) => word.length > 3 && targetText.includes(word));
    const overlapScore = sharedWords.length;
    const score = overlapScore * 15 + (targetText.includes(titleText.toLowerCase()) ? 20 : 0);

    if (!best || score > best.score) {
      return { score, complaint };
    }

    return best;
  }, null);

  const percentage = Math.min(95, Math.max(20, bestMatch.score));

  return {
    duplicate: percentage >= 45,
    duplicatePercentage: percentage,
    matchedComplaintId: bestMatch?.complaint?._id ? bestMatch.complaint._id.toString() : null,
  };
};

const runGeminiAnalysis = async (title, description) => {
  const model = getGeminiModel();

  if (!model) {
    return null;
  }

  try {
    const prompt = `Classify this civic complaint. Respond with strict JSON only. Fields: category, severity, department, summary. Allowed categories: Road Damage, Garbage, Water Leakage, Electricity, Street Light, Drainage, Illegal Construction, Public Property Damage, Others. Severity must be one of Low, Medium, High, Critical. Department must be one of PWD, Municipal Corporation, Electricity Department, Jal Nigam, Drainage Department, Others. Complaint title: ${title}. Complaint description: ${description}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const cleanedResponse = responseText.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleanedResponse);

    return {
      category: parsed.category || "Others",
      severity: parsed.severity || "Medium",
      department: parsed.department || "Municipal Corporation",
      summary: parsed.summary || `${title} reported by citizen.`,
    };
  } catch (error) {
    console.error("Gemini analysis failed, falling back to heuristic logic:", error.message);
    return null;
  }
};

const analyzeComplaint = async ({ title, description }) => {
  const normalizedTitle = normalizeText(title);
  const normalizedDescription = normalizeText(description);

  if (!normalizedTitle || !normalizedDescription) {
    const error = new Error("Title and description are required");
    error.statusCode = 400;
    throw error;
  }

  if (normalizedTitle.length < 5) {
    const error = new Error("Title must be at least 5 characters long");
    error.statusCode = 400;
    throw error;
  }

  if (normalizedDescription.length < 20) {
    const error = new Error("Description must be at least 20 characters long");
    error.statusCode = 400;
    throw error;
  }

  const [heuristicPrediction, duplicateResult, geminiResult] = await Promise.all([
    Promise.resolve(getCategoryWithConfidence(normalizedTitle, normalizedDescription)),
    buildDuplicateResult(normalizedTitle, normalizedDescription),
    runGeminiAnalysis(normalizedTitle, normalizedDescription),
  ]);

  const category = geminiResult?.category || heuristicPrediction.category;
  const severity = geminiResult?.severity || getSeverity(normalizedTitle, normalizedDescription, category);
  const department = geminiResult?.department || heuristicPrediction.department;
  const summary = geminiResult?.summary || getSummary(normalizedTitle, normalizedDescription);

  return {
    category,
    severity,
    department,
    summary,
    duplicate: duplicateResult.duplicate,
    confidence: heuristicPrediction.confidence,
    duplicatePercentage: duplicateResult.duplicatePercentage,
    matchedComplaintId: duplicateResult.matchedComplaintId,
  };
};

module.exports = {
  analyzeComplaint,
};
