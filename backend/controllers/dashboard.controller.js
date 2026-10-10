import { Call } from "../models/call.model.js";
import { Engineer } from "../models/engineer.model.js";
import { Stock } from "../models/stock.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const getDashboardStats = async (req, res) => {
    try {
        const totalCalls = await Call.countDocuments();
        const pendingCalls = await Call.countDocuments({ status: "pending" });
        const closedCalls = await Call.countDocuments({ status: "completed" });
        
        const totalEngineers = await Engineer.countDocuments();
        const totalStocks = await Stock.countDocuments();

        return res.status(200).json(
            new ApiResponse(200, {
                totalCalls,
                pendingCalls,
                closedCalls,
                totalEngineers,
                totalStocks
            }, "Dashboard stats retrieved successfully")
        );
    } catch (error) {
        return res.status(500).json(
            new ApiResponse(500, null, error.message || "Error retrieving dashboard stats")
        );
    }
};
