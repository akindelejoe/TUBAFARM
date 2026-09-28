import { Router } from "express";
import * as tappingRecordController from "../controllers/tappingRecord.controller";
import { authenticate, authorize } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { createTappingRecordSchema, updateTappingRecordSchema } from "../validators/tappingRecord.validators";

const router = Router();

router.use(authenticate);

router.get("/", tappingRecordController.list);
router.post(
  "/",
  authorize("ADMIN", "MANAGER", "FARM_WORKER"),
  validateBody(createTappingRecordSchema),
  tappingRecordController.create
);
router.put(
  "/:id",
  authorize("ADMIN", "MANAGER"),
  validateBody(updateTappingRecordSchema),
  tappingRecordController.update
);
router.delete("/:id", authorize("ADMIN", "MANAGER"), tappingRecordController.remove);

export default router;
