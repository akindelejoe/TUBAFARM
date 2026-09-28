import { Router } from "express";
import * as farmController from "../controllers/farm.controller";
import { authenticate, authorize } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { createFarmSchema, updateFarmSchema } from "../validators/farm.validators";

const router = Router();

router.use(authenticate);

router.get("/", farmController.list);
router.get("/:id", farmController.details);
router.post("/", authorize("ADMIN", "MANAGER"), validateBody(createFarmSchema), farmController.create);
router.put("/:id", authorize("ADMIN", "MANAGER"), validateBody(updateFarmSchema), farmController.update);
router.delete("/:id", authorize("ADMIN", "MANAGER"), farmController.archive);

export default router;
