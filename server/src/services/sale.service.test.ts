import { beforeEach, describe, expect, it, vi } from "vitest";
import { Prisma } from "@prisma/client";

const mocks = vi.hoisted(() => {
  const tx = {
    customer: { findUnique: vi.fn() },
    product: { findMany: vi.fn() },
    sale: { create: vi.fn() },
    inventory: { update: vi.fn() },
    inventoryTransaction: { create: vi.fn() },
  };
  return {
    tx,
    prisma: {
      $transaction: vi.fn((cb: (tx: typeof tx) => unknown) => cb(tx)),
    },
  };
});

vi.mock("../config/prisma", () => ({ prisma: mocks.prisma }));

function product(id: string, price: number, quantityAvailable: number) {
  return {
    id,
    name: `Product ${id}`,
    status: "ACTIVE" as const,
    sellingPrice: new Prisma.Decimal(price),
    inventory: { quantityAvailable, reorderLevel: 0 },
  };
}

describe("createSale", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.tx.customer.findUnique.mockResolvedValue({ id: "c1", name: "Joe's Market" });
    mocks.tx.sale.create.mockImplementation(({ data }: never) => Promise.resolve({ id: "sale1", ...data }));
  });

  it("throws a conflict error when a line item requests more than is in stock", async () => {
    mocks.tx.product.findMany.mockResolvedValue([product("p1", 80, 3)]);
    const { createSale } = await import("./sale.service");

    await expect(
      createSale({ customerId: "c1", paymentMethod: "CASH", items: [{ productId: "p1", quantity: 10 }] }, "u1")
    ).rejects.toMatchObject({ statusCode: 409 });

    expect(mocks.tx.sale.create).not.toHaveBeenCalled();
  });

  it("rejects a customer that does not exist", async () => {
    mocks.tx.customer.findUnique.mockResolvedValue(null);
    const { createSale } = await import("./sale.service");

    await expect(
      createSale({ customerId: "missing", paymentMethod: "CASH", items: [{ productId: "p1", quantity: 1 }] }, "u1")
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it("computes subtotal/total server-side and decrements inventory for every line item", async () => {
    mocks.tx.product.findMany.mockResolvedValue([product("p1", 80, 50), product("p2", 120, 50)]);
    const { createSale } = await import("./sale.service");

    await createSale(
      {
        customerId: "c1",
        paymentMethod: "CASH",
        discount: 10,
        items: [
          { productId: "p1", quantity: 2 }, // 160
          { productId: "p2", quantity: 1 }, // 120
        ],
      },
      "u1"
    );

    const createCall = mocks.tx.sale.create.mock.calls[0][0];
    expect(createCall.data.subtotal.toString()).toBe("280");
    expect(createCall.data.totalAmount.toString()).toBe("270");

    expect(mocks.tx.inventory.update).toHaveBeenCalledWith({
      where: { productId: "p1" },
      data: { quantityAvailable: { decrement: 2 } },
    });
    expect(mocks.tx.inventory.update).toHaveBeenCalledWith({
      where: { productId: "p2" },
      data: { quantityAvailable: { decrement: 1 } },
    });
    expect(mocks.tx.inventoryTransaction.create).toHaveBeenCalledTimes(2);
  });

  it("rejects a discount larger than the subtotal", async () => {
    mocks.tx.product.findMany.mockResolvedValue([product("p1", 80, 50)]);
    const { createSale } = await import("./sale.service");

    await expect(
      createSale(
        { customerId: "c1", paymentMethod: "CASH", discount: 1000, items: [{ productId: "p1", quantity: 1 }] },
        "u1"
      )
    ).rejects.toMatchObject({ statusCode: 409 });
  });
});
