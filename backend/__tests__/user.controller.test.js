const userController = require("../src/controllers/userController");
const userService = require("../src/services/userService");
const { generateToken } = require("../src/config/jwt");

// Mock the service
jest.mock("../src/services/userService");
jest.mock("../src/config/jwt");

describe("User Controller", () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    mockReq = {
      body: {},
      params: {},
      headers: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe("register", () => {
    it("should register user successfully", async () => {
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        password: "password123",
      };

      const mockUser = {
        _id: "userId123",
        ...userData,
        role: "student",
      };

      mockReq.body = userData;
      userService.registerUser.mockResolvedValue(mockUser);
      generateToken.mockReturnValue("mock-jwt-token");

      await userController.register(mockReq, mockRes);

      expect(userService.registerUser).toHaveBeenCalledWith(userData);
      expect(generateToken).toHaveBeenCalledWith(
        "userId123",
        "student",
        "john@example.com",
        "John"
      );
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockUser,
        token: "mock-jwt-token",
      });
    });

    it("should return 400 for missing required fields", async () => {
      mockReq.body = {
        firstName: "John",
        // Missing lastName, email, password
      };

      await userController.register(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message:
          "Please provide all required fields (firstName, lastName, email, password)",
      });
      expect(userService.registerUser).not.toHaveBeenCalled();
    });

    it("should handle service errors", async () => {
      mockReq.body = {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        password: "password123",
      };

      userService.registerUser.mockRejectedValue(
        new Error("User already exists")
      );

      await userController.register(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "User already exists",
      });
    });

    it("should include optional fields in registration", async () => {
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        password: "password123",
        address: "123 Main St",
        city: "New York",
        state: "NY",
        zipcode: "10001",
        phone: "123-456-7890",
        role: "faculty",
      };

      const mockUser = {
        _id: "userId123",
        ...userData,
      };

      mockReq.body = userData;
      userService.registerUser.mockResolvedValue(mockUser);
      generateToken.mockReturnValue("mock-jwt-token");

      await userController.register(mockReq, mockRes);

      expect(userService.registerUser).toHaveBeenCalledWith(userData);
    });
  });

  describe("login", () => {
    it("should login user successfully", async () => {
      const credentials = {
        email: "john@example.com",
        password: "password123",
      };

      const mockUser = {
        _id: "userId123",
        firstName: "John",
        email: "john@example.com",
        role: "student",
      };

      mockReq.body = credentials;
      userService.authenticateUser.mockResolvedValue(mockUser);
      generateToken.mockReturnValue("mock-jwt-token");

      await userController.login(mockReq, mockRes);

      expect(userService.authenticateUser).toHaveBeenCalledWith(
        credentials.email,
        credentials.password
      );
      expect(generateToken).toHaveBeenCalledWith(
        "userId123",
        "student",
        "john@example.com",
        "John"
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockUser,
        token: "mock-jwt-token",
      });
    });

    it("should return 400 for missing credentials", async () => {
      mockReq.body = {
        email: "john@example.com",
        // Missing password
      };

      await userController.login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Please provide email and password",
      });
      expect(userService.authenticateUser).not.toHaveBeenCalled();
    });

    it("should return 401 for invalid credentials", async () => {
      mockReq.body = {
        email: "john@example.com",
        password: "wrongpassword",
      };

      userService.authenticateUser.mockRejectedValue(
        new Error("Invalid credentials")
      );

      await userController.login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid credentials",
      });
    });
  });

  describe("getAllUsers", () => {
    it("should get all users successfully", async () => {
      const mockUsers = [
        { _id: "user1", firstName: "John", email: "john@example.com" },
        { _id: "user2", firstName: "Jane", email: "jane@example.com" },
      ];

      userService.getAllUsers.mockResolvedValue(mockUsers);

      await userController.getAllUsers(mockReq, mockRes);

      expect(userService.getAllUsers).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        count: 2,
        data: mockUsers,
      });
    });

    it("should handle empty user list", async () => {
      userService.getAllUsers.mockResolvedValue([]);

      await userController.getAllUsers(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        count: 0,
        data: [],
      });
    });

    it("should handle service errors", async () => {
      userService.getAllUsers.mockRejectedValue(new Error("Database error"));

      await userController.getAllUsers(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Database error",
      });
    });
  });

  describe("getUserById", () => {
    it("should get user by id successfully", async () => {
      const mockUser = {
        _id: "userId123",
        firstName: "John",
        email: "john@example.com",
      };

      mockReq.params.id = "userId123";
      userService.getUserById.mockResolvedValue(mockUser);

      await userController.getUserById(mockReq, mockRes);

      expect(userService.getUserById).toHaveBeenCalledWith("userId123");
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockUser,
      });
    });

    it("should return 404 for non-existent user", async () => {
      mockReq.params.id = "nonexistent";
      userService.getUserById.mockRejectedValue(new Error("User not found"));

      await userController.getUserById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "User not found",
      });
    });
  });

  describe("updateUser", () => {
    it("should update user successfully without version", async () => {
      const updateData = {
        firstName: "Jane",
        lastName: "Smith",
      };

      const mockUser = {
        _id: "userId123",
        ...updateData,
      };

      mockReq.params.id = "userId123";
      mockReq.body = updateData;
      userService.updateUser.mockResolvedValue(mockUser);

      await userController.updateUser(mockReq, mockRes);

      expect(userService.updateUser).toHaveBeenCalledWith(
        "userId123",
        updateData,
        undefined
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockUser,
      });
    });

    it("should update user with optimistic locking", async () => {
      const updateData = {
        firstName: "Jane",
        __v: 2,
      };

      const mockUser = {
        _id: "userId123",
        firstName: "Jane",
        __v: 3,
      };

      mockReq.params.id = "userId123";
      mockReq.body = updateData;
      userService.updateUser.mockResolvedValue(mockUser);

      await userController.updateUser(mockReq, mockRes);

      expect(userService.updateUser).toHaveBeenCalledWith(
        "userId123",
        { firstName: "Jane" },
        2
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it("should handle version conflict", async () => {
      mockReq.params.id = "userId123";
      mockReq.body = { firstName: "Jane", __v: 1 };
      userService.updateUser.mockRejectedValue(
        new Error("User not found or has been modified by another process")
      );

      await userController.updateUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "User not found or has been modified by another process",
      });
    });

    it("should handle service errors", async () => {
      mockReq.params.id = "userId123";
      mockReq.body = { firstName: "Jane" };
      userService.updateUser.mockRejectedValue(new Error("Update failed"));

      await userController.updateUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });

  describe("deleteUser", () => {
    it("should delete user successfully", async () => {
      mockReq.params.id = "userId123";
      userService.deleteUser.mockResolvedValue({
        message: "User deleted successfully",
      });

      await userController.deleteUser(mockReq, mockRes);

      expect(userService.deleteUser).toHaveBeenCalledWith("userId123");
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: { message: "User deleted successfully" },
      });
    });

    it("should handle non-existent user", async () => {
      mockReq.params.id = "nonexistent";
      userService.deleteUser.mockRejectedValue(new Error("User not found"));

      await userController.deleteUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "User not found",
      });
    });

    it("should handle service errors", async () => {
      mockReq.params.id = "userId123";
      userService.deleteUser.mockRejectedValue(new Error("Delete failed"));

      await userController.deleteUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });
});
