// Mock the controller and middleware BEFORE importing routes
jest.mock("../src/controllers/userController");
jest.mock("../src/middleware/auth", () => ({
  requireAdmin: jest.fn((req, res, next) => next()),
  requireAuth: jest.fn((req, res, next) => next()),
  authorizeAdminOrOwner: jest.fn(() => (req, res, next) => next()),
}));

const request = require("supertest");
const express = require("express");
const userRoutes = require("../src/routes/userRoutes");
const userController = require("../src/controllers/userController");
const {
  requireAdmin,
  authorizeAdminOrOwner,
} = require("../src/middleware/auth");

// Create express app for testing
const app = express();
app.use(express.json());
app.use("/users", userRoutes);

describe("User Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock middleware to pass through
    requireAdmin.mockImplementation((req, res, next) => next());
    authorizeAdminOrOwner.mockImplementation(() => (req, res, next) => next());

    // Mock controller responses
    userController.register.mockImplementation((req, res) =>
      res.status(201).json({ success: true })
    );
    userController.login.mockImplementation((req, res) =>
      res.status(200).json({ success: true })
    );
    userController.getAllUsers.mockImplementation((req, res) =>
      res.status(200).json({ success: true, data: [] })
    );
    userController.getUserById.mockImplementation((req, res) =>
      res.status(200).json({ success: true, data: {} })
    );
    userController.updateUser.mockImplementation((req, res) =>
      res.status(200).json({ success: true, data: {} })
    );
    userController.deleteUser.mockImplementation((req, res) =>
      res.status(200).json({ success: true })
    );
  });

  describe("POST /users/register", () => {
    it("should call register controller", async () => {
      const response = await request(app)
        .post("/users/register")
        .send({ email: "test@example.com", password: "password123" });

      expect(response.status).toBe(201);
      expect(userController.register).toHaveBeenCalled();
    });

    it("should not require authentication", async () => {
      await request(app).post("/users/register").send({});

      expect(requireAdmin).not.toHaveBeenCalled();
      expect(authorizeAdminOrOwner).not.toHaveBeenCalled();
    });
  });

  describe("POST /users/login", () => {
    it("should call login controller", async () => {
      const response = await request(app)
        .post("/users/login")
        .send({ email: "test@example.com", password: "password123" });

      expect(response.status).toBe(200);
      expect(userController.login).toHaveBeenCalled();
    });

    it("should not require authentication", async () => {
      await request(app).post("/users/login").send({});

      expect(requireAdmin).not.toHaveBeenCalled();
      expect(authorizeAdminOrOwner).not.toHaveBeenCalled();
    });
  });

  describe("GET /users", () => {
    it("should call getAllUsers controller", async () => {
      const response = await request(app).get("/users");

      expect(response.status).toBe(200);
      expect(userController.getAllUsers).toHaveBeenCalled();
    });

    it("should require admin role", async () => {
      await request(app).get("/users");

      expect(requireAdmin).toHaveBeenCalled();
    });
  });

  describe("GET /users/:id", () => {
    it("should call getUserById controller", async () => {
      const response = await request(app).get("/users/123");

      expect(response.status).toBe(200);
      expect(userController.getUserById).toHaveBeenCalled();
    });
  });

  describe("DELETE /users/:id", () => {
    it("should call deleteUser controller", async () => {
      const response = await request(app).delete("/users/123");

      expect(response.status).toBe(200);
      expect(userController.deleteUser).toHaveBeenCalled();
    });
  });

  describe("Route Parameters", () => {
    it("should pass route parameters to controller", async () => {
      await request(app).get("/users/userId123");

      expect(userController.getUserById).toHaveBeenCalled();
      const req = userController.getUserById.mock.calls[0][0];
      expect(req.params.id).toBe("userId123");
    });

    it("should pass request body to controller", async () => {
      const userData = { firstName: "John", lastName: "Doe" };
      await request(app).put("/users/123").send(userData);

      expect(userController.updateUser).toHaveBeenCalled();
      const req = userController.updateUser.mock.calls[0][0];
      expect(req.body).toEqual(userData);
    });
  });
});
