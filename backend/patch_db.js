import mongoose from "mongoose";
import connectDB from "./db.js";
import User from "./models/User.js";
import Complaint from "./models/Complaint.js";

// Auto-heal missing data defaults for old rows
const patch = async () => {
    await connectDB();

    const userResult = await User.updateMany(
        { activity_status: { $in: [null, ""] } },
        { $set: { activity_status: "Available" } }
    );
    console.log(`Fixed ${userResult.modifiedCount} user activity statuses`);

    const complaintResult = await Complaint.updateMany(
        { $or: [{ status: null }, { status: "" }] },
        { $set: { status: "New" } }
    );
    console.log(`Fixed ${complaintResult.modifiedCount} complaint statuses`);

    await mongoose.disconnect();
    process.exit(0);
};

patch();
