import { UserDocument } from "../models/user-model.js";

declare global {
  namespace Express {
    interface User extends UserDocument {} // extend User type
  }
}
