import mongoose, { Schema } from "mongoose";
import validator from "validator";

const callSchema = new Schema(
    {
        callId: {
            type: String,
            unique: [true, "Call ID must be unique"],
            index: true,
        },
        serialNumber: {
            type: String,
        },
        customerName: {
            type: String,
            required: [true, "Customer name is required"],
        },
        userName: {
            type: String,
        },
        customerCode: {
            type: String,
            required: [true, "Customer code is required"],
        },
        contactNumber: {
            type: String,
            required: [true, "Contact number is required"],
            validate: [validator.isMobilePhone, "Invalid mobile number"],
        },
        customerEmail: {
            type: String,
            // required: [true, "Customer email is required"],
            // validate: [validator.isEmail, "Invalid email"],
        },
        customerAddress: {
            type: String,
            required: [true, "Customer address is required"],
        },
        problemDescription: {
            type: String,
            required: [true, "Problem description is required"],
        },
        status: {
            type: String,
            enum: ["pending", "completed"],
            default: "pending",
        },
        category: {
            type: String,
            required: [true, "Category is required"],
            enum: {
                values: [
                    "desktop",
                    "laptop",
                    "printer",
                    "plotter",
                    "scanner",
                    "server",
                    'UPS',
                    'cctv',
                    "activity",
                ],
                message: "Invalid category",
            },
        },
        itemName: {
            type: String,
            required: [true, "Item name is required"],
        },
        itemModelNumber: {
            type: String,
        },
        engineerName: {
            type: String,
        },
        engineersAssigned: [
            {
                type: Schema.Types.ObjectId,
                ref: "Engineer",
            },
        ],
        closedAt: {
            type: Date,
        },
        customerRemark: {
            type: String,
        },
        engineerRemark: {
            type: String,
        },
        itemStatus: {
            type: String,
            enum: ["required", "pending",'replace','chargeable','serviceAndClose','cancelAndClose','customerDependence','oemPending'],
        },
    },
    { timestamps: true }
);

export const Call = mongoose.model("Call", callSchema);
