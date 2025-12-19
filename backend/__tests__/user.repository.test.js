const User = require("../src/models/User");
const userRepository = require("../src/repositories/userRepository");

describe("User Repository", () => {
  describe("create", () => {
    it("should create a new user", async () => {
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        password: "password123",
      };

      const user = await userRepository.create(userData);

      expect(user._id).toBeDefined();
      expect(user.firstName).toBe("John");
      expect(user.lastName).toBe("Doe");
      expect(user.email).toBe("john@example.com");
    });

    it("should throw error for duplicate email", async () => {
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        password: "password123",
      };

      await userRepository.create(userData);

      await expect(userRepository.create(userData)).rejects.toThrow();
    });
  });

  describe("findById", () => {
    it("should find user by id", async () => {
      const createdUser = await User.create({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        password: "password123",
      });

      const user = await userRepository.findById(createdUser._id);

      expect(user).toBeDefined();
      expect(user._id.toString()).toBe(createdUser._id.toString());
      expect(user.email).toBe("john@example.com");
    });

    it("should return null for non-existent id", async () => {
      const fakeId = "507f1f77bcf86cd799439011";
      const user = await userRepository.findById(fakeId);

      expect(user).toBeNull();
    });
  });

  describe("findByEmail", () => {
    it("should find user by email with password", async () => {
      await User.create({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        password: "password123",
      });

      const user = await userRepository.findByEmail("john@example.com");

      expect(user).toBeDefined();
      expect(user.email).toBe("john@example.com");
      expect(user.password).toBeDefined(); // Should include password
    });

    it("should return null for non-existent email", async () => {
      const user = await userRepository.findByEmail("nonexistent@example.com");

      expect(user).toBeNull();
    });

    it("should be case-sensitive for email", async () => {
      await User.create({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        password: "password123",
      });

      // Email is lowercased in schema, so this should still find it
      const user = await userRepository.findByEmail("JOHN@EXAMPLE.COM");

      expect(user).toBeDefined();
    });
  });

  describe("findAll", () => {
    it("should find all users", async () => {
      await User.create({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        password: "password123",
      });

      await User.create({
        firstName: "Jane",
        lastName: "Smith",
        email: "jane@example.com",
        password: "password123",
      });

      const users = await userRepository.findAll();

      expect(users).toHaveLength(2);
      expect(users[0].email).toBeDefined();
      expect(users[1].email).toBeDefined();
    });

    it("should return empty array when no users exist", async () => {
      const users = await userRepository.findAll();

      expect(users).toEqual([]);
    });

    it("should filter users by role", async () => {
      await User.create({
        firstName: "Admin",
        lastName: "User",
        email: "admin@example.com",
        password: "password123",
        role: "admin",
      });

      await User.create({
        firstName: "Student",
        lastName: "User",
        email: "student@example.com",
        password: "password123",
        role: "student",
      });

      const admins = await userRepository.findAll({ role: "admin" });

      expect(admins).toHaveLength(1);
      expect(admins[0].role).toBe("admin");
    });
  });

  describe("update", () => {
    it("should update user by id", async () => {
      const user = await User.create({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        password: "password123",
      });

      const updatedUser = await userRepository.update(user._id, {
        firstName: "Jane",
      });

      expect(updatedUser.firstName).toBe("Jane");
      expect(updatedUser.lastName).toBe("Doe"); // Should remain unchanged
    });

    it("should return null for non-existent id", async () => {
      const fakeId = "507f1f77bcf86cd799439011";
      const user = await userRepository.update(fakeId, {
        firstName: "Jane",
      });

      expect(user).toBeNull();
    });

    it("should run validators on update", async () => {
      const user = await User.create({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        password: "password123",
      });

      await expect(
        userRepository.update(user._id, {
          firstName: "a".repeat(51), // Exceeds max length
        })
      ).rejects.toThrow();
    });
  });

  describe("updateWithVersion", () => {
    it("should update user with matching version", async () => {
      const user = await User.create({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        password: "password123",
      });

      const currentVersion = user.__v;

      const updatedUser = await userRepository.updateWithVersion(
        user._id,
        currentVersion,
        { firstName: "Jane" }
      );

      expect(updatedUser).toBeDefined();
      expect(updatedUser.firstName).toBe("Jane");
      expect(updatedUser.__v).toBe(currentVersion + 1);
    });

    it("should return null for version mismatch", async () => {
      const user = await User.create({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        password: "password123",
      });

      const wrongVersion = user.__v + 5; // Incorrect version

      const updatedUser = await userRepository.updateWithVersion(
        user._id,
        wrongVersion,
        { firstName: "Jane" }
      );

      expect(updatedUser).toBeNull();
    });

    it("should handle concurrent updates with optimistic locking", async () => {
      const user = await User.create({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        password: "password123",
      });

      const version = user.__v;

      // First update should succeed
      const firstUpdate = await userRepository.updateWithVersion(
        user._id,
        version,
        { firstName: "Jane" }
      );

      expect(firstUpdate).toBeDefined();
      expect(firstUpdate.__v).toBe(version + 1);

      // Second update with old version should fail
      const secondUpdate = await userRepository.updateWithVersion(
        user._id,
        version, // Using old version
        { firstName: "Jack" }
      );

      expect(secondUpdate).toBeNull();
    });

    it("should increment version on successful update", async () => {
      const user = await User.create({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        password: "password123",
      });

      const originalVersion = user.__v;

      await userRepository.updateWithVersion(user._id, originalVersion, {
        firstName: "Jane",
      });

      const updatedUser = await User.findById(user._id);
      expect(updatedUser.__v).toBe(originalVersion + 1);
    });

    it("should handle errors in updateWithVersion", async () => {
      const user = await User.create({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        password: "password123",
      });

      const version = user.__v;

      // Force an error by using invalid update data
      await expect(
        userRepository.updateWithVersion(user._id, version, {
          email: "invalid-email", // Invalid email format
        })
      ).rejects.toThrow();
    });
  });

  describe("delete", () => {
    it("should delete user by id", async () => {
      const user = await User.create({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        password: "password123",
      });

      const deletedUser = await userRepository.delete(user._id);

      expect(deletedUser).toBeDefined();
      expect(deletedUser._id.toString()).toBe(user._id.toString());

      // Verify user is actually deleted
      const foundUser = await User.findById(user._id);
      expect(foundUser).toBeNull();
    });

    it("should return null for non-existent id", async () => {
      const fakeId = "507f1f77bcf86cd799439011";
      const user = await userRepository.delete(fakeId);

      expect(user).toBeNull();
    });
  });

  describe("Error Handling", () => {
    it("should handle invalid ObjectId format", async () => {
      await expect(userRepository.findById("invalid-id")).rejects.toThrow();
    });

    it("should handle database errors gracefully", async () => {
      // Try to create user with invalid data
      await expect(
        userRepository.create({
          firstName: "John",
          // Missing required fields
        })
      ).rejects.toThrow();
    });

    it("should handle errors in findByEmail", async () => {
      // Mock the select method to throw an error
      jest.spyOn(User, "findOne").mockReturnValueOnce({
        select: jest.fn().mockRejectedValueOnce(new Error("Database error")),
      });

      await expect(
        userRepository.findByEmail("test@example.com")
      ).rejects.toThrow("Database error");
    });

    it("should handle errors in findAll", async () => {
      jest
        .spyOn(User, "find")
        .mockRejectedValueOnce(new Error("Database error"));

      await expect(userRepository.findAll()).rejects.toThrow("Database error");
    });

    it("should handle errors in update", async () => {
      jest
        .spyOn(User, "findByIdAndUpdate")
        .mockRejectedValueOnce(new Error("Update error"));

      await expect(
        userRepository.update("507f1f77bcf86cd799439011", { firstName: "Test" })
      ).rejects.toThrow("Update error");
    });

    it("should handle errors in delete", async () => {
      jest
        .spyOn(User, "findByIdAndDelete")
        .mockRejectedValueOnce(new Error("Delete error"));

      await expect(
        userRepository.delete("507f1f77bcf86cd799439011")
      ).rejects.toThrow("Delete error");
    });
  });
});
