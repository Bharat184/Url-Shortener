import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export function isGuest(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.token;
  if (!token) return next();

  try {
    jwt.verify(token, process.env.JWT_SECRET!);
    return res.redirect("/");
  } catch {
    return next();
  }
}
