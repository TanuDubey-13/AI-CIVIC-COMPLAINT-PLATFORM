const CATEGORY_RULES = [
  {
    category: "Road Damage",
    keywords: ["road", "pothole", "lane", "street", "crack", "surface", "traffic", "speedbreaker", "bridge"],
    department: "PWD",
  },
  {
    category: "Garbage",
    keywords: ["garbage", "trash", "waste", "dump", "litter", "dust", "rubbish", "bin"],
    department: "Municipal Corporation",
  },
  {
    category: "Water Leakage",
    keywords: ["water", "leak", "pipe", "tap", "drip", "pipeline", "flood", "sewage"],
    department: "Jal Nigam",
  },
  {
    category: "Electricity",
    keywords: ["electricity", "power", "voltage", "transformer", "short circuit", "wire", "outage", "current"],
    department: "Electricity Department",
  },
  {
    category: "Street Light",
    keywords: ["street light", "streetlight", "light pole", "lamp", "lighting", "dark street"],
    department: "Electricity Department",
  },
  {
    category: "Drainage",
    keywords: ["drain", "drainage", "block", "clog", "storm", "waterlogging", "overflow"],
    department: "Drainage Department",
  },
  {
    category: "Illegal Construction",
    keywords: ["illegal construction", "unauthorized", "encroachment", "building without permission", "construction"],
    department: "Municipal Corporation",
  },
  {
    category: "Public Property Damage",
    keywords: ["public property", "park", "bench", "bus stop", "signboard", "damaged property", "heritage"],
    department: "PWD",
  },
];

const getCategoryWithConfidence = (title, description) => {
  const text = `${title || ""} ${description || ""}`.toLowerCase();
  const scores = CATEGORY_RULES.map((rule) => ({
    category: rule.category,
    score: rule.keywords.reduce((total, keyword) => {
      return total + (text.includes(keyword.toLowerCase()) ? 1 : 0);
    }, 0),
    department: rule.department,
  }));

  const bestMatch = scores.reduce((best, current) => {
    if (current.score > best.score) {
      return current;
    }
    return best;
  }, scores[0] || { category: "Others", score: 0, department: "Municipal Corporation" });

  const fallback = text.includes("road") || text.includes("pothole")
    ? { category: "Road Damage", department: "PWD" }
    : text.includes("light") || text.includes("lamp")
      ? { category: "Street Light", department: "Electricity Department" }
      : text.includes("garbage") || text.includes("trash") || text.includes("waste")
        ? { category: "Garbage", department: "Municipal Corporation" }
        : text.includes("water") || text.includes("leak") || text.includes("drip")
          ? { category: "Water Leakage", department: "Jal Nigam" }
          : text.includes("drain") || text.includes("clog") || text.includes("waterlogging")
            ? { category: "Drainage", department: "Drainage Department" }
            : text.includes("electric") || text.includes("power") || text.includes("transformer")
              ? { category: "Electricity", department: "Electricity Department" }
              : { category: "Others", department: "Municipal Corporation" };

  const resolvedCategory = bestMatch.score > 0 ? bestMatch.category : fallback.category;
  const resolvedDepartment = bestMatch.score > 0 ? bestMatch.department : fallback.department;

  const confidence = Math.min(98, Math.max(65, Math.round(70 + bestMatch.score * 8 + (resolvedCategory === fallback.category ? 5 : 0))));

  return {
    category: resolvedCategory,
    confidence,
    department: resolvedDepartment,
  };
};

const getSeverity = (title, description, category) => {
  const text = `${title || ""} ${description || ""}`.toLowerCase();
  const severitySignals = [
    { level: "Critical", keywords: ["fatal", "death", "injury", "emergency", "explosion", "fire", "gas leak", "collapse", "danger"] },
    { level: "High", keywords: ["urgent", "severe", "major", "large", "broken", "unsafe", "flood", "power outage"] },
    { level: "Medium", keywords: ["bad", "problem", "issue", "damaged", "leaking", "poor", "noisy"] },
  ];

  const matched = severitySignals.find((signal) => signal.keywords.some((keyword) => text.includes(keyword)));
  if (matched) {
    return matched.level;
  }

  if (category === "Road Damage" || category === "Electricity" || category === "Water Leakage") {
    return "High";
  }

  if (category === "Garbage" || category === "Drainage" || category === "Street Light") {
    return "Medium";
  }

  return "Low";
};

const getSummary = (title, description) => {
  const base = `${title || ""} ${description || ""}`.trim();
  if (!base) {
    return "Public complaint reported.";
  }

  const cleaned = base.replace(/\s+/g, " ").trim();
  return cleaned.length > 140 ? `${cleaned.slice(0, 137)}...` : cleaned;
};

module.exports = {
  getCategoryWithConfidence,
  getSeverity,
  getSummary,
};
