import { Router } from "express";
import * as supplierController from "../controllers/supplier.controller";
import { authenticate, authorize } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { createSupplierSchema, updateSupplierSchema } from "../validators/supplier.validators";

const router = Router();

router.use(authenticate);

router.get("/", supplierController.list);
router.get("/:id", supplierController.details);
router.post("/", authorize("ADMIN", "MANAGER"), validateBody(createSupplierSchema), supplierController.create);
router.put("/:id", authorize("ADMIN", "MANAGER"), validateBody(updateSupplierSchema), supplierController.update);
router.delete("/:id", authorize("ADMIN", "MANAGER"), supplierController.archive);

export default router;
