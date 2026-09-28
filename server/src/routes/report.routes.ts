import { Router } from "express";
import * as reportController from "../controllers/report.controller";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

router.use(authenticate, authorize("ADMIN", "MANAGER"));

router.get("/production", reportController.production);
router.get("/sales", reportController.sales);
router.get("/inventory", reportController.inventory);
router.get("/expenses", reportController.expenses);
router.get("/profit-loss", reportController.profitLoss);
router.get("/tree-productivity", reportController.treeProductivity);
router.get("/customer-sales", reportController.customerSales);

export default router;
