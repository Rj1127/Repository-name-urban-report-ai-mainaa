import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['citizen', 'admin', 'resolver'], default: 'citizen' },
    dept_name: { type: String, default: null },
    phone: { type: String, default: null },
    state: { type: String, default: null },
    city: { type: String, default: null },
    area: { type: String, default: null },
    gov_id: { type: String, default: null },
    experience_level: { type: String, default: null },
    area_expertise: { type: String, default: null },
    created_at: { type: Date, default: Date.now },
    activity_status: { type: String, enum: ['Available', 'Busy', 'On Leave'], default: 'Available' },
    is_suspended: { type: Boolean, default: false },
    suspension_until: { type: Date, default: null },
    suspension_letter: { type: String, default: null }
});

export default mongoose.model("User", userSchema);
