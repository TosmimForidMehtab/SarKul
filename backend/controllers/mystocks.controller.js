import { parseQueryParams, formatPaginatedResponse } from "../utils/apiFeatures.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {MyStocks} from "../models/myStocks.js";


export const getMyStocks = async (req, res, next) => {
    try {
        const { filter, sort, limit, skip, page } = parseQueryParams(req.query, ["itemName", "serialNumber", "brand"]);

        const myStocks = await MyStocks.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .select("-_id serialNumber totalPrice brand price warrantyStart warrantyEnd itemName");

        const total = await MyStocks.countDocuments(filter);

        return res.status(200).json(new ApiResponse(200, formatPaginatedResponse(myStocks, total, page, limit), "Stocks retrieved successfully"));
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
