import mongoose from "mongoose";

const noticeSchema = new mongoose.Schema({
    engineer_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    admin_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    complaint_id: { type: mongoose.Schema.Types.ObjectId, ref: "Complaint", required: true },
    message: { type: String, required: true },
    reason: { type: String, default: "" }, // Engineer's reply
    responded: { type: Boolean, default: false },
    admin_decision: { type: String, enum: ["Pending", "Accepted", "Rejected"], default: "Pending" },
    admin_notes: { type: String, default: "" },
    suspension_letter: { type: String, default: null },
    created_at: { type: Date, default: Date.now }
});

const Notice = mongoose.model("Notice", noticeSchema);
export default Notice;
