import { prisma } from "../config/prisma";
import { AppError } from "../utils/AppError";
import { hashPassword } from "./auth.service";
import { CreateUserInput, ResetPasswordInput, UpdateUserInput } from "../validators/user.validators";

const SAFE_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  role: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} as const;

export async function listUsers(skip: number, take: number) {
  const [items, total] = await prisma.$transaction([
    prisma.user.findMany({ skip, take, orderBy: { createdAt: "desc" }, select: SAFE_SELECT }),
    prisma.user.count(),
  ]);
  return { items, total };
}

export async function createUser(input: CreateUserInput) {
  const passwordHash = await hashPassword(input.password);
  return prisma.user.create({
    data: {
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      role: input.role,
      passwordHash,
    },
    select: SAFE_SELECT,
  });
}

export async function updateUser(id: string, input: UpdateUserInput) {
  await getUserOrThrow(id);
  return prisma.user.update({ where: { id }, data: input, select: SAFE_SELECT });
}

export async function deactivateUser(id: string) {
  await getUserOrThrow(id);
  return prisma.user.update({ where: { id }, data: { status: "INACTIVE" }, select: SAFE_SELECT });
}

export async function resetPassword(id: string, input: ResetPasswordInput) {
  await getUserOrThrow(id);
  const passwordHash = await hashPassword(input.newPassword);
  await prisma.user.update({ where: { id }, data: { passwordHash } });
}

async function getUserOrThrow(id: string) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw AppError.notFound("User");
  return user;
}
