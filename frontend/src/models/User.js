/**
 * User Model
 * Defines the structure of user data
 */
export class User {
  constructor(data = {}) {
    this.id = data.id || data._id || null;
    this.firstName = data.firstName || "";
    this.lastName = data.lastName || "";
    this.email = data.email || "";
    this.role = data.role || "student";
    this.address = data.address || "";
    this.city = data.city || "";
    this.state = data.state || "";
    this.zipcode = data.zipcode || "";
    this.phone = data.phone || "";
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.createdAt = data.createdAt || null;
    this.updatedAt = data.updatedAt || null;
  }

  get fullName() {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  get isAdmin() {
    return this.role === "admin";
  }

  get isStudent() {
    return this.role === "student";
  }

  get isFaculty() {
    return this.role === "faculty";
  }

  toJSON() {
    return {
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      role: this.role,
      address: this.address,
      city: this.city,
      state: this.state,
      zipcode: this.zipcode,
      phone: this.phone,
      isActive: this.isActive,
    };
  }
}

export default User;
