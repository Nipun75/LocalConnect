const express = require("express");
const router = express.Router();
const aiController = require("../controllers/aiController");

router.post("/parse-need", aiController.parseNeed);
router.post("/match", aiController.matchProviders);
router.post("/chat", aiController.refineChat);
router.post("/refine", aiController.refineChat);
router.get("/recommendations", aiController.getRecommendations);
router.post("/feedback", aiController.recordFeedback);

module.exports = router;
