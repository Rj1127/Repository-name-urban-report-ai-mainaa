import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./db.js";

import authRoutes from "./routes/auth.js";
import complaintRoutes from "./routes/complaint.js";
import engineerRoutes from "./routes/engineers.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/engineers", engineerRoutes);

const PORT = process.env.PORT || 5000;

// Connect to MongoDB then start server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
});