import { Router } from "express";
import { shortenController } from "../controllers/shorten-controller";
import { lookupController } from "../controllers/lookup-controller";
import { isAuthenticated } from "../middleware/auth";

const router = Router();

// Auth only for shortening
router.post("/shorten", isAuthenticated, shortenController);

// Public redirect
router.get("/:code", lookupController);

export default router;
