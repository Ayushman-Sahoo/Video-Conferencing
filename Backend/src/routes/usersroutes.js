import { Router } from "express";

// Import controller functions (MATCH EXACT NAMES)
import {
  login,
  register,
  addToHistory,
  getUserHistory,
} from "../controllers/userController.js";

const router = Router();

// =====================
// User Authentication Routes
// =====================

// Login user
router.post("/login", login);

// Register user
router.post("/register", register);

// =====================
// Activity / Meeting Routes
// =====================

// Add meeting to history
router.post("/add_to_activity", addToHistory);

// Get all meetings for user
router.get("/getallactivity", getUserHistory);

export default router;