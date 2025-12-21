const userRepository = require("../repositories/userRepository");

class UserService {
  /**
   * Register a new user
   */
  async registerUser(userData) {
    try {
      // Check if user already exists
      const existingUser = await userRepository.findByEmail(userData.email);
      if (existingUser) {
        throw new Error("User already exists with this email");
      }

      // Create new user (password will be hashed in model pre-save hook)
      const user = await userRepository.create(userData);

      // Return user without password
      return {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        address: user.address,
        city: user.city,
        state: user.state,
        zipcode: user.zipcode,
        phone: user.phone,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Authenticate user
   */
  async authenticateUser(email, password) {
    try {
      // Find user with password field
      const user = await userRepository.findByEmail(email);

      if (!user) {
        throw new Error("Invalid credentials");
      }

      // Check if password matches
      const isMatch = await user.matchPassword(password);

      if (!isMatch) {
        throw new Error("Invalid credentials");
      }

      // Return user without password
      return {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        address: user.address,
        city: user.city,
        state: user.state,
        zipcode: user.zipcode,
        phone: user.phone,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(id) {
    try {
      const user = await userRepository.findById(id);
      if (!user) {
        throw new Error("User not found");
      }
      return user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all users with pagination and search
   */
  async getAllUsers(page = 1, limit = 10, search = "") {
    try {
      const skip = (page - 1) * limit;

      // Build search filter
      let filter = {};
      if (search) {
        filter = {
          $or: [
            { firstName: { $regex: search, $options: "i" } },
            { lastName: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        };
      }

      const users = await userRepository.findWithPagination(
        filter,
        skip,
        limit
      );
      const total = await userRepository.count(filter);

      return {
        users,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all faculty users (instructors)
   */
  async getFacultyUsers() {
    try {
      const facultyUsers = await userRepository.findAll({
        role: "faculty",
        isActive: true,
      });
      return facultyUsers;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update user
   */
  async updateUser(id, updateData, version) {
    try {
      // Don't allow password update through this method
      if (updateData.password) {
        delete updateData.password;
      }

      // Use optimistic locking if version is provided
      let user;
      if (version !== undefined) {
        user = await userRepository.updateWithVersion(id, version, updateData);
        if (!user) {
          throw new Error(
            "User not found or has been modified by another process. Please refresh and try again."
          );
        }
      } else {
        // Fallback to regular update without version check
        user = await userRepository.update(id, updateData);
        if (!user) {
          throw new Error("User not found");
        }
      }
      return user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete user
   */
  async deleteUser(id) {
    try {
      // Get the user to be deleted
      const userToDelete = await userRepository.findById(id);
      if (!userToDelete) {
        throw new Error("User not found");
      }

      // If the user is an admin, check if they're the last admin
      if (userToDelete.role === "admin") {
        const adminCount = await userRepository.count({ role: "admin" });
        if (adminCount <= 1) {
          throw new Error(
            "Cannot delete the last admin user. At least one admin must remain in the system."
          );
        }
      }

      const user = await userRepository.delete(id);
      if (!user) {
        throw new Error("User not found");
      }
      return { message: "User deleted successfully" };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new UserService();
