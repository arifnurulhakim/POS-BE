import { Response } from "express";

export function response_success(res: Response, message: string, data?: any) {
  return res.status(200).json({
    success: true,
    message,
    data,
  });
}

export function response_error(res: Response, message: string) {
  return res.status(500).json({
    success: false,
    message,
  });
}