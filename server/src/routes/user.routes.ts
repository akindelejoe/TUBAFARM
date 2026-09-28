import { Router } from "express";
import * as userController from "../controllers/user.controller";
import { authenticate, authorize } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { createUserSchema, resetPasswordSchema, updateUserSchema } from "../validators/user.validators";

const router = Router();

router.use(authenticate, authorize("ADMIN"));

router.get("/", userController.list);
router.post("/", validateBody(createUserSchema), userController.create);
router.put("/:id", validateBody(updateUserSchema), userController.update);
router.delete("/:id", userController.deactivate);
router.post("/:id/reset-password", validateBody(resetPasswordSchema), userController.resetPassword);

export default router;
