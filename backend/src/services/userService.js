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
   * Get all users
   */
  async getAllUsers() {
    try {
      const users = await userRepository.findAll();
      return users;
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
