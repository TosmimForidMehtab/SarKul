import {ApiResponse} from "../utils/ApiResponse.js";

export const createCallValidation = async (req, res, next) => {
    // const {customerName, customerCode, contactNumber, customerEmail, customerAddress, problemDescription, status, category, itemName, itemModelNumber} = req.body;
    const {customerName, customerCode, contactNumber, customerAddress, problemDescription, status, category, itemName, itemModelNumber} = req.body;

    // if ([customerName, customerCode, contactNumber, customerEmail, customerAddress, problemDescription, category, itemName, itemModelNumber].includes(undefined) || [customerName, customerCode, contactNumber, customerEmail, customerAddress, problemDescription, category, itemName, itemModelNumber].includes(null)) {
    //     return res.status(400).json(new ApiResponse(400, null, "All fields are required"));
    // }
    if ([customerName, customerCode, contactNumber, customerAddress, problemDescription, category, itemName, itemModelNumber].includes(undefined) || [customerName, customerCode, contactNumber, customerAddress, problemDescription, category, itemName, itemModelNumber].includes(null)) {
        return res.status(400).json(new ApiResponse(400, null, "All fields are required"));
    }

    next();
};

export const callIdValidation = async (req, res, next) => {
    const {callId} = req.params;
    if (!callId) {
        return res.status(400).json(new ApiResponse(400, null, "Call id is required"));
    }
    next();
};

export const callAssignValidation = async (req, res, next) => {
    if (!req.body.callId || !req.body.engineerName) {
        return res.status(400).json(new ApiResponse(400, null, "Call id and Engineer Name are required"));
    }
    next();
};

export const callUpdateValidation = async (req, res, next) => {
    if (!req.params.callId) {
        return res.status(400).json(new ApiResponse(400, null, "Call id is required"));
    }
    if (!req.body.customerRemark || !req.body.engineerRemark || !req.body.partStatus) {
        return res.status(400).json(new ApiResponse(400, null, "Customer Remarks, Engineer Remarks and Part Status are required"));
    }
    next();
};