import express from "express";
import {
    createEngineer,
    getEngineer,
    getAllEngineers,
    updateEngineer, lookupEngineers,
} from "../controllers/engineer.controller.js";
import {
    createEngineerValidation,
    getEngineerValidation,
    updateEngineerValidation,
} from "../middlewares/engineer.middleware.js";
import { verifyToken, isAdmin } from "../middlewares/auth.middlewares.js";
import { upload } from "../middlewares/multer.js";

const router = express.Router();

router.post(
    "/",
    verifyToken,
    isAdmin,
    upload.fields([
        { name: "idProof", maxCount: 1 },
        { name: "certificate", maxCount: 1 },
    ]),
    createEngineerValidation,
    createEngineer
);
router.get("/lookup", verifyToken, isAdmin, lookupEngineers);
router.get("/", verifyToken, isAdmin, getAllEngineers);
router.get(
    "/:employeeCode",
    verifyToken,
    isAdmin,
    getEngineerValidation,
    getEngineer
);
router.patch(
    "/:employeeCode",
    verifyToken,
    isAdmin,
    updateEngineerValidation,
    updateEngineer
);

export default router;

