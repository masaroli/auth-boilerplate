import { Router } from "express";
import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/authMiddleware";
import { UserRole } from "../types/userRoles";
import {
  deleteUser,
  getAdminData,
  getAllUsers,
  getProfile,
  getUserById,
  resetPassword,
} from "../controllers/userController";

const router = Router();
router.use(authenticateToken);

router.get("/profile", getProfile);

router.get("/admin/data", authorizeRoles([UserRole.ADMIN]), getAdminData);

router.get(
  "/user/:id",
  // Add authorization logic: either admin or the user themselves
  (req, res, next) => {
    // If the requesting user's ID matches the requested user's ID, allow access
    if (req.user && req.user.id.toString() === req.params.id) {
      return next();
    }
    // Otherwise, check if the user has the ADMIN role
    authorizeRoles([UserRole.ADMIN])(req, res, next);
  },
  getUserById
);

router.get("/users", authorizeRoles([UserRole.ADMIN]), getAllUsers);

router.put(
  "/user/reset-password/:id",
  authorizeRoles([UserRole.ADMIN]),
  resetPassword
);

router.delete(
  "/user/delete/:id",
  authorizeRoles([UserRole.ADMIN]), // Only admins can delete users for now
  deleteUser
);

export default router;
