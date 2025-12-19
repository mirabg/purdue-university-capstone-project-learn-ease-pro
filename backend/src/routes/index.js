const express = require("express");
const router = express.Router();
const userRoutes = require("./userRoutes");

// API routes
router.use("/users", userRoutes);

// Health check route
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
