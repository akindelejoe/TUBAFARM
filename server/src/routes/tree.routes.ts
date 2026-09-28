import { Router } from "express";
import * as treeController from "../controllers/tree.controller";
import { authenticate, authorize } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { createTreeSchema, updateTreeSchema } from "../validators/tree.validators";

const router = Router();

router.use(authenticate);

router.get("/", treeController.list);
router.get("/:id", treeController.details);
router.post("/", authorize("ADMIN", "MANAGER"), validateBody(createTreeSchema), treeController.create);
router.put("/:id", authorize("ADMIN", "MANAGER"), validateBody(updateTreeSchema), treeController.update);
router.delete("/:id", authorize("ADMIN", "MANAGER"), treeController.archive);

export default router;
