import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import {connectDB} from "./config/db.js";
import userRoutes from "./routes/user.routes.js";

const app = express();
dotenv.config();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

connectDB();
const PORT = process.env.PORT;

app.get("/", (req, res) => {
    res.send("Please refer to the .todo file for instructions");
});

app.use("/api/v1/user", userRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});