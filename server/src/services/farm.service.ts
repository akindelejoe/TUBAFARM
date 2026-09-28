import { prisma } from "../config/prisma";
import { AppError } from "../utils/AppError";
import { CreateFarmInput, UpdateFarmInput } from "../validators/farm.validators";

export async function listFarms(skip: number, take: number, search?: string) {
  const where = {
    isArchived: false,
    ...(search ? { name: { contains: search, mode: "insensitive" as const } } : {}),
  };

  const [items, total] = await prisma.$transaction([
    prisma.farm.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { trees: true } } },
    }),
    prisma.farm.count({ where }),
  ]);

  return { items, total };
}

export async function createFarm(input: CreateFarmInput) {
  return prisma.farm.create({ data: input });
}

export async function updateFarm(id: string, input: UpdateFarmInput) {
  await getFarmOrThrow(id);
  return prisma.farm.update({ where: { id }, data: input });
}

export async function archiveFarm(id: string) {
  await getFarmOrThrow(id);
  return prisma.farm.update({ where: { id }, data: { isArchived: true } });
}

async function getFarmOrThrow(id: string) {
  const farm = await prisma.farm.findUnique({ where: { id } });
  if (!farm) throw AppError.notFound("Farm");
  return farm;
}

export async function getFarmDetails(id: string) {
  const farm = await prisma.farm.findUnique({
    where: { id },
    include: { trees: { select: { id: true, status: true } } },
  });
  if (!farm) throw AppError.notFound("Farm");

  const treeIds = farm.trees.map((t) => t.id);
  const activeTrees = farm.trees.filter((t) => t.status === "ACTIVE").length;

  const productionAgg = await prisma.tappingRecord.aggregate({
    where: { treeId: { in: treeIds } },
    _sum: { quantityLiters: true },
  });

  const recentTappingRecords = await prisma.tappingRecord.findMany({
    where: { treeId: { in: treeIds } },
    orderBy: { tapDate: "desc" },
    take: 10,
    include: { tree: { select: { treeCode: true } } },
  });

  return {
    farm: { id: farm.id, name: farm.name, location: farm.location, areaSize: farm.areaSize, description: farm.description },
    treeCount: farm.trees.length,
    activeTreeCount: activeTrees,
    totalProductionLiters: productionAgg._sum.quantityLiters ?? 0,
    recentTappingRecords,
  };
}
