import { Router } from "express";
import * as expenseController from "../controllers/expense.controller";
import { authenticate, authorize } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { createExpenseSchema, updateExpenseSchema } from "../validators/expense.validators";

const router = Router();

router.use(authenticate);

router.get("/", authorize("ADMIN", "MANAGER"), expenseController.list);
router.post("/", authorize("ADMIN", "MANAGER"), validateBody(createExpenseSchema), expenseController.create);
router.put("/:id", authorize("ADMIN", "MANAGER"), validateBody(updateExpenseSchema), expenseController.update);
router.delete("/:id", authorize("ADMIN", "MANAGER"), expenseController.remove);

export default router;
