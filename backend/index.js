import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db.js";
import { userRoutes, callRoutes, engineerRoutes, stockRoutes, transactionRoutes, mystocksRoutes, groupRoutes, expenseRoutes, dashboardRoutes } from "./routes/index.js";

console.log("added latest");

const app = express();
dotenv.config();
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();
const PORT = process.env.PORT;

app.get("/", (req, res) => {
    res.send("Please refer to the .todo file for instructions");
});

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/call", callRoutes);
app.use("/api/v1/engineer", engineerRoutes);
app.use("/api/v1/stock", stockRoutes);
app.use("/api/v1/transaction", transactionRoutes);
app.use("/api/v1/mystocks", mystocksRoutes);
app.use("/api/v1/group", groupRoutes);
app.use("/api/v1/expense", expenseRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);

// Global Error Handler for production readiness
app.use((err, req, res, next) => {
    console.error("Unhandled Error:", err);
    res.status(err.statusCode || 500).json({
        statusCode: err.statusCode || 500,
        success: false,
        message: err.message || "Internal Server Error",
        errors: err.errors || []
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
