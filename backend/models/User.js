import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["citizen", "admin", "resolver"], default: "citizen" },
    phone: { type: String, default: null },
    gov_id: { type: String, default: null },
    avatar: { type: String, default: null },
    area: { type: String, default: null },
    city: { type: String, default: null },
    state: { type: String, default: null },
    dept_name: { type: String, default: null },
    head_of_dept: { type: String, default: null },
    experience_level: { type: String, default: null },
    position: { type: String, default: null },
    area_expertise: { type: String, default: null },
    activity_status: { type: String, enum: ["Available", "Busy", "On Leave"], default: "Available" }
}, { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } });

const User = mongoose.model("User", userSchema);
export default User;
