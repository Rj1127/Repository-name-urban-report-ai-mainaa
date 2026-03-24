import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema({
    engineer_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reason: { type: String, required: true },
    duration_from: { type: Date, required: true },
    duration_to: { type: Date, required: true },
    proof_document: { type: String, default: null }, 
    status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
    admin_message: { type: String, default: "" },
    approved_at: { type: Date, default: null },
    certificate_pdf: { type: String, default: null },
    certificate_jpg: { type: String, default: null },
}, { timestamps: { createdAt: "submitted_at" } });

const Leave = mongoose.model("Leave", leaveSchema);
export default Leave;
