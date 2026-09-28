import { api } from "./api";
import { ApiResponse } from "../types";

export interface DashboardData {
  kpis: {
    totalFarms: number;
    totalTrees: number;
    activeTrees: number;
    todaysProductionLiters: number;
    monthlyProductionLiters: number;
    currentInventoryUnits: number;
    monthlySales: number;
    monthlyExpenses: number;
    estimatedProfit: number;
  };
  charts: {
    dailyTuppingCollection: { date: string; total: number }[];
    weeklyTuppingCollection: { date: string; total: number }[];
    monthlyProductionTrend: { date: string; total: number }[];
    salesTrend: { date: string; total: number }[];
    expensesTrend: { date: string; total: number }[];
    productSalesBreakdown: { productName: string; totalRevenue: number }[];
  };
  recentTappingRecords: {
    id: string;
    tapDate: string;
    quantityLiters: number;
    quality: string;
    tree?: { treeCode: string };
    recordedBy?: { firstName: string; lastName: string };
  }[];
  recentSales: {
    id: string;
    saleDate: string;
    totalAmount: string | number;
    paymentStatus: string;
    customer?: { name: string };
  }[];
  lowInventoryAlerts: {
    id: string;
    quantityAvailable: number;
    reorderLevel: number;
    status: string;
    product?: { name: string; unit: string };
  }[];
  highestProducingTrees: {
    tree?: { id: string; treeCode: string; species: string; farm?: { name: string } };
    totalLiters: number;
  }[];
  farmPerformance: { farmId: string; farmName: string; totalProductionLiters: number }[];
}

export async function fetchDashboard() {
  const { data } = await api.get<ApiResponse<DashboardData>>("/dashboard");
  return data.data;
}
