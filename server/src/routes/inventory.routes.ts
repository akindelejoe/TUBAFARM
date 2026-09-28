import { Router } from "express";
import * as inventoryController from "../controllers/inventory.controller";
import { authenticate, authorize } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { adjustmentSchema, stockMovementSchema } from "../validators/inventory.validators";

const router = Router();

router.use(authenticate);

router.get("/", inventoryController.list);
router.post("/stock-in", authorize("ADMIN", "MANAGER"), validateBody(stockMovementSchema), inventoryController.stockIn);
router.post(
  "/stock-out",
  authorize("ADMIN", "MANAGER", "SALES"),
  validateBody(stockMovementSchema),
  inventoryController.stockOut
);
router.post("/adjust", authorize("ADMIN", "MANAGER"), validateBody(adjustmentSchema), inventoryController.adjust);

export default router;
