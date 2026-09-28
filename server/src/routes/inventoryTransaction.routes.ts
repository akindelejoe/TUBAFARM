import { Router } from "express";
import * as inventoryController from "../controllers/inventory.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.use(authenticate);
router.get("/", inventoryController.transactions);

export default router;
