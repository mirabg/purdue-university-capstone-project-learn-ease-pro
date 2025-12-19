require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/database");
const routes = require("./src/routes");

// Initialize Express app
const app = express();

// Connect to MongoDB only if not in test environment
if (process.env.NODE_ENV !== "test") {
  connectDB();
}

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (development)
if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Routes
app.use("/api", routes);

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to LearnEasePro API",
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      users: "/api/users",
    },
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// Handle 404 routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Only start server if this file is run directly (not when imported)
if (require.main === module) {
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(
      `Server is running on port ${PORT} in ${process.env.NODE_ENV} mode`
    );
  });
}

module.exports = app;
