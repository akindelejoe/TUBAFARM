import { Router } from "express";
import * as saleController from "../controllers/sale.controller";
import { authenticate, authorize } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { createSaleSchema } from "../validators/sale.validators";

const router = Router();

router.use(authenticate);

router.get("/", saleController.list);
router.get("/:id", saleController.details);
router.post("/", authorize("ADMIN", "MANAGER", "SALES"), validateBody(createSaleSchema), saleController.create);

export default router;
