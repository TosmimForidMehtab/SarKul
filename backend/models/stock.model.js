import mongoose, {Schema} from "mongoose";

const stockSchema = new Schema({
    itemName: {
        type: String,
        required: [true, "Item name is required"],
        enum: {
            values: ["printer", "scanner", "desktop", "laptop", "plotter", "server"],
            message: "{VALUE} is not supported",
        }
    },
    stockId: {
        type: String,
        required: [true, "Stock id is required"],
    },
    itemPart: {
        type: String
    },
    serialNumber: {
        type: String
    },
    configuration: {
        type: String
    },
    modelNumber: {
        type: String,
        required: [true, "Model number is required"],
    },
    amcStartDate: {
        type: Date,
        required: [true, "AMC start date is required"],
    },
    amcEndDate: {
        type: Date,
        required: [true, "AMC end date is required"],
    },
    price: {
        type: Number,
        required: [true, "Price is required"],
    },
    condition: {
        type: String,
        enum: {
            values: ["faulty", "working"],
            message: "{VALUE} is not supported",
        },
        default: "working"
    }

}, {timestamps: true});

export const Stock = mongoose.model("Stock", stockSchema); 