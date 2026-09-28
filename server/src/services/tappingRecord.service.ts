import { Prisma, Quality } from "@prisma/client";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/AppError";
import { CreateTappingRecordInput, UpdateTappingRecordInput } from "../validators/tappingRecord.validators";

export interface TappingRecordFilters {
  farmId?: string;
  treeId?: string;
  quality?: Quality;
  dateFrom?: Date;
  dateTo?: Date;
}

export async function listTappingRecords(skip: number, take: number, filters: TappingRecordFilters) {
  const where: Prisma.TappingRecordWhereInput = {
    ...(filters.treeId ? { treeId: filters.treeId } : {}),
    ...(filters.quality ? { quality: filters.quality } : {}),
    ...(filters.farmId ? { tree: { farmId: filters.farmId } } : {}),
    ...(filters.dateFrom || filters.dateTo
      ? {
          tapDate: {
            ...(filters.dateFrom ? { gte: filters.dateFrom } : {}),
            ...(filters.dateTo ? { lte: filters.dateTo } : {}),
          },
        }
      : {}),
  };

  const [items, total] = await prisma.$transaction([
    prisma.tappingRecord.findMany({
      where,
      skip,
      take,
      orderBy: { tapDate: "desc" },
      include: {
        tree: { select: { id: true, treeCode: true, farm: { select: { id: true, name: true } } } },
        recordedBy: { select: { id: true, firstName: true, lastName: true } },
      },
    }),
    prisma.tappingRecord.count({ where }),
  ]);

  return { items, total };
}

export async function createTappingRecord(input: CreateTappingRecordInput, recordedByUserId: string) {
  const tree = await prisma.tree.findUnique({ where: { id: input.treeId } });
  if (!tree) throw AppError.notFound("Tree");

  return prisma.tappingRecord.create({ data: { ...input, recordedByUserId } });
}

export async function updateTappingRecord(id: string, input: UpdateTappingRecordInput) {
  const record = await prisma.tappingRecord.findUnique({ where: { id } });
  if (!record) throw AppError.notFound("Tapping record");
  return prisma.tappingRecord.update({ where: { id }, data: input });
}

export async function deleteTappingRecord(id: string) {
  const record = await prisma.tappingRecord.findUnique({ where: { id } });
  if (!record) throw AppError.notFound("Tapping record");
  await prisma.tappingRecord.delete({ where: { id } });
}
