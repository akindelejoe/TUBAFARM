import { Prisma, TreeStatus } from "@prisma/client";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/AppError";
import { CreateTreeInput, UpdateTreeInput } from "../validators/tree.validators";

export interface TreeFilters {
  farmId?: string;
  status?: TreeStatus;
  search?: string;
}

export async function listTrees(skip: number, take: number, filters: TreeFilters) {
  const where: Prisma.TreeWhereInput = {
    ...(filters.farmId ? { farmId: filters.farmId } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.search
      ? {
          OR: [
            { treeCode: { contains: filters.search, mode: "insensitive" } },
            { species: { contains: filters.search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [items, total] = await prisma.$transaction([
    prisma.tree.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: { farm: { select: { id: true, name: true } } },
    }),
    prisma.tree.count({ where }),
  ]);

  return { items, total };
}

export async function createTree(input: CreateTreeInput) {
  const farm = await prisma.farm.findUnique({ where: { id: input.farmId } });
  if (!farm) throw AppError.notFound("Farm");

  return prisma.tree.create({ data: input });
}

export async function updateTree(id: string, input: UpdateTreeInput) {
  await getTreeOrThrow(id);
  if (input.farmId) {
    const farm = await prisma.farm.findUnique({ where: { id: input.farmId } });
    if (!farm) throw AppError.notFound("Farm");
  }
  return prisma.tree.update({ where: { id }, data: input });
}

export async function archiveTree(id: string) {
  await getTreeOrThrow(id);
  return prisma.tree.update({ where: { id }, data: { status: "REMOVED" } });
}

async function getTreeOrThrow(id: string) {
  const tree = await prisma.tree.findUnique({ where: { id } });
  if (!tree) throw AppError.notFound("Tree");
  return tree;
}

export async function getTreeDetails(id: string) {
  const tree = await prisma.tree.findUnique({
    where: { id },
    include: { farm: { select: { id: true, name: true } } },
  });
  if (!tree) throw AppError.notFound("Tree");

  const [productionAgg, recordCount, recentRecords] = await Promise.all([
    prisma.tappingRecord.aggregate({ where: { treeId: id }, _sum: { quantityLiters: true } }),
    prisma.tappingRecord.count({ where: { treeId: id } }),
    prisma.tappingRecord.findMany({
      where: { treeId: id },
      orderBy: { tapDate: "desc" },
      take: 15,
    }),
  ]);

  const totalProduction = productionAgg._sum.quantityLiters ?? 0;
  const averagePerTapping = recordCount > 0 ? totalProduction / recordCount : 0;

  return {
    tree,
    totalLifetimeProductionLiters: totalProduction,
    averageProductionPerTapping: averagePerTapping,
    recentTappingRecords: recentRecords,
  };
}
