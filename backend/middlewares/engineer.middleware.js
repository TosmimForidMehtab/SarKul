import { ApiResponse } from "../utils/ApiResponse.js";

export const createEngineerValidation = async (req, res, next) => {
    const {
        employeeName,
        employeeDOB,
        employeeAddress,
        employeeDesignation,
        employeeContact,
        joinDate,
        qualification,
        salary,
        employeeEmail,
    } = req.body;

    if (
        !employeeName ||
        !employeeDOB ||
        !employeeAddress ||
        !employeeDesignation ||
        !employeeContact ||
        !joinDate ||
        !qualification ||
        !salary ||
        !employeeEmail
    ) {
        return res
            .status(400)
            .json(new ApiResponse(400, null, "All fields are required"));
    }
    next();
};

export const updateEngineerValidation = async (req, res, next) => {
    if (!req.params.employeeCode) {
        return res
            .status(400)
            .json(new ApiResponse(400, null, "Employee code is required"));
    }
    if (
        !(
            req.body.status ||
            req.body.resignedAt ||
            req.body.incrementDueDate ||
            req.body.remarks||
            req.body.revisedSalary||
            req.body.revisedDesignation||
            req.body.increementAmount
        )
    ) {
        return res
            .status(400)
            .json(new ApiResponse(400, null, "Atleast one field is required"));
    }
    next();
};

export const getEngineerValidation = async (req, res, next) => {
    if (!(req.params.employeeCode || req.query.q)) {
        return res
            .status(400)
            .json(
                new ApiResponse(400, null, "Employee code or name is required")
            );
    }
    next();
};
