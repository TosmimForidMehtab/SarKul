import express from "express";
import {
    createCall,
    getAllCalls,
    getCallById,
    updateCall,
    deleteCall,
    getPendingCalls,
    getCompletedCalls,
    assignCallToEngineer,
    closeCall, lookupCalls,
} from "../controllers/call.controller.js";
import {
    createCallValidation,
    callIdValidation,
    callAssignValidation,
    callUpdateValidation,
} from "../middlewares/call.middlewares.js";
import { verifyToken } from "../middlewares/auth.middlewares.js";
const router = express.Router();

router.get("/lookup", verifyToken, lookupCalls);
router.get("/closed", verifyToken, getCompletedCalls);
router.get("/pending", verifyToken, getPendingCalls);
router.post("/close/:callId", verifyToken, callIdValidation, closeCall);
router
    .route("/")
    .get(verifyToken, getAllCalls)
    .post(verifyToken, createCallValidation, createCall);
router
    .route("/:callId")
    .get(verifyToken, callIdValidation, getCallById)
    .patch(verifyToken, callUpdateValidation, updateCall)
    .delete(verifyToken, callIdValidation, deleteCall);
router.post("/assign", verifyToken, callAssignValidation, assignCallToEngineer);

export default router;

