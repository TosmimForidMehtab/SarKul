import mongoose, {Schema} from "mongoose";

const stockSchema = new Schema(
    {
        itemName: {
            type: String,
            required: [true, "Item name is required"],
            enum: {
                values:[
                    "printer",
                    "scanner",
                    "desktop",
                    "laptop",
                    "plotter",
                    "server",
                    "activity",
                    "cctv",
                    "UPS",
                    "Mouse",
                    "Keyboard",
                    "PowerSupply",
                    "Motherboard",
                    "HardDisk",
                    "Display",
                    "RAM",
                    "CPUFan",
                    "Processor",
                    "MilerStrip",
                    "PaperPickupRoller",
                    "PhotoSensor",
                    "LogicCard",
                    "PrintHead",
                    "Teflon",
                    "PressureRoller",
                    "Gear",
                    "CarriageBlock",
                    "AllInOne",
                    "Cable",
                    "SSD",
                    "TFT"
                ],
                message: "{VALUE} is not supported..",
            },
        },
        stockId: {
            type: String,
            required: [true, "Stock id is required"],
        },
        itemPart: {
            type: String,
        },
        serialNumber: {
            type: String,
        },
        configuration: {
            type: String,
        },
        modelNumber: {
            type: String,
            required: [true, "Model number is required"],
        },
        amcStartDate: {
            type: Date,
        },
        amcEndDate: {
            type: Date,
        },
        price: {
            type: Number,
            // required: [true, "Price is required"],
        },
        condition: {
            type: String,
            enum: {
                values: ["faulty", "working", "damaged", 'new','repaired'],
                message: "{VALUE} is not supported",
            },
            default: "working",
        },
        status: {
            type: String,
            enum: {
                values: ['available', 'unavailable'],
                message: "{VALUE} is not supported",
            },
            default: 'available',
        },
          officeRepair: {
            type: String,
            enum: {
                values: ['yes', 'no'],
                message: "{VALUE} is not supported",
            },
            default: 'no',
        },
          scrap: {
            type: String,
            enum: {
                values: ['yes', 'no'],
                message: "{VALUE} is not supported",
            },
            default: 'no',
        },
    },
    {timestamps: true}
);

export const Stock = mongoose.model("Stock", stockSchema);

