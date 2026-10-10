import express from "express";
import {
    createStockValidation,
    deleteStockValidation,
    updateStockValidation,
    getStockValidation,
} from "../middlewares/stock.middlewares.js";
import {
    createStock,
    getAllStocks,
    deleteStock,
    updateStock,
    getStock,
    lookupStocks,
} from "../controllers/stock.controller.js";
import { verifyToken, isAdmin } from "../middlewares/auth.middlewares.js";

const router = express.Router();

router.get("/lookup", verifyToken, lookupStocks);

router
    .route("/")
    .post(verifyToken, isAdmin, createStockValidation, createStock)
    .get(verifyToken, getAllStocks);
router
    .route("/:stockId")
    .get(verifyToken, isAdmin, getStockValidation, getStock)
    .patch(verifyToken, isAdmin, updateStockValidation, updateStock)
    .delete(verifyToken, isAdmin, deleteStockValidation, deleteStock);

export default router;
