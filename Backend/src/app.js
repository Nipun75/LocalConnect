const express = require("express");
const cors = require("cors");
const aiRoutes = require("./routes/aiRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// AI Intelligence Layer Routes
app.use("/api/ai", aiRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "LocalConnect AI-Powered Hyperlocal Backend is running",
    features: [
      "Natural Language Need Parser",
      "Semantic Matching Engine",
      "7-Factor Weighted Ranking",
      "Explainable AI Scorecards",
      "Trust Scoring & Verification",
    ],
  });
});

module.exports = app;