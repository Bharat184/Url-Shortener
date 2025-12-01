import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { User } from "../models/user-model.js";

export async function isAuthenticated(req: Request & { user?: any }, res: Response, next: NextFunction) {
  const token = req.cookies?.token;
  if (!token) return res.redirect("/login");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    const user = await User.findById(decoded.id);
    if (!user) {
      throw new Error('Invalid User');
    }
    req.user = user;
    next();
  } catch (e) {
    res.clearCookie("token");
    return res.redirect("/login");
  }
}