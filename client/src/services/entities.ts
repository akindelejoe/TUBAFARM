import { createCrudService } from "./crudFactory";
import { Customer, Expense, Farm, Product, Sale, Supplier, TappingRecord, Tree, User } from "../types";

export const farmService = createCrudService<Farm>("farms");
export const treeService = createCrudService<Tree>("trees");
export const tappingRecordService = createCrudService<TappingRecord>("tapping-records");
export const productService = createCrudService<Product>("products");
export const customerService = createCrudService<Customer>("customers");
export const supplierService = createCrudService<Supplier>("suppliers");
export const expenseService = createCrudService<Expense>("expenses");
export const userService = createCrudService<User>("users");
export const saleService = createCrudService<Sale>("sales");
