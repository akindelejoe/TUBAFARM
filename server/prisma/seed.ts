import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "Demo@1234"; // demo-only, never use in production

async function hashed(password: string) {
  return bcrypt.hash(password, 12);
}

async function main() {
  console.log("Seeding TUBA Farm database...");

  const passwordHash = await hashed(DEMO_PASSWORD);

  const [admin, manager, worker, sales] = await Promise.all([
    prisma.user.upsert({
      where: { email: "admin@tubafarm.com" },
      update: {},
      create: { firstName: "Ada", lastName: "Admin", email: "admin@tubafarm.com", passwordHash, role: "ADMIN" },
    }),
    prisma.user.upsert({
      where: { email: "manager@tubafarm.com" },
      update: {},
      create: { firstName: "Mika", lastName: "Manager", email: "manager@tubafarm.com", passwordHash, role: "MANAGER" },
    }),
    prisma.user.upsert({
      where: { email: "worker@tubafarm.com" },
      update: {},
      create: { firstName: "Wade", lastName: "Worker", email: "worker@tubafarm.com", passwordHash, role: "FARM_WORKER" },
    }),
    prisma.user.upsert({
      where: { email: "sales@tubafarm.com" },
      update: {},
      create: { firstName: "Sasha", lastName: "Sales", email: "sales@tubafarm.com", passwordHash, role: "SALES" },
    }),
  ]);

  const farm1 = await prisma.farm.create({
    data: { name: "Coastal Tuba Farm", location: "Batangas", areaSize: 12.5, description: "Main production farm" },
  });
  const farm2 = await prisma.farm.create({
    data: { name: "Highland Tuba Farm", location: "Quezon", areaSize: 8.2, description: "Secondary hillside farm" },
  });

  const species = ["Nipa", "Coconut", "Buri"];
  const trees = [];
  for (let i = 1; i <= 12; i++) {
    trees.push(
      await prisma.tree.create({
        data: {
          farmId: farm1.id,
          treeCode: `CTF-${String(i).padStart(3, "0")}`,
          species: species[i % species.length],
          variety: "Standard",
          plantingDate: new Date(2019, i % 12, 1),
          status: i % 10 === 0 ? "DISEASED" : "ACTIVE",
        },
      })
    );
  }
  for (let i = 1; i <= 10; i++) {
    trees.push(
      await prisma.tree.create({
        data: {
          farmId: farm2.id,
          treeCode: `HTF-${String(i).padStart(3, "0")}`,
          species: species[i % species.length],
          variety: "Highland",
          plantingDate: new Date(2020, i % 12, 1),
          status: i % 8 === 0 ? "INACTIVE" : "ACTIVE",
        },
      })
    );
  }

  const qualities = ["EXCELLENT", "GOOD", "AVERAGE", "POOR"] as const;
  const workers = [worker.id, manager.id];
  for (let day = 0; day < 30; day++) {
    for (const tree of trees) {
      if (Math.random() > 0.6) continue;
      const tapDate = new Date();
      tapDate.setDate(tapDate.getDate() - day);
      await prisma.tappingRecord.create({
        data: {
          treeId: tree.id,
          recordedByUserId: workers[Math.floor(Math.random() * workers.length)],
          tapDate,
          quantityLiters: Math.round((Math.random() * 5 + 1) * 10) / 10,
          quality: qualities[Math.floor(Math.random() * qualities.length)],
        },
      });
    }
  }

  const productDefs = [
    { name: "Fresh Tuba", category: "Beverage", unit: "liter", sellingPrice: 80, initialQuantity: 200, reorderLevel: 30 },
    { name: "Tuba Vinegar", category: "Condiment", unit: "bottle", sellingPrice: 120, initialQuantity: 80, reorderLevel: 15 },
    { name: "Tuba Sugar", category: "Sweetener", unit: "pack", sellingPrice: 150, initialQuantity: 60, reorderLevel: 10 },
    { name: "Tuba Syrup", category: "Sweetener", unit: "bottle", sellingPrice: 180, initialQuantity: 40, reorderLevel: 10 },
    { name: "Aged Tuba", category: "Beverage", unit: "liter", sellingPrice: 100, initialQuantity: 50, reorderLevel: 20 },
  ];

  const products = [];
  for (const p of productDefs) {
    products.push(
      await prisma.product.create({
        data: {
          name: p.name,
          category: p.category,
          unit: p.unit,
          sellingPrice: p.sellingPrice,
          inventory: { create: { quantityAvailable: p.initialQuantity, reorderLevel: p.reorderLevel } },
        },
      })
    );
  }

  const customerDefs = [
    { name: "Joe's Market", customerType: "RETAILER" as const },
    { name: "Maria Santos", customerType: "INDIVIDUAL" as const },
    { name: "Metro Distributors", customerType: "DISTRIBUTOR" as const },
    { name: "Sunrise Wholesale", customerType: "WHOLESALER" as const },
    { name: "Corner Store Co.", customerType: "RETAILER" as const },
  ];
  const customers = [];
  for (const c of customerDefs) {
    customers.push(await prisma.customer.create({ data: c }));
  }

  for (let i = 0; i < 15; i++) {
    const customer = customers[Math.floor(Math.random() * customers.length)];
    const numItems = 1 + Math.floor(Math.random() * 3);
    const chosenProducts = [...products].sort(() => Math.random() - 0.5).slice(0, numItems);

    let subtotal = 0;
    const items = chosenProducts.map((p) => {
      const quantity = 1 + Math.floor(Math.random() * 5);
      const unitPrice = Number(p.sellingPrice);
      const lineTotal = unitPrice * quantity;
      subtotal += lineTotal;
      return { productId: p.id, quantity, unitPrice, lineTotal };
    });

    const discount = Math.random() > 0.7 ? Math.round(subtotal * 0.05) : 0;
    const saleDate = new Date();
    saleDate.setDate(saleDate.getDate() - Math.floor(Math.random() * 30));

    await prisma.sale.create({
      data: {
        customerId: customer.id,
        soldByUserId: sales.id,
        saleDate,
        subtotal,
        discount,
        totalAmount: subtotal - discount,
        paymentMethod: ["CASH", "CARD", "BANK_TRANSFER", "MOBILE_PAYMENT"][Math.floor(Math.random() * 4)] as never,
        paymentStatus: ["PAID", "PARTIAL", "UNPAID"][Math.floor(Math.random() * 3)] as never,
        saleItems: { create: items },
      },
    });
  }

  const suppliers = [];
  for (const name of ["Farm Supply Co.", "AgriTools Inc.", "Green Fields Supplier"]) {
    suppliers.push(await prisma.supplier.create({ data: { name } }));
  }

  const expenseCategories = ["LABOR", "EQUIPMENT", "TRANSPORTATION", "FARM_SUPPLIES", "MAINTENANCE", "UTILITIES"] as const;
  for (let i = 0; i < 20; i++) {
    const expenseDate = new Date();
    expenseDate.setDate(expenseDate.getDate() - Math.floor(Math.random() * 60));
    await prisma.expense.create({
      data: {
        category: expenseCategories[Math.floor(Math.random() * expenseCategories.length)],
        description: "Routine farm operating expense",
        amount: Math.round((Math.random() * 5000 + 500) * 100) / 100,
        expenseDate,
        supplierId: Math.random() > 0.4 ? suppliers[Math.floor(Math.random() * suppliers.length)].id : undefined,
        createdByUserId: manager.id,
      },
    });
  }

  console.log("Seed complete.");
  console.log("Demo accounts (password for all: %s):", DEMO_PASSWORD);
  console.log("  Admin:       admin@tubafarm.com");
  console.log("  Manager:     manager@tubafarm.com");
  console.log("  Farm Worker: worker@tubafarm.com");
  console.log("  Sales:       sales@tubafarm.com");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
