const User = require("../models/User");

class UserRepository {
  /**
   * Create a new user
   */
  async create(userData) {
    try {
      const user = await User.create(userData);
      return user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find user by ID
   */
  async findById(id) {
    try {
      const user = await User.findById(id);
      return user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find user by email
   */
  async findByEmail(email) {
    try {
      const user = await User.findOne({ email }).select("+password");
      return user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find all users
   */
  async findAll(filter = {}) {
    try {
      const users = await User.find(filter);
      return users;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update user by ID
   */
  async update(id, updateData) {
    try {
      const user = await User.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });
      return user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update user by ID with optimistic locking
   * @param {String} id - User ID
   * @param {Number} version - Current version number (__v)
   * @param {Object} updateData - Data to update
   */
  async updateWithVersion(id, version, updateData) {
    try {
      // Update only if version matches, and increment version
      const user = await User.findOneAndUpdate(
        { _id: id, __v: version },
        { $set: updateData, $inc: { __v: 1 } },
        {
          new: true,
          runValidators: true,
        }
      );
      return user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete user by ID
   */
  async delete(id) {
    try {
      const user = await User.findByIdAndDelete(id);
      return user;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new UserRepository();
