import { parseQueryParams, formatPaginatedResponse } from "../utils/apiFeatures.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
// import {MyStocks} from "../models/myStocks.js";
import { Expense } from "../models/expense.model.js";


export const getExpense = async (req, res, next) => {
    try {
        const expense = await Expense.aggregate([
            {
                $project: {
                    _id: 0,
                    engineerName: 1,
                    category: 1,
                    month: 1,
                    period: 1,
                    amount: 1,
                    remarks: 1
                }
            },
            {
                $group: {
                    _id: null,
                    totalGroup: { $sum: 1 },
                    data: { $push: "$$ROOT" }
                }
            }
        ]);

        if (!expense) {
            throw new ApiError(404, "Expense not found");
        }

        return res.status(200).json(new ApiResponse(200, expense, "success",));
    } catch (error) {
        return res.status(error.statusCode || 500).json(
            new ApiResponse(error.statusCode, null, error.message)
        );
    }
};

export const addExpense = async (req, res, next) => {
    const { engineerName,category,month,period,amount,remarks } = req.body;

    if (!engineerName) {
        return res.status(400).json(new ApiResponse(400, null, "Entry is required"));
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
        return res.status(200).json({
            message: "Expense added successfully",
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json(
            new ApiResponse(error.statusCode, null, error.message)
        );
    }
};
