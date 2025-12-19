const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const {
  requireAdmin,
  authorizeAdminOrOwner,
  requireAuth,
} = require("../middleware/auth");

// User registration and authentication
router.post("/register", userController.register);
router.post("/login", userController.login);

// CRUD operations
router.get("/", requireAdmin, userController.getAllUsers); // Only admin can see all users
router.get("/:id", authorizeAdminOrOwner(), userController.getUserById); // Admin or owner
router.put("/:id", authorizeAdminOrOwner(), userController.updateUser); // Admin or owner
router.delete("/:id", authorizeAdminOrOwner(), userController.deleteUser); // Admin or owner

module.exports = router;
