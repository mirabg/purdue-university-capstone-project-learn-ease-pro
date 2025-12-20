const { generateToken, verifyToken } = require("../src/config/jwt");

describe("JWT Utilities", () => {
  describe("generateToken", () => {
    it("should generate a valid JWT token", () => {
      const userId = "507f1f77bcf86cd799439011";
      const role = "student";
      const email = "student@test.com";
      const firstName = "John";

      const token = generateToken(userId, role, email, firstName);

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.split(".")).toHaveLength(3); // JWT has 3 parts
    });

    it("should generate different tokens for different users", () => {
      const token1 = generateToken(
        "user1",
        "student",
        "user1@test.com",
        "User"
      );
      const token2 = generateToken(
        "user2",
        "faculty",
        "user2@test.com",
        "User"
      );

      expect(token1).not.toBe(token2);
    });

    it("should generate token with admin role", () => {
      const token = generateToken(
        "adminId",
        "admin",
        "admin@test.com",
        "Admin"
      );
      const decoded = verifyToken(token);

      expect(decoded.role).toBe("admin");
      expect(decoded.email).toBe("admin@test.com");
      expect(decoded.firstName).toBe("Admin");
    });
  });

  describe("verifyToken", () => {
    it("should verify and decode a valid token", () => {
      const userId = "507f1f77bcf86cd799439011";
      const role = "student";
      const email = "student@test.com";
      const firstName = "John";
      const token = generateToken(userId, role, email, firstName);

      const decoded = verifyToken(token);

      expect(decoded).toBeDefined();
      expect(decoded.id).toBe(userId);
      expect(decoded.role).toBe(role);
      expect(decoded.email).toBe(email);
      expect(decoded.firstName).toBe(firstName);
      expect(decoded.iat).toBeDefined(); // Issued at
      expect(decoded.exp).toBeDefined(); // Expiration
    });

    it("should return null for invalid token", () => {
      const invalidToken = "invalid.token.here";
      const decoded = verifyToken(invalidToken);

      expect(decoded).toBeNull();
    });

    it("should return null for malformed token", () => {
      const malformedToken = "notavalidtoken";
      const decoded = verifyToken(malformedToken);

      expect(decoded).toBeNull();
    });

    it("should return null for empty token", () => {
      const decoded = verifyToken("");

      expect(decoded).toBeNull();
    });

    it("should decode token with correct expiration", () => {
      const token = generateToken(
        "userId",
        "student",
        "student@test.com",
        "Student"
      );
      const decoded = verifyToken(token);

      expect(decoded.exp).toBeGreaterThan(decoded.iat);

      // Token should expire in approximately 1 day (86400 seconds) based on test env
      const expiresIn = decoded.exp - decoded.iat;
      expect(expiresIn).toBeGreaterThan(86000); // Allow some buffer
      expect(expiresIn).toBeLessThan(87000);
    });

    it("should preserve user id, role, email, and firstName in token", () => {
      const testCases = [
        {
          id: "user123",
          role: "student",
          email: "student@test.com",
          firstName: "Student",
        },
        {
          id: "admin456",
          role: "admin",
          email: "admin@test.com",
          firstName: "Admin",
        },
        {
          id: "faculty789",
          role: "faculty",
          email: "faculty@test.com",
          firstName: "Faculty",
        },
      ];

      testCases.forEach(({ id, role, email, firstName }) => {
        const token = generateToken(id, role, email, firstName);
        const decoded = verifyToken(token);

        expect(decoded.id).toBe(id);
        expect(decoded.role).toBe(role);
        expect(decoded.email).toBe(email);
        expect(decoded.firstName).toBe(firstName);
      });
    });
  });

  describe("Token Lifecycle", () => {
    it("should create and verify token successfully", () => {
      const userId = "testUser123";
      const role = "faculty";
      const email = "faculty@test.com";
      const firstName = "Faculty";

      // Generate
      const token = generateToken(userId, role, email, firstName);
      expect(token).toBeDefined();

      // Verify
      const decoded = verifyToken(token);
      expect(decoded).toBeDefined();
      expect(decoded.id).toBe(userId);
      expect(decoded.role).toBe(role);
      expect(decoded.email).toBe(email);
      expect(decoded.firstName).toBe(firstName);
    });

    it("should handle special characters in user id and email", () => {
      const userId = "507f1f77bcf86cd799439011";
      const email = "test+user@example.com";
      const firstName = "Test User";
      const token = generateToken(userId, "student", email, firstName);
      const decoded = verifyToken(token);

      expect(decoded.id).toBe(userId);
      expect(decoded.email).toBe(email);
      expect(decoded.firstName).toBe(firstName);
    });

    it("should return null for expired token", () => {
      // Create a token with a very short expiration
      const jwt = require("jsonwebtoken");
      const expiredToken = jwt.sign(
        {
          id: "userId",
          role: "student",
          email: "student@test.com",
          firstName: "Student",
        },
        process.env.JWT_SECRET,
        { expiresIn: "0s" } // Already expired
      );

      const decoded = verifyToken(expiredToken);
      expect(decoded).toBeNull();
    });

    it("should return null when token verification throws error", () => {
      // Token signed with different secret
      const jwt = require("jsonwebtoken");
      const invalidToken = jwt.sign(
        {
          id: "userId",
          role: "student",
          email: "student@test.com",
          firstName: "Student",
        },
        "wrong-secret-key",
        { expiresIn: "1d" }
      );

      const decoded = verifyToken(invalidToken);
      expect(decoded).toBeNull();
    });
  });
});
