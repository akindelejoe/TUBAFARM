import { beforeEach, describe, expect, it, vi } from "vitest";
import { deriveInventoryStatus } from "./inventory.service";

describe("deriveInventoryStatus", () => {
  it("returns OUT_OF_STOCK when quantity is zero or negative", () => {
    expect(deriveInventoryStatus(0, 10)).toBe("OUT_OF_STOCK");
    expect(deriveInventoryStatus(-5, 10)).toBe("OUT_OF_STOCK");
  });

  it("returns LOW_STOCK when quantity is at or below the reorder level", () => {
    expect(deriveInventoryStatus(10, 10)).toBe("LOW_STOCK");
    expect(deriveInventoryStatus(5, 10)).toBe("LOW_STOCK");
  });

  it("returns IN_STOCK when quantity is above the reorder level", () => {
    expect(deriveInventoryStatus(11, 10)).toBe("IN_STOCK");
  });
});

const mocks = vi.hoisted(() => {
  const tx = {
    inventory: { findUnique: vi.fn(), update: vi.fn() },
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

describe("stockOut", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws a conflict error when requested quantity exceeds what's available", async () => {
    mocks.tx.inventory.findUnique.mockResolvedValue({ productId: "p1", quantityAvailable: 5, reorderLevel: 2 });
    const { stockOut } = await import("./inventory.service");

    await expect(stockOut({ productId: "p1", quantity: 10 }, "user1")).rejects.toMatchObject({
      statusCode: 409,
    });
    expect(mocks.tx.inventory.update).not.toHaveBeenCalled();
  });

  it("decrements inventory and logs a STOCK_OUT transaction on success", async () => {
    mocks.tx.inventory.findUnique.mockResolvedValue({ productId: "p1", quantityAvailable: 20, reorderLevel: 2 });
    mocks.tx.inventory.update.mockResolvedValue({ productId: "p1", quantityAvailable: 15 });
    const { stockOut } = await import("./inventory.service");

    await stockOut({ productId: "p1", quantity: 5 }, "user1");

    expect(mocks.tx.inventory.update).toHaveBeenCalledWith({
      where: { productId: "p1" },
      data: { quantityAvailable: { decrement: 5 } },
    });
    expect(mocks.tx.inventoryTransaction.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ type: "STOCK_OUT", quantity: 5 }) })
    );
  });
});
