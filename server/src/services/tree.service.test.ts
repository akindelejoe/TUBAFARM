import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  prisma: {
    farm: { findUnique: vi.fn() },
    tree: { create: vi.fn() },
  },
}));

vi.mock("../config/prisma", () => ({ prisma: mocks.prisma }));

describe("createTree", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects when the referenced farm does not exist", async () => {
    mocks.prisma.farm.findUnique.mockResolvedValue(null);
    const { createTree } = await import("./tree.service");

    await expect(
      createTree({
        farmId: "missing-farm",
        treeCode: "CTF-099",
        species: "Coconut",
        plantingDate: new Date(),
      })
    ).rejects.toMatchObject({ statusCode: 404 });

    expect(mocks.prisma.tree.create).not.toHaveBeenCalled();
  });

  it("creates the tree once the farm is confirmed to exist", async () => {
    mocks.prisma.farm.findUnique.mockResolvedValue({ id: "farm1" });
    mocks.prisma.tree.create.mockResolvedValue({ id: "tree1" });
    const { createTree } = await import("./tree.service");

    const input = { farmId: "farm1", treeCode: "CTF-100", species: "Coconut", plantingDate: new Date() };
    await createTree(input);

    expect(mocks.prisma.tree.create).toHaveBeenCalledWith({ data: input });
  });
});
