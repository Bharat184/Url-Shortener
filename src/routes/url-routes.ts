import { Router } from "express";
import { shortenController } from "../controllers/shorten-controller";
import { lookupController } from "../controllers/lookup-controller";

const router = Router();

// Auth only for shortening
router.post("/shorten", shortenController);

// Public redirect
router.get("/:code", lookupController);

export default router;
