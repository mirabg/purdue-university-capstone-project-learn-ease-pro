const request = require("supertest");
const express = require("express");
const routes = require("../src/routes");

// Create express app for testing
const app = express();
app.use(express.json());
app.use("/api", routes);

describe("Routes Index", () => {
  describe("Health Check Route", () => {
    it("should return health check status", async () => {
      const response = await request(app).get("/api/health");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("API is running");
      expect(response.body.timestamp).toBeDefined();
    });

    it("should return valid ISO timestamp", async () => {
      const response = await request(app).get("/api/health");

      expect(response.body.timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/
      );
    });
  });

  describe("User Routes Integration", () => {
    it("should have user routes mounted at /users", async () => {
      // This will hit the route but fail authentication
      // Just checking that the route exists
      const response = await request(app).post("/api/users/register").send({});

      // Should get a response (not 404), even if it's a validation error
      expect(response.status).not.toBe(404);
    });
  });
});
