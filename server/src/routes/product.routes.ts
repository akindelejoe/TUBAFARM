import { Router } from "express";
import * as productController from "../controllers/product.controller";
import { authenticate, authorize } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { createProductSchema, updateProductSchema } from "../validators/product.validators";

const router = Router();

router.use(authenticate);

router.get("/", productController.list);
router.post("/", authorize("ADMIN", "MANAGER"), validateBody(createProductSchema), productController.create);
router.put("/:id", authorize("ADMIN", "MANAGER"), validateBody(updateProductSchema), productController.update);
router.delete("/:id", authorize("ADMIN", "MANAGER"), productController.discontinue);

export default router;
