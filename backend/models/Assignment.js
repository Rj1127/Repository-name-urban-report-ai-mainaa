import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema({
    complaint_id: { type: mongoose.Schema.Types.ObjectId, ref: "Complaint", required: true },
    engineer_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    assigned_at: { type: Date, default: Date.now },
    deadline: { type: Date, required: true },
    status: { type: String, enum: ["Assigned", "In Progress", "Resolved"], default: "Assigned" }
});

const Assignment = mongoose.model("Assignment", assignmentSchema);
export default Assignment;
