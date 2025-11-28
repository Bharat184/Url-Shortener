import { Router } from "express";
import { addUser, fetchUsers } from "../controllers/user-controller";

const router = Router();

router.post("/", addUser);
router.get("/", fetchUsers);

export default router;
