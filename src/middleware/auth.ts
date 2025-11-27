import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export function isAuthenticated(req: Request & { user?: any }, res: Response, next: NextFunction) {
  const token = req.cookies?.token;
  if (!token) return res.redirect("/login");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
    next();
  } catch (e) {
    res.clearCookie("token");
    return res.redirect("/login");
  }
}