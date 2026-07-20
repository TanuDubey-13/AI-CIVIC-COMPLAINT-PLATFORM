exports.classifyComplaint = (text) => {
  return { category: 'general', confidence: 0.5, summary: text };
};
