import { parseQueryParams, formatPaginatedResponse } from "../utils/apiFeatures.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Expense } from "../models/expense.model.js";

export const getExpense = async (req, res, next) => {
    try {
        const { filter, sort, limit, skip, page } = parseQueryParams(req.query, ["engineerName", "category", "remarks"]);

        const expense = await Expense.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limit);

        const total = await Expense.countDocuments(filter);

        return res.status(200).json(new ApiResponse(200, formatPaginatedResponse(expense, total, page, limit), "success"));
    } catch (error) {
        return res.status(error.statusCode || 500).json(
            new ApiResponse(error.statusCode, null, error.message)
        );
    }
};

export const addExpense = async (req, res, next) => {
    const { engineerName, category, month, period, amount, remarks } = req.body;

    if (!engineerName) {
        return res.status(400).json(new ApiResponse(400, null, "Engineer Name is required"));
    }
    
    try {
        const expense = await Expense.create({
            engineerName,
            category,
            month,
            period,
            amount,
            remarks
        });

        if (!expense) {
            throw new ApiError(404, "Error while adding Expense");
        }
        return res.status(200).json(new ApiResponse(200, expense, "Expense added successfully"));
    } catch (error) {
        return res.status(error.statusCode || 500).json(
            new ApiResponse(error.statusCode, null, error.message)
        );
    }
};
