import { Router } from "express";
import {
  createCheckoutSession,
  createPortalSession,
} from "../controllers/billingController.js";
import auth from "../middleware/auth.js"; // use your existing auth

const router = Router();

router.post("/create-checkout-session", auth, createCheckoutSession);
router.post("/portal", auth, createPortalSession);

export default router;
