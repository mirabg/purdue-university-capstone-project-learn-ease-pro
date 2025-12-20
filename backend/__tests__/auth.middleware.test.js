const {
  requireAuth,
  requireAdmin,
  authorizeAdminOrOwner,
} = require("../src/middleware/auth");
const { generateToken } = require("../src/config/jwt");

describe("Auth Middleware", () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      headers: {},
      params: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  describe("requireAuth", () => {
    it("should allow request with valid token", () => {
      const token = generateToken(
        "userId123",
        "student",
        "student@test.com",
        "John"
      );
      mockReq.headers.authorization = `Bearer ${token}`;

      requireAuth(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.user).toBeDefined();
      expect(mockReq.user.id).toBe("userId123");
      expect(mockReq.user.role).toBe("student");
      expect(mockReq.user.email).toBe("student@test.com");
      expect(mockReq.user.firstName).toBe("John");
    });

    it("should reject request without authorization header", () => {
      requireAuth(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Authentication required. Please provide a valid token.",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should reject request with invalid token format", () => {
      mockReq.headers.authorization = "InvalidFormat token";

      requireAuth(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should reject request with invalid token", () => {
      mockReq.headers.authorization = "Bearer invalid.token.here";

      requireAuth(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should reject request with empty bearer token", () => {
      mockReq.headers.authorization = "Bearer ";

      requireAuth(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("requireAdmin", () => {
    it("should allow request with admin role", () => {
      const token = generateToken(
        "adminId",
        "admin",
        "admin@test.com",
        "Admin"
      );
      mockReq.headers.authorization = `Bearer ${token}`;

      requireAdmin(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.user.role).toBe("admin");
      expect(mockReq.user.email).toBe("admin@test.com");
      expect(mockReq.user.firstName).toBe("Admin");
    });

    it("should reject request with student role", () => {
      const token = generateToken(
        "studentId",
        "student",
        "student@test.com",
        "Student"
      );
      mockReq.headers.authorization = `Bearer ${token}`;

      requireAdmin(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should reject request with faculty role", () => {
      const token = generateToken(
        "facultyId",
        "faculty",
        "faculty@test.com",
        "Faculty"
      );
      mockReq.headers.authorization = `Bearer ${token}`;

      requireAdmin(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should reject request without token", () => {
      requireAdmin(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("authorizeAdminOrOwner", () => {
    it("should allow admin to access any resource", () => {
      const token = generateToken(
        "adminId",
        "admin",
        "admin@test.com",
        "Admin"
      );
      mockReq.headers.authorization = `Bearer ${token}`;
      mockReq.params.id = "differentUserId";

      const middleware = authorizeAdminOrOwner();
      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.user.role).toBe("admin");
      expect(mockReq.user.email).toBe("admin@test.com");
      expect(mockReq.user.firstName).toBe("Admin");
    });

    it("should allow user to access their own resource", () => {
      const userId = "userId123";
      const token = generateToken(
        userId,
        "student",
        "student@test.com",
        "Student"
      );
      mockReq.headers.authorization = `Bearer ${token}`;
      mockReq.params.id = userId;

      const middleware = authorizeAdminOrOwner();
      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.user.id).toBe(userId);
      expect(mockReq.user.email).toBe("student@test.com");
      expect(mockReq.user.firstName).toBe("Student");
    });

    it("should reject non-admin user accessing another user resource", () => {
      const token = generateToken(
        "userId123",
        "student",
        "student@test.com",
        "Student"
      );
      mockReq.headers.authorization = `Bearer ${token}`;
      mockReq.params.id = "differentUserId";

      const middleware = authorizeAdminOrOwner();
      middleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message:
          "Access denied. You can only perform this action on your own account.",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should reject faculty accessing another user resource", () => {
      const token = generateToken(
        "facultyId",
        "faculty",
        "faculty@test.com",
        "Faculty"
      );
      mockReq.headers.authorization = `Bearer ${token}`;
      mockReq.params.id = "studentId";

      const middleware = authorizeAdminOrOwner();
      middleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should work with custom resource parameter name", () => {
      const userId = "userId123";
      const token = generateToken(
        userId,
        "student",
        "student@test.com",
        "Student"
      );
      mockReq.headers.authorization = `Bearer ${token}`;
      mockReq.params.userId = userId;

      const middleware = authorizeAdminOrOwner("userId");
      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it("should reject request without token", () => {
      mockReq.params.id = "userId123";

      const middleware = authorizeAdminOrOwner();
      middleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should handle missing resource id parameter", () => {
      const userId = "userId123";
      const token = generateToken(
        userId,
        "student",
        "student@test.com",
        "Student"
      );
      mockReq.headers.authorization = `Bearer ${token}`;
      // No params.id set

      const middleware = authorizeAdminOrOwner();
      middleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("Error Handling", () => {
    it("should handle errors gracefully in requireAuth", () => {
      // Simulate an error condition
      mockReq.headers.authorization = "Bearer " + "a".repeat(10000); // Extremely long token

      requireAuth(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should handle errors gracefully in requireAdmin", () => {
      mockReq.headers.authorization = "Bearer invalid";

      requireAdmin(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should handle errors gracefully in authorizeAdminOrOwner", () => {
      mockReq.headers.authorization = "Bearer invalid";
      mockReq.params.id = "userId";

      const middleware = authorizeAdminOrOwner();
      middleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should catch and handle exceptions in requireAuth", () => {
      // Force an exception by making extractUser throw
      mockReq.headers = null; // This will cause an error when accessing .authorization

      requireAuth(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Authentication error",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should catch and handle exceptions in requireAdmin", () => {
      // Force an exception
      mockReq.headers = null;

      requireAdmin(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Authorization error",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should catch and handle exceptions in authorizeAdminOrOwner", () => {
      // Force an exception
      mockReq.headers = null;
      mockReq.params.id = "userId";

      const middleware = authorizeAdminOrOwner();
      middleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Authorization error",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
