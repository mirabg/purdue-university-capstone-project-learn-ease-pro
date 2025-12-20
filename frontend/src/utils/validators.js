/**
 * Validation utilities
 */

export const validators = {
  /**
   * Validate email format
   * @param {string} email
   * @returns {boolean}
   */
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Validate phone format (xxx-xxx-xxxx)
   * @param {string} phone
   * @returns {boolean}
   */
  isValidPhone: (phone) => {
    const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
    return phoneRegex.test(phone);
  },

  /**
   * Validate password strength
   * @param {string} password
   * @returns {boolean}
   */
  isValidPassword: (password) => {
    return password && password.length >= 6;
  },

  /**
   * Validate required field
   * @param {any} value
   * @returns {boolean}
   */
  isRequired: (value) => {
    return (
      value !== null && value !== undefined && value.toString().trim() !== ""
    );
  },

  /**
   * Validate string length
   * @param {string} value
   * @param {number} max
   * @returns {boolean}
   */
  maxLength: (value, max) => {
    return !value || value.length <= max;
  },
};

export default validators;
