import { parseQueryParams, formatPaginatedResponse } from "../utils/apiFeatures.js";
import { Transaction } from "../models/transaction.model.js";
import { Stock } from "../models/stock.model.js";
import { Call } from "../models/call.model.js";
import { Engineer } from "../models/engineer.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

export const createTransaction = async (req, res) => {
    try {
        const {
            callId,
            engineerName,
            itemName,
            dispatchMode,
            modelNumber,
            serialNumber,
            stockId,
            category,
            partStatus,
            partName,
        } = req.body;
        const call = await Call.findOne({ callId });
        if (!call) {
            throw new ApiError(404, `Call with id ${callId} not found`);
        }
        const engineer = await Engineer.findOne({ employeeName: engineerName });
        if (!engineer) {
            throw new ApiError(
                404,
                `Engineer with name ${engineerName} not found`
            );
        }
        if (category === "b2e") {
            const stock = await Stock.findOne({ stockId });
            if (!stock) {
                throw new ApiError(404, `Stock with id ${stockId} not found`);
            }


            if (serialNumber) {
                if (stock.serialNumber !== serialNumber) {
                    throw new ApiError(
                        400,
                        "Serial number does not match with stock serial number"
                    );
                }
            }
        }
        if (category === "e2b") {
            const stock = await Stock.findOne({ stockId });
            if (stock) {

                if (stock.status == 'available') {
                    throw new ApiError(
                        400,
                        `Stock with id ${stockId} already available at your stock`
                    );
                }

            }
        }
        const transaction = await Transaction.create({
            callId,
            engineerName,
            itemName,
            dispatchMode,
            modelNumber,
            serialNumber,
            stockId,
            category,
            partStatus,
            partName,
        });

        if (!transaction) {
            throw new ApiError(
                500,
                "Something went wrong while creating transaction"
            );
        }

        if (transaction.category === "b2e") {
            const stock = await Stock.findOne({ stockId });
            stock.status = "unavailable";
            await stock.save();
        }

        else if (transaction.category === "e2b") {

            const stock = await Stock.findOne({ stockId });

            if (stock) {
                stock.officeRepair = 'yes';
                await stock.save();
            }
            else {
                return res
                    .status(210)
                    .json(
                        new ApiResponse(
                            210,
                            transaction,
                            "Field required"
                        )
                    )
            }

        }
        return res
            .status(201)
            .json(
                new ApiResponse(
                    201,
                    transaction,
                    "Transaction created successfully"
                )
            );
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(
                new ApiResponse(
                    error.statusCode,
                    null,
                    error.message ||
                    "Something went wrong while creating transaction"
                )
            );
    }
};

export const getTransactions = async (req, res) => {
    try {
        const { filter, sort, limit, skip, page } = parseQueryParams(req.query, ["callId", "engineerName", "stockId", "serialNumber", "modelNumber"]);

        const transactions = await Transaction.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limit);
            
        const total = await Transaction.countDocuments(filter);

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    formatPaginatedResponse(transactions, total, page, limit),
                    "Transactions retrieved successfully"
                )
            );
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(
                new ApiResponse(
                    error.statusCode,
                    null,
                    error.message ||
                    "Something went wrong while retrieving transactions"
                )
            );
    }
};

export const getTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.find({
            callId: req.params.callId,
        });
        if (!transaction) {
            throw new ApiError(404, "Transaction not found");
        }
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    transaction,
                    "Transaction retrieved successfully"
                )
            );
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(
                new ApiResponse(
                    error.statusCode,
                    null,
                    error.message ||
                    "Something went wrong while retrieving transaction"
                )
            );
    }
};
