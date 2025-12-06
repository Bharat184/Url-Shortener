import { UserDocument } from "../models/user-model.js";
import "express";

declare global {
  namespace Express {
    interface User extends UserDocument {} // extend User type
    interface Request {
      flash(type: string, message: string | string[]): void;
      flash(): { [key: string]: string[] };
    }
  }
}
