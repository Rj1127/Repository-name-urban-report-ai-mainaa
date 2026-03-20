import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    issue_type: { type: String, required: true },
    description: { type: String, default: null },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    address: { type: String, default: null },
    severity: { type: String, enum: ["Low", "Medium", "High"], default: null },
    predicted_days: { type: Number, default: null },
    reference_number: { type: String, unique: true, default: null },
    status: { type: String, enum: ["New", "Forwarded", "Assigned", "In Progress", "Resolved", "Closed"], default: "New" },
    before_image: { type: String, default: null },
    after_image: { type: String, default: null },
    citizen_satisfied: { type: Boolean, default: null }
}, { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } });

const Complaint = mongoose.model("Complaint", complaintSchema);
export default Complaint;
