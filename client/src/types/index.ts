export type Role = "ADMIN" | "MANAGER" | "FARM_WORKER" | "SALES";
export type UserStatus = "ACTIVE" | "INACTIVE";
export type TreeStatus = "ACTIVE" | "INACTIVE" | "DISEASED" | "REMOVED";
export type Quality = "EXCELLENT" | "GOOD" | "AVERAGE" | "POOR";
export type ProductStatus = "ACTIVE" | "DISCONTINUED";
export type InventoryTransactionType = "STOCK_IN" | "STOCK_OUT" | "ADJUSTMENT" | "SALE";
export type CustomerType = "INDIVIDUAL" | "RETAILER" | "WHOLESALER" | "DISTRIBUTOR";
export type PaymentMethod = "CASH" | "CARD" | "BANK_TRANSFER" | "MOBILE_PAYMENT" | "OTHER";
export type PaymentStatus = "PAID" | "PARTIAL" | "UNPAID";
export type ExpenseCategory =
  | "LABOR"
  | "EQUIPMENT"
  | "TRANSPORTATION"
  | "FARM_SUPPLIES"
  | "MAINTENANCE"
  | "UTILITIES"
  | "OTHER";
export type InventoryStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  status: UserStatus;
}

export interface Farm {
  id: string;
  name: string;
  location: string;
  areaSize?: number | null;
  description?: string | null;
  isArchived: boolean;
  createdAt: string;
  _count?: { trees: number };
}

export interface Tree {
  id: string;
  farmId: string;
  treeCode: string;
  species: string;
  variety?: string | null;
  plantingDate: string;
  status: TreeStatus;
  notes?: string | null;
  farm?: { id: string; name: string };
}

export interface TappingRecord {
  id: string;
  treeId: string;
  recordedByUserId: string;
  tapDate: string;
  quantityLiters: number;
  quality: Quality;
  remarks?: string | null;
  tree?: { id: string; treeCode: string; farm?: { id: string; name: string } };
  recordedBy?: { firstName: string; lastName: string };
}

export interface Product {
  id: string;
  name: string;
  description?: string | null;
  category: string;
  unit: string;
  sellingPrice: string | number;
  status: ProductStatus;
  inventory?: Inventory | null;
}

export interface Inventory {
  id: string;
  productId: string;
  quantityAvailable: number;
  reorderLevel: number;
  lastUpdated: string;
  status?: InventoryStatus;
  product?: { id: string; name: string; unit: string };
}

export interface InventoryTransaction {
  id: string;
  productId: string;
  type: InventoryTransactionType;
  quantity: number;
  reference?: string | null;
  notes?: string | null;
  createdAt: string;
  product?: { name: string; unit: string };
  createdByUser?: { firstName: string; lastName: string };
}

export interface Customer {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  customerType: CustomerType;
}

export interface SaleItem {
  id: string;
  saleId: string;
  productId: string;
  quantity: number;
  unitPrice: string | number;
  lineTotal: string | number;
  product?: Product;
}

export interface Sale {
  id: string;
  customerId: string;
  soldByUserId: string;
  saleDate: string;
  subtotal: string | number;
  discount: string | number;
  totalAmount: string | number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  notes?: string | null;
  customer?: Customer;
  soldBy?: { firstName: string; lastName: string };
  saleItems: SaleItem[];
}

export interface Supplier {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
}

export interface Expense {
  id: string;
  category: ExpenseCategory;
  description: string;
  amount: string | number;
  expenseDate: string;
  supplierId?: string | null;
  supplier?: { id: string; name: string };
}

export interface Pagination {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiListResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: Pagination;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
