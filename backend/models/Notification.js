import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    complaint_id: { type: mongoose.Schema.Types.ObjectId, ref: "Complaint", default: null },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    type: { type: String, required: true },
    message: { type: String, required: true },
    is_read: { type: Boolean, default: false }
}, { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } });

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
