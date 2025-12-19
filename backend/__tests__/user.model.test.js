const User = require("../src/models/User");

describe("User Model", () => {
  describe("Schema Validation", () => {
    it("should create a valid user with all required fields", async () => {
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        password: "password123",
        role: "student",
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.firstName).toBe("John");
      expect(savedUser.lastName).toBe("Doe");
      expect(savedUser.email).toBe("john@example.com");
      expect(savedUser.role).toBe("student");
      expect(savedUser.isActive).toBe(true);
      expect(savedUser.password).not.toBe("password123"); // Should be hashed
    });

    it("should fail without required firstName", async () => {
      const user = new User({
        lastName: "Doe",
        email: "john@example.com",
        password: "password123",
      });

      await expect(user.save()).rejects.toThrow();
    });

    it("should fail without required lastName", async () => {
      const user = new User({
        firstName: "John",
        email: "john@example.com",
        password: "password123",
      });

      await expect(user.save()).rejects.toThrow();
    });

    it("should fail without required email", async () => {
      const user = new User({
        firstName: "John",
        lastName: "Doe",
        password: "password123",
      });

      await expect(user.save()).rejects.toThrow();
    });

    it("should fail without required password", async () => {
      const user = new User({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
      });

      await expect(user.save()).rejects.toThrow();
    });

    it("should fail with invalid email format", async () => {
      const user = new User({
        firstName: "John",
        lastName: "Doe",
        email: "invalid-email",
        password: "password123",
      });

      await expect(user.save()).rejects.toThrow();
    });

    it("should enforce unique email constraint", async () => {
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        password: "password123",
      };

      await User.create(userData);

      const duplicateUser = new User({
        firstName: "Jane",
        lastName: "Smith",
        email: "john@example.com",
        password: "password456",
      });

      await expect(duplicateUser.save()).rejects.toThrow();
    });

    it("should default role to student", async () => {
      const user = await User.create({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        password: "password123",
      });

      expect(user.role).toBe("student");
    });

    it("should accept admin role", async () => {
      const user = await User.create({
        firstName: "Admin",
        lastName: "User",
        email: "admin@example.com",
        password: "password123",
        role: "admin",
      });

      expect(user.role).toBe("admin");
    });

    it("should accept faculty role", async () => {
      const user = await User.create({
        firstName: "Faculty",
        lastName: "Member",
        email: "faculty@example.com",
        password: "password123",
        role: "faculty",
      });

      expect(user.role).toBe("faculty");
    });
  });

  describe("Field Length Validation", () => {
    it("should fail when firstName exceeds 50 characters", async () => {
      const user = new User({
        firstName: "a".repeat(51),
        lastName: "Doe",
        email: "john@example.com",
        password: "password123",
      });

      await expect(user.save()).rejects.toThrow();
    });

    it("should fail when lastName exceeds 50 characters", async () => {
      const user = new User({
        firstName: "John",
        lastName: "a".repeat(51),
        email: "john@example.com",
        password: "password123",
      });

      await expect(user.save()).rejects.toThrow();
    });

    it("should fail when address exceeds 75 characters", async () => {
      const user = new User({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        password: "password123",
        address: "a".repeat(76),
      });

      await expect(user.save()).rejects.toThrow();
    });

    it("should fail when city exceeds 35 characters", async () => {
      const user = new User({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        password: "password123",
        city: "a".repeat(36),
      });

      await expect(user.save()).rejects.toThrow();
    });

    it("should fail when state exceeds 25 characters", async () => {
      const user = new User({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        password: "password123",
        state: "a".repeat(26),
      });

      await expect(user.save()).rejects.toThrow();
    });

    it("should fail when zipcode exceeds 10 characters", async () => {
      const user = new User({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        password: "password123",
        zipcode: "12345678901",
      });

      await expect(user.save()).rejects.toThrow();
    });

    it("should fail with invalid phone format", async () => {
      const user = new User({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        password: "password123",
        phone: "1234567890", // Missing dashes
      });

      await expect(user.save()).rejects.toThrow();
    });

    it("should accept valid phone format", async () => {
      const user = await User.create({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        password: "password123",
        phone: "123-456-7890",
      });

      expect(user.phone).toBe("123-456-7890");
    });
  });

  describe("Password Hashing", () => {
    it("should hash password before saving", async () => {
      const plainPassword = "password123";
      const user = await User.create({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        password: plainPassword,
      });

      expect(user.password).toBeDefined();
      expect(user.password).not.toBe(plainPassword);
      expect(user.password.length).toBeGreaterThan(20); // Bcrypt hashes are longer
    });

    it("should not rehash password if not modified", async () => {
      const user = await User.create({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        password: "password123",
      });

      const originalHash = user.password;

      user.firstName = "Jane";
      await user.save();

      // Need to fetch with password field
      const updatedUser = await User.findById(user._id).select("+password");
      expect(updatedUser.password).toBe(originalHash);
    });
  });

  describe("matchPassword Method", () => {
    it("should return true for correct password", async () => {
      const plainPassword = "password123";
      const user = await User.create({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        password: plainPassword,
      });

      const userWithPassword = await User.findById(user._id).select(
        "+password"
      );
      const isMatch = await userWithPassword.matchPassword(plainPassword);

      expect(isMatch).toBe(true);
    });

    it("should return false for incorrect password", async () => {
      const user = await User.create({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        password: "password123",
      });

      const userWithPassword = await User.findById(user._id).select(
        "+password"
      );
      const isMatch = await userWithPassword.matchPassword("wrongpassword");

      expect(isMatch).toBe(false);
    });
  });

  describe("Optional Fields", () => {
    it("should save user without optional fields", async () => {
      const user = await User.create({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        password: "password123",
      });

      expect(user.address).toBeUndefined();
      expect(user.city).toBeUndefined();
      expect(user.state).toBeUndefined();
      expect(user.zipcode).toBeUndefined();
      expect(user.phone).toBeUndefined();
    });

    it("should save user with all optional fields", async () => {
      const user = await User.create({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        password: "password123",
        address: "123 Main St",
        city: "New York",
        state: "NY",
        zipcode: "10001",
        phone: "123-456-7890",
      });

      expect(user.address).toBe("123 Main St");
      expect(user.city).toBe("New York");
      expect(user.state).toBe("NY");
      expect(user.zipcode).toBe("10001");
      expect(user.phone).toBe("123-456-7890");
    });
  });

  describe("Timestamps", () => {
    it("should have createdAt and updatedAt timestamps", async () => {
      const user = await User.create({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        password: "password123",
      });

      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });
  });
});
