const { generateToken, verifyToken } = require("../src/config/jwt");

describe("JWT Utilities", () => {
  describe("generateToken", () => {
    it("should generate a valid JWT token", () => {
      const userId = "507f1f77bcf86cd799439011";
      const role = "student";
      const email = "student@test.com";
      const firstName = "John";
      const lastName = "Doe";

      const token = generateToken(userId, role, email, firstName, lastName);

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.split(".")).toHaveLength(3); // JWT has 3 parts
    });

    it("should generate different tokens for different users", () => {
      const token1 = generateToken(
        "user1",
        "student",
        "user1@test.com",
        "User",
        "One"
      );
      const token2 = generateToken(
        "user2",
        "faculty",
        "user2@test.com",
        "User",
        "Two"
      );

      expect(token1).not.toBe(token2);
    });

    it("should generate token with admin role", () => {
      const token = generateToken(
        "adminId",
        "admin",
        "admin@test.com",
        "Admin",
        "User"
      );
      const decoded = verifyToken(token);

      expect(decoded.role).toBe("admin");
      expect(decoded.email).toBe("admin@test.com");
      expect(decoded.firstName).toBe("Admin");
      expect(decoded.lastName).toBe("User");
    });
  });

  describe("verifyToken", () => {
    it("should verify and decode a valid token", () => {
      const userId = "507f1f77bcf86cd799439011";
      const role = "student";
      const email = "student@test.com";
      const firstName = "John";
      const lastName = "Doe";
      const token = generateToken(userId, role, email, firstName, lastName);

      const decoded = verifyToken(token);

      expect(decoded).toBeDefined();
      expect(decoded.id).toBe(userId);
      expect(decoded.role).toBe(role);
      expect(decoded.email).toBe(email);
      expect(decoded.firstName).toBe(firstName);
      expect(decoded.lastName).toBe(lastName);
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
        "Student",
        "User"
      );
      const decoded = verifyToken(token);

      expect(decoded.exp).toBeGreaterThan(decoded.iat);

      // Token should expire in approximately 1 day (86400 seconds) based on test env
      const expiresIn = decoded.exp - decoded.iat;
      expect(expiresIn).toBeGreaterThan(86000); // Allow some buffer
      expect(expiresIn).toBeLessThan(87000);
    });

    it("should preserve user id, role, email, firstName, and lastName in token", () => {
      const testCases = [
        {
          id: "user123",
          role: "student",
          email: "student@test.com",
          firstName: "Student",
          lastName: "User",
        },
        {
          id: "admin456",
          role: "admin",
          email: "admin@test.com",
          firstName: "Admin",
          lastName: "User",
        },
        {
          id: "faculty789",
          role: "faculty",
          email: "faculty@test.com",
          firstName: "Faculty",
          lastName: "Member",
        },
      ];

      testCases.forEach(({ id, role, email, firstName, lastName }) => {
        const token = generateToken(id, role, email, firstName, lastName);
        const decoded = verifyToken(token);

        expect(decoded.id).toBe(id);
        expect(decoded.role).toBe(role);
        expect(decoded.email).toBe(email);
        expect(decoded.firstName).toBe(firstName);
        expect(decoded.lastName).toBe(lastName);
      });
    });
  });

  describe("Token Lifecycle", () => {
    it("should create and verify token successfully", () => {
      const userId = "testUser123";
      const role = "faculty";
      const email = "faculty@test.com";
      const firstName = "Faculty";
      const lastName = "Member";

      // Generate
      const token = generateToken(userId, role, email, firstName, lastName);
      expect(token).toBeDefined();

      // Verify
      const decoded = verifyToken(token);
      expect(decoded).toBeDefined();
      expect(decoded.id).toBe(userId);
      expect(decoded.role).toBe(role);
      expect(decoded.email).toBe(email);
      expect(decoded.firstName).toBe(firstName);
      expect(decoded.lastName).toBe(lastName);
    });

    it("should handle special characters in user id and email", () => {
      const userId = "507f1f77bcf86cd799439011";
      const email = "test+user@example.com";
      const firstName = "Test User";
      const lastName = "Test";
      const token = generateToken(
        userId,
        "student",
        email,
        firstName,
        lastName
      );
      const decoded = verifyToken(token);

      expect(decoded.id).toBe(userId);
      expect(decoded.email).toBe(email);
      expect(decoded.firstName).toBe(firstName);
      expect(decoded.lastName).toBe(lastName);
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
          lastName: "User",
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
          lastName: "User",
        },
        "wrong-secret-key",
        { expiresIn: "1d" }
      );

      const decoded = verifyToken(invalidToken);
      expect(decoded).toBeNull();
    });
  });
});
