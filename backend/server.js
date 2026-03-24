import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./db.js";

import authRoutes from "./routes/auth.js";
import complaintRoutes from "./routes/complaint.js";
import engineerRoutes from "./routes/engineers.js";
import leaveRoutes from "./routes/leave.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/engineers", engineerRoutes);
app.use("/api/leave", leaveRoutes);

// Static files for documents
app.use("/documents", express.static(path.join(__dirname, "public/documents")));

const PORT = process.env.PORT || 5000;

// Connect to MongoDB then start server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
});