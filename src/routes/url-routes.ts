import { Router } from "express";
import { shortenController } from "../controllers/shorten-controller";
import { lookupController } from "../controllers/lookup-controller";
import { isAuthenticated } from "../middleware/auth";
import { shortenLimiter, limitBy } from "../middleware/rate-limit";


const router = Router();

// Auth only for shortening
router.post("/shorten", limitBy(shortenLimiter), isAuthenticated, shortenController);

// Public redirect
router.get("/:code", lookupController);

export default router;
