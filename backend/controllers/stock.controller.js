import { parseQueryParams, formatPaginatedResponse } from "../utils/apiFeatures.js";
import { Stock } from "../models/stock.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { generateStockId } from "../utils/idGenerator.js";

export const createStock = async (req, res) => {
    try {
        const {
            itemName,
            quantity,
            itemPart,
            serialNumber,
            configuration,
            modelNumber,
            amcStartDate,
            amcEndDate,
            price,
            condition,
            officeRepair,
            status,
            scrap
        } = req.body;
        if (amcStartDate > amcEndDate) {
            throw new ApiError(
                400,
                "AMC start date cannot be greater than AMC end date"
            );
        }
        const stockId = generateStockId();
        const existingStock = await Stock.findOne({ stockId });
        if (existingStock) {
            throw new ApiError(400, `Stock with id ${stockId} already exists`);
        }
        const stock = await Stock.create({
            itemName,
            quantity,
            itemPart,
            serialNumber,
            configuration,
            modelNumber,
            amcStartDate,
            amcEndDate,
            price,
            stockId,
            condition,
            officeRepair,
            status,
            scrap
        });
        if (!stock) {
            throw new ApiError(500, "Failed to create stock");
        }
        return res
            .status(201)
            .json(new ApiResponse(201, stock, "Stock created successfully"));
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(
                new ApiResponse(
                    error.statusCode,
                    null,
                    error.message || "Something went wrong while creating stock"
                )
            );
    }
};

export const updateStock = async (req, res) => {
    try {
        const {
            itemName,
            quantity,
            itemPart,
            serialNumber,
            configuration,
            modelNumber,
            amcStartDate,
            amcEndDate,
            price,
            condition,
            officeRepair,
            status,
            scrap
        } = req.body;
        const stock = await Stock.findOne({ stockId: req.params.stockId });
        if (!stock) {
            throw new ApiError(404, "Stock not found");
        }
        if (itemName) {
            stock.itemName = itemName;
        }
        if (quantity) {
            stock.quantity = quantity;
        }
        if (itemPart) {
            stock.itemPart = itemPart;
        }
        if (serialNumber) {
            stock.serialNumber = serialNumber;
        }
        if (configuration) {
            stock.configuration = configuration;
        }
        if (modelNumber) {
            stock.modelNumber = modelNumber;
        }
        if (amcStartDate) {
            stock.amcStartDate = amcStartDate;
        }
        if (amcEndDate) {
            stock.amcEndDate = amcEndDate;
        }
        if (amcStartDate > amcEndDate) {
            throw new ApiError(
                400,
                "AMC start date cannot be greater than AMC end date"
            );
        }
        if (price) {
            stock.price = price;
        }
        if (officeRepair) {
            stock.officeRepair = officeRepair;
        }
        if (status) {
            stock.status = status;
        }
        if (scrap) {
            stock.scrap = scrap;
        }
        if (condition) {
            stock.condition = condition;
        }
        await stock.save();
        return res
            .status(200)
            .json(new ApiResponse(200, stock, "Stock updated successfully"));
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(
                new ApiResponse(
                    error.statusCode,
                    null,
                    error.message || "Something went wrong while updating stock"
                )
            );
    }
};

export const getStock = async (req, res) => {
    try {
        const stock = await Stock.findOne({ stockId: req.params.stockId });
        if (!stock) {
            throw new ApiError(404, "Stock not found");
        }
        return res
            .status(200)
            .json(new ApiResponse(200, stock, "Stock retrieved successfully"));
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(
                new ApiResponse(
                    error.statusCode,
                    null,
                    error.message ||
                    "Something went wrong while retrieving stock"
                )
            );
    }
};

export const getAllStocks = async (req, res) => {
    try {
        const { filter, sort, page, limit, skip } = parseQueryParams(req.query, ["stockId", "itemName", "itemPart", "serialNumber", "customerName", "category"]);
        
        const total = await Stock.countDocuments(filter);
        
        const stocks = await Stock.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .select("-_id stockId itemName itemPart serialNumber configuration modelNumber amcStartDate amcEndDate price condition status officeRepair scrap createdAt");
        
        const result = formatPaginatedResponse(stocks, total, page, limit);
        return res.status(200).json(new ApiResponse(200, result, "Stocks retrieved successfully"));
    } catch (error) {
        return res.status(error.statusCode || 500).json(new ApiResponse(error.statusCode, null, error.message || "Something went wrong while retrieving Stocks"));
    }
};

export const deleteStock = async (req, res) => {
    try {
        const stock = await Stock.findOneAndDelete({
            stockId: req.params.stockId,
        });
        if (!stock) {
            throw new ApiError(404, "Stock not found");
        }
        return res
            .status(200)
            .json(new ApiResponse(200, null, "Stock deleted successfully"));
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(
                new ApiResponse(
                    error.statusCode,
                    null,
                    error.message || "Something went wrong while deleting stock"
                )
            );
    }
};
export const lookupStocks = async (req, res) => {
    try {
        const query = req.query.q || "";
        const limit = parseInt(req.query.limit, 10) || 10;
        const stocks = await Stock.find({
            $or: [
                { stockId: { $regex: query, $options: "i" } },
                { itemName: { $regex: query, $options: "i" } },
                { serialNumber: { $regex: query, $options: "i" } }
            ]
        }).select("stockId itemName serialNumber category").limit(limit);
        return res.status(200).json(new ApiResponse(200, stocks, "Lookup successful"));
    } catch (error) {
        return res.status(error.statusCode || 500).json(new ApiResponse(error.statusCode, null, error.message));
    }
};

