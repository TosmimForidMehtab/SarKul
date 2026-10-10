import { parseQueryParams, formatPaginatedResponse } from "../utils/apiFeatures.js";
import { Engineer } from "../models/engineer.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { generateEngineerId } from "../utils/idGenerator.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

export const createEngineer = async (req, res) => {
    try {
        const {
            employeeName,
            employeeDOB,
            employeeAddress,
            employeeEmail,
            employeeDesignation,
            employeeContact,
            joinDate,
            qualification,
            reference,
            salary,
            skills,
            experience,
        } = req.body;
        if (employeeDOB > joinDate) {
            throw new ApiError(
                400,
                "Employee DOB cannot be greater than Join date"
            );
        }
        const idProofLocalPath = req.files?.idProof?.[0]?.path;
        const certificateLocalPath = req.files?.certificate?.[0]?.path;

        if (!idProofLocalPath) {
            throw new ApiError(400, "Id Proof is required");
        }
        if (!certificateLocalPath) {
            throw new ApiError(400, "Qualification is required");
        }
        const idProofUrl = await uploadOnCloudinary(idProofLocalPath);
        const certificateUrl = await uploadOnCloudinary(certificateLocalPath);
        if (!idProofUrl) {
            throw new ApiError(500, "Failed to upload id proof");
        }
        if (!certificateUrl) {
            throw new ApiError(500, "Failed to upload qualification");
        }
        // console.log(idProofUrl, certificateUrl);
        const engineer = await Engineer.create({
            employeeName,
            employeeDOB,
            employeeAddress,
            employeeEmail,
            employeeDesignation,
            employeeContact,
            joinDate,
            qualification,
            reference,
            salary,
            skills,
            experience,
            idProof: idProofUrl,
            certificate: certificateUrl,
        });
        if (!engineer) {
            throw new ApiError(500, "Failed to create engineer");
        }
        engineer.employeeCode = generateEngineerId();
        await engineer.save();
        return res
            .status(200)
            .json(
                new ApiResponse(201, engineer, "Engineer created successfully")
            );
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(
                new ApiResponse(
                    error.statusCode,
                    null,
                    error.message ||
                    "Something went wrong while creating engineer"
                )
            );
    }
};

export const updateEngineer = async (req, res) => {
    try {
        const { status, resignedAt, incrementDueDate, remarks, increementAmount, revisedDesignation, revisedSalary } = req.body;
        const engineer = await Engineer.findOne({
            employeeCode: req.params.employeeCode,
        });
        if (!engineer) {
            throw new ApiError(404, "Engineer not found");
        }
        if (resignedAt) {
            if (engineer.joinDate > resignedAt) {
                throw new ApiError(
                    400,
                    "Engineer cannot be resigned before joining. Please check join date and resigned date"
                );
            }
            engineer.resignedAt = resignedAt;
        }
        if (status) {
            engineer.status = status;
        }
        if (incrementDueDate) {
            engineer.incrementDueDate = incrementDueDate;
        }
        if (remarks) {
            engineer.remarks = remarks;
        }
        if (revisedSalary) {
            engineer.salary = revisedSalary;
        }
        if (revisedDesignation) {
            engineer.employeeDesignation = revisedDesignation;
        }
        if (increementAmount) {
            engineer.increementAmount = increementAmount;
        }
        await engineer.save();
        return res
            .status(200)
            .json(
                new ApiResponse(200, engineer, "Engineer updated successfully")
            );
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(
                new ApiResponse(
                    error.statusCode,
                    null,
                    error.message ||
                    "Something went wrong while updating engineer"
                )
            );
    }
};

export const getEngineer = async (req, res) => {
    try {
        const engineer = await Engineer.findOne({
            employeeCode: req.params.employeeCode,
        }).lean();

        if (!engineer) {
            throw new ApiError(404, "Engineer not found");
        }

        // Get all keys defined in schema
        const schemaKeys = Object.keys(Engineer.schema.paths).filter(
            (key) => !["__v", "_id"].includes(key)
        );

        // Normalize: include all schema keys with default `null` if missing
        const completeEngineer = {};

        schemaKeys.forEach((key) => {
            completeEngineer[key] = engineer[key] ?? null;
        });

        // Include _id separately if needed
        completeEngineer["_id"] = engineer["_id"];

        return res.status(200).json(
            new ApiResponse(200, completeEngineer, "Engineer retrieved successfully")
        );

    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(
                new ApiResponse(
                    error.statusCode,
                    null,
                    error.message ||
                    "Something went wrong while retrieving engineer"
                )
            );
    }
};

export const getAllEngineers = async (req, res) => {
    try {
        const { filter, sort, page, limit, skip } = parseQueryParams(req.query, ["employeeName", "employeeCode", "employeeContact", "employeeEmail"]);
        
        const total = await Engineer.countDocuments(filter);
        
        const engineers = await Engineer.aggregate([
            {
                $match: filter,
            },
            { $sort: sort },
            { $skip: skip },
            { $limit: limit },
        ]);
        
        const result = formatPaginatedResponse(engineers, total, page, limit);
        return res.status(200).json(new ApiResponse(200, result, "Engineers retrieved successfully"));
    } catch (error) {
        return res.status(error.statusCode || 500).json(new ApiResponse(error.statusCode, null, error.message || "Something went wrong while retrieving Engineers"));
    }
};
export const lookupEngineers = async (req, res) => {
    try {
        const query = req.query.q || "";
        const limit = parseInt(req.query.limit, 10) || 10;
        const engineers = await Engineer.find({
            $or: [
                { employeeName: { $regex: query, $options: "i" } },
                { employeeCode: { $regex: query, $options: "i" } }
            ]
        }).select("employeeName employeeCode").limit(limit);
        return res.status(200).json(new ApiResponse(200, engineers, "Lookup successful"));
    } catch (error) {
        return res.status(error.statusCode || 500).json(new ApiResponse(error.statusCode, null, error.message));
    }
};
