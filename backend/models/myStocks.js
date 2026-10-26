import mongoose, {Schema} from "mongoose";

const myStocksSchema = new Schema({
    itemName: {
        type: String,
    },
    serialNumber: {
        type: String,
    },
    brand: {
        type: String,
    },
    price: {
        type: Number,
    },
    warrantyStart: {
        type: Date,
    },
    warrantyEnd: {
        type: Date,
    },
}, { timestamps: true });

export const MyStocks = mongoose.model("MyStocks", myStocksSchema);
