import { prisma } from "../config/prisma";
import { AppError } from "../utils/AppError";
import { CreateProductInput, UpdateProductInput } from "../validators/product.validators";

export async function listProducts(skip: number, take: number, search?: string) {
  const where = search
    ? { name: { contains: search, mode: "insensitive" as const } }
    : {};

  const [items, total] = await prisma.$transaction([
    prisma.product.findMany({ where, skip, take, orderBy: { createdAt: "desc" }, include: { inventory: true } }),
    prisma.product.count({ where }),
  ]);

  return { items, total };
}

export async function createProduct(input: CreateProductInput) {
  const { initialQuantity, reorderLevel, ...productData } = input;

  return prisma.product.create({
    data: {
      ...productData,
      inventory: {
        create: {
          quantityAvailable: initialQuantity ?? 0,
          reorderLevel: reorderLevel ?? 0,
        },
      },
    },
    include: { inventory: true },
  });
}

export async function updateProduct(id: string, input: UpdateProductInput) {
  await getProductOrThrow(id);
  return prisma.product.update({ where: { id }, data: input });
}

export async function discontinueProduct(id: string) {
  await getProductOrThrow(id);
  return prisma.product.update({ where: { id }, data: { status: "DISCONTINUED" } });
}

async function getProductOrThrow(id: string) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw AppError.notFound("Product");
  return product;
}
