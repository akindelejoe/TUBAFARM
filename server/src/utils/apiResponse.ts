import { Response } from "express";

export function ok(res: Response, data: unknown, message = "Success", status = 200) {
  return res.status(status).json({ success: true, message, data });
}

export function paginated(
  res: Response,
  items: unknown[],
  total: number,
  page: number,
  pageSize: number,
  message = "Success"
) {
  return res.status(200).json({
    success: true,
    message,
    data: items,
    pagination: {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize) || 1,
    },
  });
}
