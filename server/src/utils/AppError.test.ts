import { describe, expect, it } from "vitest";
import { AppError } from "./AppError";

describe("AppError", () => {
  it("notFound sets a 404 status with a descriptive message", () => {
    const err = AppError.notFound("Tree");
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe("Tree not found");
  });

  it("conflict sets a 409 status", () => {
    const err = AppError.conflict("Insufficient inventory");
    expect(err.statusCode).toBe(409);
  });

  it("unauthorized defaults to a generic message", () => {
    const err = AppError.unauthorized();
    expect(err.statusCode).toBe(401);
    expect(err.message).toBe("Unauthorized");
  });

  it("forbidden defaults to a generic message", () => {
    const err = AppError.forbidden();
    expect(err.statusCode).toBe(403);
    expect(err.message).toBe("Forbidden");
  });
});
