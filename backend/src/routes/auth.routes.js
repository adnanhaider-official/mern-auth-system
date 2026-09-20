import { Router } from "express";

import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
} from "../controllers/auth.controller.js";

import verifyJwt from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", verifyJwt, getCurrentUser);
router.post("/logout", verifyJwt, logoutUser);

export default router;
