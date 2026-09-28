import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  prisma: { user: { findUnique: vi.fn() } },
  bcryptCompare: vi.fn(),
}));

vi.mock("../config/prisma", () => ({ prisma: mocks.prisma }));
vi.mock("bcrypt", () => ({
  default: { compare: mocks.bcryptCompare, hash: vi.fn().mockResolvedValue("hashed") },
}));
vi.mock("../config/env", () => ({ env: { jwtSecret: "test-secret", jwtExpiresIn: "1h" } }));

describe("login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects an unknown email", async () => {
    mocks.prisma.user.findUnique.mockResolvedValue(null);
    const { login } = await import("./auth.service");

    await expect(login({ email: "nobody@tubafarm.com", password: "x" })).rejects.toMatchObject({ statusCode: 401 });
  });

  it("rejects a deactivated user even with the correct password", async () => {
    mocks.prisma.user.findUnique.mockResolvedValue({
      id: "u1",
      email: "worker@tubafarm.com",
      status: "INACTIVE",
      passwordHash: "hashed",
      role: "FARM_WORKER",
    });
    const { login } = await import("./auth.service");

    await expect(login({ email: "worker@tubafarm.com", password: "correct" })).rejects.toMatchObject({
      statusCode: 401,
    });
    expect(mocks.bcryptCompare).not.toHaveBeenCalled();
  });

  it("rejects an incorrect password", async () => {
    mocks.prisma.user.findUnique.mockResolvedValue({
      id: "u1",
      email: "sales@tubafarm.com",
      status: "ACTIVE",
      passwordHash: "hashed",
      role: "SALES",
    });
    mocks.bcryptCompare.mockResolvedValue(false);
    const { login } = await import("./auth.service");

    await expect(login({ email: "sales@tubafarm.com", password: "wrong" })).rejects.toMatchObject({
      statusCode: 401,
    });
  });

  it("returns a signed token and a safe user object on success", async () => {
    mocks.prisma.user.findUnique.mockResolvedValue({
      id: "u1",
      firstName: "Ada",
      lastName: "Admin",
      email: "admin@tubafarm.com",
      status: "ACTIVE",
      passwordHash: "hashed",
      role: "ADMIN",
    });
    mocks.bcryptCompare.mockResolvedValue(true);
    const { login } = await import("./auth.service");

    const result = await login({ email: "admin@tubafarm.com", password: "correct" });

    expect(result.token).toEqual(expect.any(String));
    expect(result.user).toEqual(
      expect.objectContaining({ email: "admin@tubafarm.com", role: "ADMIN" })
    );
    expect((result.user as never as { passwordHash?: string }).passwordHash).toBeUndefined();
  });
});
