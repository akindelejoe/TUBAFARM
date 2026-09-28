import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

import authRoutes from "./routes/auth.routes";
import farmRoutes from "./routes/farm.routes";
import treeRoutes from "./routes/tree.routes";
import tappingRecordRoutes from "./routes/tappingRecord.routes";
import productRoutes from "./routes/product.routes";
import inventoryRoutes from "./routes/inventory.routes";
import inventoryTransactionRoutes from "./routes/inventoryTransaction.routes";
import customerRoutes from "./routes/customer.routes";
import saleRoutes from "./routes/sale.routes";
import expenseRoutes from "./routes/expense.routes";
import supplierRoutes from "./routes/supplier.routes";
import userRoutes from "./routes/user.routes";
import reportRoutes from "./routes/report.routes";
import dashboardRoutes from "./routes/dashboard.routes";

export const app = express();

// Render (and most hosts) sit behind a proxy; needed for correct client IPs in rate limiting.
app.set("trust proxy", 1);

app.use(helmet());
app.use(cors({ origin: env.corsOrigin }));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ success: true, message: "TUBA Farm API is running" }));

app.use("/api/auth", authRoutes);
app.use("/api/farms", farmRoutes);
app.use("/api/trees", treeRoutes);
app.use("/api/tapping-records", tappingRecordRoutes);
app.use("/api/products", productRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/inventory-transactions", inventoryTransactionRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/sales", saleRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/users", userRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use(notFoundHandler);
app.use(errorHandler);
