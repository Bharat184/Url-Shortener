import { Passport } from "passport";

declare global {
  namespace Passport {
    interface User {
      id: number;
      email: string;
    }
  }
}
