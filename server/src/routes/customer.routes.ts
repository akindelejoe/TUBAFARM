import { Router } from "express";
import * as customerController from "../controllers/customer.controller";
import { authenticate, authorize } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { createCustomerSchema, updateCustomerSchema } from "../validators/customer.validators";

const router = Router();

router.use(authenticate);

router.get("/", customerController.list);
router.get("/:id", customerController.details);
router.post(
  "/",
  authorize("ADMIN", "MANAGER", "SALES"),
  validateBody(createCustomerSchema),
  customerController.create
);
router.put(
  "/:id",
  authorize("ADMIN", "MANAGER", "SALES"),
  validateBody(updateCustomerSchema),
  customerController.update
);

export default router;
