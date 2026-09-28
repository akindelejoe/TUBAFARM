import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth";
import { authRateLimiter } from "../middleware/rateLimit";
import { validateBody } from "../middleware/validate";
import { loginSchema } from "../validators/auth.validators";

const router = Router();

router.post("/login", authRateLimiter, validateBody(loginSchema), authController.login);
router.post("/logout", authenticate, authController.logout);
router.get("/me", authenticate, authController.me);

export default router;
