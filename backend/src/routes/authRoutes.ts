import { Router } from "express";

import {
  registerUser,
  loginUser,
  logoutUser,
} from "../controllers/authController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

// Public routes
router.post("/login", loginUser);

// --- IMPORTANT: Bootstrapping the first admin ---
// For the very first admin user creation:
// 1. Temporarily comment out the line below:

// router.post(
//   "/register",
//   authenticateToken,
//   authorizeRoles(["admin"]),
//   registerUser
// );

// 2. Uncomment the line below it:
router.post("/register", registerUser);
// 3. Restart your server.
// 4. Register your first admin user (e.g., email: admin@example.com, role: admin)
//    using Thunder Client/curl WITHOUT an Authorization header.
// 5. Once registered, RE-COMMENT the temporary line and UNCOMMENT the restricted line below.
// 6. Restart your server again.
// All subsequent registrations will require an admin token.

// Temporary public registration route (for bootstrapping the first admin ONLY)
// router.post('/register', registerUser); // <-- UNCOMMENT THIS LINE FOR FIRST ADMIN REGISTRATION

// Logout route
router.post("/logout", authenticateToken, logoutUser);

export default router;
