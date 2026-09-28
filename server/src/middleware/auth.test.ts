import { describe, expect, it, vi } from "vitest";
import { authorize } from "./auth";
import { AppError } from "../utils/AppError";

function mockReq(role?: "ADMIN" | "MANAGER" | "FARM_WORKER" | "SALES") {
  return role ? ({ user: { id: "u1", role, email: "a@b.com" } } as never) : ({} as never);
}

describe("authorize middleware", () => {
  it("calls next() with no error when the user has an allowed role", () => {
    const next = vi.fn();
    authorize("ADMIN", "MANAGER")(mockReq("MANAGER"), {} as never, next);
    expect(next).toHaveBeenCalledWith();
  });

  it("calls next() with a 403 AppError when the role is not allowed", () => {
    const next = vi.fn();
    authorize("ADMIN")(mockReq("SALES"), {} as never, next);
    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(403);
  });

  it("calls next() with a 401 AppError when there is no authenticated user", () => {
    const next = vi.fn();
    authorize("ADMIN")(mockReq(), {} as never, next);
    const err = next.mock.calls[0][0];
    expect(err.statusCode).toBe(401);
  });
});
