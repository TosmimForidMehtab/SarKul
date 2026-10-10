import { parseQueryParams, formatPaginatedResponse } from "../utils/apiFeatures.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {MyStocks} from "../models/myStocks.js";


export const getMyStocks = async (req, res, next) => {
    try {
        const myStocks = await MyStocks.aggregate([
            {
                $project: {
                    _id: 0,
                    serialNumber: 1,
                    totalPrice: 1,
                    brand: 1,
                    price: 1,
                    warrantyStart: 1,
                    warrantyEnd: 1,
                    itemName: 1,
                },
            },
            {
                $group: {
                    _id: null,
                    totalStocks: {$sum: 1},
                    totalAmount: {$sum: "$price"},
                    data: {$push: "$$ROOT"},
                },
            }
        ]);

        if (!myStocks) {
            throw new ApiError(404, "Stocks not found");
        }

        return res.status(200).json(new ApiResponse(200, "success", myStocks));
    } catch (error) {
        return res.status(error.statusCode || 500).json(
            new ApiResponse(error.statusCode, null, error.message)
        );
    }
};

export const addMyStocks = async (req, res, next) => {
    const {itemName, serialNumber, brand, price, warrantyStart, warrantyEnd} =
        req.body;

    if (!itemName || !serialNumber || !brand || !price || !warrantyStart || !warrantyEnd) {
        return res.status(400).json(new ApiResponse(400, null, "All fields are required"));
    }
    if (new Date(warrantyStart) > new Date(warrantyEnd)) {
        return res.status(400).json(new ApiResponse(400, null, "Warranty start date cannot be greater than warranty end date"));
    }
    try {
        const myStock = await MyStocks.create({
            itemName,
            serialNumber,
            brand,
            price,
            warrantyStart,
            warrantyEnd
        });

        if (!myStock) {
            throw new ApiError(404, "Error while adding stock");
        }
        return res.status(200).json({
            message: "Stocks added successfully",
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json(
            new ApiResponse(error.statusCode, null, error.message)
        );
    }
};
