const { parseNeedQuery, rankBackendProviders, refineBackendRequirement, getAllBackendProviders } = require("../services/aiService");

// POST /api/ai/parse-need
exports.parseNeed = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ success: false, message: "Query string is required" });
    }
    const parsed = parseNeedQuery(query);
    return res.json({ success: true, data: parsed });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/ai/match
exports.matchProviders = async (req, res) => {
  try {
    const { requirement } = req.body;
    if (!requirement) {
      return res.status(400).json({ success: false, message: "Requirement object is required" });
    }
    const matches = rankBackendProviders(requirement);
    return res.json({ success: true, data: matches });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/ai/chat / refine
exports.refineChat = async (req, res) => {
  try {
    const { requirement, message } = req.body;
    const updated = message ? refineBackendRequirement(requirement, message) : { ...requirement };
    const matches = rankBackendProviders(updated);
    return res.json({ success: true, data: { requirement: updated, matches } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/providers/recommendations
exports.getRecommendations = async (req, res) => {
  try {
    const providers = getAllBackendProviders();
    return res.json({ success: true, data: providers });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/ai/feedback
exports.recordFeedback = async (req, res) => {
  try {
    const { providerId, requestId, useful } = req.body;
    return res.json({
      success: true,
      message: "Feedback recorded successfully",
      data: { providerId, requestId, useful, recorded_at: new Date().toISOString() },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
