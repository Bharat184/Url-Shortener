import { Router } from "express";
import { shortenController } from "../controllers/shorten-controller.js";
import { lookupController } from "../controllers/lookup-controller.js";
import { isAuthenticated } from "../middleware/auth.js";
import { shortenLimiter, limitBy } from "../middleware/rate-limit.js";


const router = Router();

// Auth only for shortening
router.post("/shorten", limitBy(shortenLimiter), isAuthenticated, shortenController);

// Public redirect
router.get("/:code", lookupController);

export default router;
