import express from "express";
import { getDashboardStats } from "../controllers/dashboard.controller.js";
import { verifyToken } from "../middlewares/auth.middlewares.js";

const router = express.Router();

router.get("/stats", verifyToken, getDashboardStats);

export { router as dashboardRoutes };
