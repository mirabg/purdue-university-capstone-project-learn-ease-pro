const User = require("../src/models/User");
const userService = require("../src/services/userService");
const userRepository = require("../src/repositories/userRepository");

// Mock the repository
jest.mock("../src/repositories/userRepository");

describe("User Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("registerUser", () => {
    it("should register a new user successfully", async () => {
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
        isActive: true,
        createdAt: new Date(),
      };

      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.create.mockResolvedValue(mockUser);

      const result = await userService.registerUser(userData);

      expect(userRepository.findByEmail).toHaveBeenCalledWith(userData.email);
      expect(userRepository.create).toHaveBeenCalledWith(userData);
      expect(result._id).toBe("userId123");
      expect(result.firstName).toBe("John");
      expect(result.password).toBeUndefined(); // Password should not be returned
    });

    it("should throw error if user already exists", async () => {
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        password: "password123",
      };

      userRepository.findByEmail.mockResolvedValue({ email: userData.email });

      await expect(userService.registerUser(userData)).rejects.toThrow(
        "User already exists with this email"
      );

      expect(userRepository.create).not.toHaveBeenCalled();
    });

    it("should return user with all fields", async () => {
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
      };

      const mockUser = {
        _id: "userId123",
        ...userData,
        role: "student",
        isActive: true,
        createdAt: new Date(),
      };

      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.create.mockResolvedValue(mockUser);

      const result = await userService.registerUser(userData);

      expect(result.address).toBe("123 Main St");
      expect(result.city).toBe("New York");
      expect(result.phone).toBe("123-456-7890");
    });
  });

  describe("authenticateUser", () => {
    it("should authenticate user with correct credentials", async () => {
      const mockUser = {
        _id: "userId123",
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        role: "student",
        isActive: true,
        matchPassword: jest.fn().mockResolvedValue(true),
      };

      userRepository.findByEmail.mockResolvedValue(mockUser);

      const result = await userService.authenticateUser(
        "john@example.com",
        "password123"
      );

      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        "john@example.com"
      );
      expect(mockUser.matchPassword).toHaveBeenCalledWith("password123");
      expect(result._id).toBe("userId123");
      expect(result.password).toBeUndefined();
    });

    it("should throw error for non-existent user", async () => {
      userRepository.findByEmail.mockResolvedValue(null);

      await expect(
        userService.authenticateUser("nonexistent@example.com", "password123")
      ).rejects.toThrow("Invalid credentials");
    });

    it("should throw error for incorrect password", async () => {
      const mockUser = {
        _id: "userId123",
        email: "john@example.com",
        matchPassword: jest.fn().mockResolvedValue(false),
      };

      userRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(
        userService.authenticateUser("john@example.com", "wrongpassword")
      ).rejects.toThrow("Invalid credentials");
    });
  });

  describe("getUserById", () => {
    it("should return user by id", async () => {
      const mockUser = {
        _id: "userId123",
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
      };

      userRepository.findById.mockResolvedValue(mockUser);

      const result = await userService.getUserById("userId123");

      expect(userRepository.findById).toHaveBeenCalledWith("userId123");
      expect(result).toEqual(mockUser);
    });

    it("should throw error if user not found", async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(userService.getUserById("nonexistent")).rejects.toThrow(
        "User not found"
      );
    });
  });

  describe("getAllUsers", () => {
    it("should return all users", async () => {
      const mockUsers = [
        { _id: "user1", firstName: "John", email: "john@example.com" },
        { _id: "user2", firstName: "Jane", email: "jane@example.com" },
      ];

      userRepository.findWithPagination.mockResolvedValue(mockUsers);
      userRepository.count.mockResolvedValue(2);

      const result = await userService.getAllUsers();

      expect(userRepository.findWithPagination).toHaveBeenCalled();
      expect(result.users).toEqual(mockUsers);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it("should return empty array when no users exist", async () => {
      userRepository.findWithPagination.mockResolvedValue([]);
      userRepository.count.mockResolvedValue(0);

      const result = await userService.getAllUsers();

      expect(result.users).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe("updateUser", () => {
    it("should update user without version", async () => {
      const mockUser = {
        _id: "userId123",
        firstName: "Jane",
        lastName: "Doe",
      };

      userRepository.update.mockResolvedValue(mockUser);

      const result = await userService.updateUser("userId123", {
        firstName: "Jane",
      });

      expect(userRepository.update).toHaveBeenCalledWith("userId123", {
        firstName: "Jane",
      });
      expect(result.firstName).toBe("Jane");
    });

    it("should update user with version (optimistic locking)", async () => {
      const mockUser = {
        _id: "userId123",
        firstName: "Jane",
        __v: 1,
      };

      userRepository.updateWithVersion.mockResolvedValue(mockUser);

      const result = await userService.updateUser(
        "userId123",
        { firstName: "Jane" },
        0
      );

      expect(userRepository.updateWithVersion).toHaveBeenCalledWith(
        "userId123",
        0,
        {
          firstName: "Jane",
        }
      );
      expect(result.firstName).toBe("Jane");
    });

    it("should throw error for version mismatch", async () => {
      userRepository.updateWithVersion.mockResolvedValue(null);

      await expect(
        userService.updateUser("userId123", { firstName: "Jane" }, 0)
      ).rejects.toThrow(
        "User not found or has been modified by another process"
      );
    });

    it("should throw error if user not found", async () => {
      userRepository.update.mockResolvedValue(null);

      await expect(
        userService.updateUser("nonexistent", { firstName: "Jane" })
      ).rejects.toThrow("User not found");
    });

    it("should not allow password update", async () => {
      const mockUser = {
        _id: "userId123",
        firstName: "John",
      };

      userRepository.update.mockResolvedValue(mockUser);

      await userService.updateUser("userId123", {
        firstName: "Jane",
        password: "newpassword",
      });

      // Verify password was removed from updateData
      expect(userRepository.update).toHaveBeenCalledWith("userId123", {
        firstName: "Jane",
      });
    });
  });

  describe("deleteUser", () => {
    it("should delete user successfully", async () => {
      const mockUser = {
        _id: "userId123",
        firstName: "John",
        role: "student",
      };

      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.delete.mockResolvedValue(mockUser);

      const result = await userService.deleteUser("userId123");

      expect(userRepository.findById).toHaveBeenCalledWith("userId123");
      expect(userRepository.delete).toHaveBeenCalledWith("userId123");
      expect(result.message).toBe("User deleted successfully");
    });

    it("should throw error if user not found", async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(userService.deleteUser("nonexistent")).rejects.toThrow(
        "User not found"
      );
    });

    it("should throw error when deleting last admin", async () => {
      const mockAdmin = {
        _id: "admin123",
        firstName: "Admin",
        role: "admin",
      };

      userRepository.findById.mockResolvedValue(mockAdmin);
      userRepository.count.mockResolvedValue(1);

      await expect(userService.deleteUser("admin123")).rejects.toThrow(
        "Cannot delete the last admin user"
      );

      expect(userRepository.count).toHaveBeenCalledWith({ role: "admin" });
      expect(userRepository.delete).not.toHaveBeenCalled();
    });

    it("should allow deleting an admin when multiple admins exist", async () => {
      const mockAdmin = {
        _id: "admin123",
        firstName: "Admin",
        role: "admin",
      };

      userRepository.findById.mockResolvedValue(mockAdmin);
      userRepository.count.mockResolvedValue(2);
      userRepository.delete.mockResolvedValue(mockAdmin);

      const result = await userService.deleteUser("admin123");

      expect(userRepository.count).toHaveBeenCalledWith({ role: "admin" });
      expect(userRepository.delete).toHaveBeenCalledWith("admin123");
      expect(result.message).toBe("User deleted successfully");
    });
  });

  describe("Error Handling", () => {
    it("should propagate repository errors in registerUser", async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.create.mockRejectedValue(new Error("Database error"));

      await expect(
        userService.registerUser({
          firstName: "John",
          lastName: "Doe",
          email: "john@example.com",
          password: "password123",
        })
      ).rejects.toThrow("Database error");
    });

    it("should propagate repository errors in authenticateUser", async () => {
      userRepository.findByEmail.mockRejectedValue(new Error("Database error"));

      await expect(
        userService.authenticateUser("john@example.com", "password123")
      ).rejects.toThrow("Database error");
    });

    it("should propagate repository errors in getUserById", async () => {
      userRepository.findById.mockRejectedValue(new Error("Database error"));

      await expect(userService.getUserById("userId123")).rejects.toThrow(
        "Database error"
      );
    });

    it("should propagate repository errors in getAllUsers", async () => {
      userRepository.findWithPagination.mockRejectedValue(
        new Error("Database error")
      );

      await expect(userService.getAllUsers()).rejects.toThrow("Database error");
    });

    it("should propagate repository errors in updateUser", async () => {
      userRepository.update.mockRejectedValue(new Error("Database error"));

      await expect(
        userService.updateUser("userId123", { firstName: "Jane" })
      ).rejects.toThrow("Database error");
    });

    it("should propagate repository errors in deleteUser", async () => {
      userRepository.delete.mockRejectedValue(new Error("Database error"));

      await expect(userService.deleteUser("userId123")).rejects.toThrow(
        "Database error"
      );
    });
  });
});
