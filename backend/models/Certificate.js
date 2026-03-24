import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema({
    engineer_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    leave_id: { type: mongoose.Schema.Types.ObjectId, ref: "Leave", required: true },
    certificate_id: { type: String, unique: true, required: true },
    file_url: { type: String, required: true }, 
    generated_at: { type: Date, default: Date.now }
});

const Certificate = mongoose.model("Certificate", certificateSchema);
export default Certificate;
