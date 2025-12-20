const request = require("supertest");
const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const User = require("../../src/models/User");

// Import app without triggering server startup
let app;

describe("User Routes Integration Tests", () => {
  let mongoServer;
  let adminToken;
  let studentToken;
  let facultyToken;
  let adminUser;
  let studentUser;
  let facultyUser;

  beforeAll(async () => {
    // Disconnect from any existing connection
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    // Create in-memory MongoDB instance
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    // Connect to in-memory database
    await mongoose.connect(mongoUri);

    // Import app after database is ready
    app = require("../../server");
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clear database before each test
    await User.deleteMany({});

    // Create admin user and get token
    const adminRes = await request(app).post("/api/users/register").send({
      firstName: "Admin",
      lastName: "User",
      email: "admin@test.com",
      password: "password123",
      role: "admin",
    });

    if (adminRes.body.success) {
      adminToken = adminRes.body.token;
      adminUser = adminRes.body.data;
    } else {
      console.error("Failed to create admin user:", adminRes.body);
    }

    // Create student user and get token
    const studentRes = await request(app).post("/api/users/register").send({
      firstName: "Student",
      lastName: "User",
      email: "student@test.com",
      password: "password123",
      role: "student",
    });

    if (studentRes.body.success) {
      studentToken = studentRes.body.token;
      studentUser = studentRes.body.data;
    } else {
      console.error("Failed to create student user:", studentRes.body);
    }

    // Create faculty user and get token
    const facultyRes = await request(app).post("/api/users/register").send({
      firstName: "Faculty",
      lastName: "User",
      email: "faculty@test.com",
      password: "password123",
      role: "faculty",
    });

    if (facultyRes.body.success) {
      facultyToken = facultyRes.body.token;
      facultyUser = facultyRes.body.data;
    } else {
      console.error("Failed to create faculty user:", facultyRes.body);
    }
  });

  describe("POST /api/users/register", () => {
    it("should register a new user with valid data", async () => {
      const res = await request(app).post("/api/users/register").send({
        firstName: "John",
        lastName: "Doe",
        email: "john@test.com",
        password: "password123",
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("_id");
      expect(res.body.data.firstName).toBe("John");
      expect(res.body.data.email).toBe("john@test.com");
      expect(res.body.data.role).toBe("student"); // Default role
      expect(res.body).toHaveProperty("token");
      expect(res.body.data).not.toHaveProperty("password");
    });

    it("should return token with email and firstName on registration", async () => {
      const res = await request(app).post("/api/users/register").send({
        firstName: "TestUser",
        lastName: "Test",
        email: "testtoken@test.com",
        password: "password123",
      });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("token");

      // Verify token contains email and firstName
      const { verifyToken } = require("../../src/config/jwt");
      const decoded = verifyToken(res.body.token);

      expect(decoded).toBeDefined();
      expect(decoded.email).toBe("testtoken@test.com");
      expect(decoded.firstName).toBe("TestUser");
      expect(decoded.role).toBe("student");
      expect(decoded.id).toBeDefined();
    });

    it("should register user with all optional fields", async () => {
      const res = await request(app).post("/api/users/register").send({
        firstName: "Jane",
        lastName: "Smith",
        email: "jane@test.com",
        password: "password123",
        address: "123 Main St",
        city: "Boston",
        state: "MA",
        zipcode: "02101",
        phone: "617-555-1234",
        role: "faculty",
      });

      expect(res.status).toBe(201);
      expect(res.body.data.address).toBe("123 Main St");
      expect(res.body.data.city).toBe("Boston");
      expect(res.body.data.state).toBe("MA");
      expect(res.body.data.zipcode).toBe("02101");
      expect(res.body.data.phone).toBe("617-555-1234");
      expect(res.body.data.role).toBe("faculty");
    });

    it("should return 400 for missing required fields", async () => {
      const res = await request(app).post("/api/users/register").send({
        firstName: "John",
        email: "john@test.com",
        // Missing lastName and password
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 400 for duplicate email", async () => {
      const res = await request(app).post("/api/users/register").send({
        firstName: "John",
        lastName: "Doe",
        email: "admin@test.com", // Already exists
        password: "password123",
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 400 for invalid email format", async () => {
      const res = await request(app).post("/api/users/register").send({
        firstName: "John",
        lastName: "Doe",
        email: "invalid-email",
        password: "password123",
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 400 for password shorter than 6 characters", async () => {
      const res = await request(app).post("/api/users/register").send({
        firstName: "John",
        lastName: "Doe",
        email: "john@test.com",
        password: "12345", // Too short
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 400 for invalid phone format", async () => {
      const res = await request(app).post("/api/users/register").send({
        firstName: "John",
        lastName: "Doe",
        email: "john@test.com",
        password: "password123",
        phone: "1234567890", // Invalid format
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("POST /api/users/login", () => {
    it("should login with valid credentials", async () => {
      const res = await request(app).post("/api/users/login").send({
        email: "admin@test.com",
        password: "password123",
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty("token");
      expect(res.body.data.email).toBe("admin@test.com");
      expect(res.body.data).not.toHaveProperty("password");
    });

    it("should return token with email and firstName fields", async () => {
      const res = await request(app).post("/api/users/login").send({
        email: "admin@test.com",
        password: "password123",
      });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("token");

      // Verify token can be decoded and contains email and firstName
      const { verifyToken } = require("../../src/config/jwt");
      const decoded = verifyToken(res.body.token);

      expect(decoded).toBeDefined();
      expect(decoded.email).toBe("admin@test.com");
      expect(decoded.firstName).toBe("Admin");
      expect(decoded.role).toBe("admin");
      expect(decoded.id).toBeDefined();
    });

    it("should return 401 for incorrect password", async () => {
      const res = await request(app).post("/api/users/login").send({
        email: "admin@test.com",
        password: "wrongpassword",
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should return 401 for non-existent email", async () => {
      const res = await request(app).post("/api/users/login").send({
        email: "nonexistent@test.com",
        password: "password123",
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should return 400 for missing credentials", async () => {
      const res = await request(app).post("/api/users/login").send({
        email: "admin@test.com",
        // Missing password
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("GET /api/users", () => {
    it("should allow admin to get all users", async () => {
      const res = await request(app)
        .get("/api/users")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(3); // admin, student, faculty
      expect(res.body.count).toBe(3);
    });

    it("should return 403 when student tries to get all users", async () => {
      const res = await request(app)
        .get("/api/users")
        .set("Authorization", `Bearer ${studentToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it("should return 403 when faculty tries to get all users", async () => {
      const res = await request(app)
        .get("/api/users")
        .set("Authorization", `Bearer ${facultyToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it("should return 401 when no token is provided", async () => {
      const res = await request(app).get("/api/users");

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should return 401 with invalid token", async () => {
      const res = await request(app)
        .get("/api/users")
        .set("Authorization", "Bearer invalid-token");

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe("GET /api/users/:id", () => {
    it("should allow admin to get any user", async () => {
      const res = await request(app)
        .get(`/api/users/${studentUser._id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe(studentUser._id);
      expect(res.body.data.email).toBe("student@test.com");
    });

    it("should allow user to get their own profile", async () => {
      const res = await request(app)
        .get(`/api/users/${studentUser._id}`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe(studentUser._id);
    });

    it("should return 403 when student tries to get another user", async () => {
      const res = await request(app)
        .get(`/api/users/${facultyUser._id}`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it("should return 404 for non-existent user", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/users/${fakeId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it("should return 401 when no token is provided", async () => {
      const res = await request(app).get(`/api/users/${studentUser._id}`);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe("PUT /api/users/:id", () => {
    it("should allow admin to update any user", async () => {
      const res = await request(app)
        .put(`/api/users/${studentUser._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          firstName: "UpdatedName",
          city: "New York",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.firstName).toBe("UpdatedName");
      expect(res.body.data.city).toBe("New York");
    });

    it("should allow user to update their own profile", async () => {
      const res = await request(app)
        .put(`/api/users/${studentUser._id}`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send({
          firstName: "UpdatedStudent",
          phone: "555-123-4567",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.firstName).toBe("UpdatedStudent");
      expect(res.body.data.phone).toBe("555-123-4567");
    });

    it("should handle optimistic locking with version", async () => {
      const user = await User.findById(studentUser._id);
      const currentVersion = user.__v;

      const res = await request(app)
        .put(`/api/users/${studentUser._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          firstName: "UpdatedWithVersion",
          __v: currentVersion,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.firstName).toBe("UpdatedWithVersion");
      expect(res.body.data.__v).toBe(currentVersion + 1);
    });

    it("should return 400 for version conflict", async () => {
      const res = await request(app)
        .put(`/api/users/${studentUser._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          firstName: "UpdatedName",
          __v: 999, // Wrong version
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("modified");
    });

    it("should return 403 when student tries to update another user", async () => {
      const res = await request(app)
        .put(`/api/users/${facultyUser._id}`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send({
          firstName: "Hacked",
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it("should silently ignore password updates", async () => {
      const res = await request(app)
        .put(`/api/users/${studentUser._id}`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send({
          password: "newpassword",
          firstName: "UpdatedName",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.firstName).toBe("UpdatedName");

      // Verify password was not changed
      const loginRes = await request(app).post("/api/users/login").send({
        email: "student@test.com",
        password: "password123", // Original password should still work
      });
      expect(loginRes.status).toBe(200);
    });

    it("should return 400 for invalid field values", async () => {
      const res = await request(app)
        .put(`/api/users/${studentUser._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          firstName: "a".repeat(51), // Exceeds max length
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 400 for invalid ObjectId format", async () => {
      const invalidId = "invalid-id";
      const res = await request(app)
        .put(`/api/users/${invalidId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          firstName: "Test",
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 400 for non-existent user", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/users/${fakeId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          firstName: "Test",
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 401 when no token is provided", async () => {
      const res = await request(app).put(`/api/users/${studentUser._id}`).send({
        firstName: "Test",
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe("DELETE /api/users/:id", () => {
    it("should allow admin to delete any user", async () => {
      const res = await request(app)
        .delete(`/api/users/${studentUser._id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify user is actually deleted
      const deletedUser = await User.findById(studentUser._id);
      expect(deletedUser).toBeNull();
    });

    it("should return 403 when student tries to delete a user", async () => {
      const res = await request(app)
        .delete(`/api/users/${facultyUser._id}`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it("should allow student to delete themselves", async () => {
      const res = await request(app)
        .delete(`/api/users/${studentUser._id}`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify user is actually deleted
      const deletedUser = await User.findById(studentUser._id);
      expect(deletedUser).toBeNull();
    });

    it("should return 403 when faculty tries to delete a user", async () => {
      const res = await request(app)
        .delete(`/api/users/${studentUser._id}`)
        .set("Authorization", `Bearer ${facultyToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it("should return 400 for invalid ObjectId format", async () => {
      const invalidId = "invalid-id";
      const res = await request(app)
        .delete(`/api/users/${invalidId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 400 for non-existent user", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .delete(`/api/users/${fakeId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 401 when no token is provided", async () => {
      const res = await request(app).delete(`/api/users/${studentUser._id}`);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe("Authentication Edge Cases", () => {
    it("should handle malformed authorization header", async () => {
      const res = await request(app)
        .get("/api/users")
        .set("Authorization", "InvalidFormat");

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should handle missing Bearer prefix", async () => {
      const res = await request(app)
        .get("/api/users")
        .set("Authorization", adminToken);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should handle empty bearer token", async () => {
      const res = await request(app)
        .get("/api/users")
        .set("Authorization", "Bearer ");

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe("JWT Token Workflow", () => {
    it("should use token from registration for authenticated requests", async () => {
      // Register new user
      const registerRes = await request(app).post("/api/users/register").send({
        firstName: "Test",
        lastName: "User",
        email: "test@test.com",
        password: "password123",
      });

      const token = registerRes.body.token;
      const userId = registerRes.body.data._id;

      // Use token to access protected route
      const res = await request(app)
        .get(`/api/users/${userId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data._id).toBe(userId);
    });

    it("should use token from login for authenticated requests", async () => {
      // Login existing user
      const loginRes = await request(app).post("/api/users/login").send({
        email: "student@test.com",
        password: "password123",
      });

      const token = loginRes.body.token;

      // Use token to update profile
      const res = await request(app)
        .put(`/api/users/${studentUser._id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          city: "Boston",
        });

      expect(res.status).toBe(200);
      expect(res.body.data.city).toBe("Boston");
    });
  });

  describe("Role-Based Access Control", () => {
    it("should enforce admin-only access for GET /api/users", async () => {
      const roles = [
        { token: adminToken, role: "admin", shouldSucceed: true },
        { token: studentToken, role: "student", shouldSucceed: false },
        { token: facultyToken, role: "faculty", shouldSucceed: false },
      ];

      for (const { token, role, shouldSucceed } of roles) {
        const res = await request(app)
          .get("/api/users")
          .set("Authorization", `Bearer ${token}`);

        if (shouldSucceed) {
          expect(res.status).toBe(200);
        } else {
          expect(res.status).toBe(403);
        }
      }
    });

    it("should enforce admin-only access for DELETE", async () => {
      // Create a user to delete
      const userToDelete = await User.create({
        firstName: "Delete",
        lastName: "Me",
        email: "delete@test.com",
        password: "password123",
      });

      const roles = [
        { token: studentToken, role: "student", shouldSucceed: false },
        { token: facultyToken, role: "faculty", shouldSucceed: false },
        { token: adminToken, role: "admin", shouldSucceed: true },
      ];

      for (const { token, role, shouldSucceed } of roles) {
        if (role === "admin") {
          // Admin should succeed
          const res = await request(app)
            .delete(`/api/users/${userToDelete._id}`)
            .set("Authorization", `Bearer ${token}`);

          expect(res.status).toBe(200);
        } else {
          // Non-admin should fail
          const res = await request(app)
            .delete(`/api/users/${userToDelete._id}`)
            .set("Authorization", `Bearer ${token}`);

          expect(res.status).toBe(403);
        }
      }
    });

    it("should allow admin or owner for GET user by id", async () => {
      // Admin accessing another user's profile
      const res1 = await request(app)
        .get(`/api/users/${studentUser._id}`)
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res1.status).toBe(200);

      // Student accessing their own profile
      const res2 = await request(app)
        .get(`/api/users/${studentUser._id}`)
        .set("Authorization", `Bearer ${studentToken}`);
      expect(res2.status).toBe(200);

      // Faculty accessing student's profile (should fail)
      const res3 = await request(app)
        .get(`/api/users/${studentUser._id}`)
        .set("Authorization", `Bearer ${facultyToken}`);
      expect(res3.status).toBe(403);
    });
  });
});
