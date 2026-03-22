/**
 * reset-db.js
 *
 * Drops the entire `urban_ai` database and recreates all collections
 * with the correct indexes so the app works immediately after running this.
 *
 * Usage (from the backend/ directory):
 *   node reset-db.js
 */

import mongoose from "mongoose";
import "dotenv/config";

// ── Models ──────────────────────────────────────────────────────────────────
import User from "./models/User.js";
import Complaint from "./models/Complaint.js";
import Assignment from "./models/Assignment.js";
import Notification from "./models/Notification.js";
import OTP from "./models/OTP.js";

const MONGO_URI =
    process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/urban_ai";

async function resetDatabase() {
    console.log("🔌 Connecting to MongoDB…");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to:", MONGO_URI);

    // ── 1. Drop the whole database ──────────────────────────────────────────
    console.log("\n🗑️  Dropping database 'urban_ai'…");
    await mongoose.connection.dropDatabase();
    console.log("✅ Database dropped.");

    // ── 2. Recreate collections + indexes by syncing schemas ───────────────
    console.log("\n🏗️  Recreating collections and indexes…");

    await User.createCollection();
    await User.syncIndexes();
    console.log("  ✔ users");

    await Complaint.createCollection();
    await Complaint.syncIndexes();
    console.log("  ✔ complaints");

    await Assignment.createCollection();
    await Assignment.syncIndexes();
    console.log("  ✔ assignments");

    await Notification.createCollection();
    await Notification.syncIndexes();
    console.log("  ✔ notifications");

    await OTP.createCollection();
    await OTP.syncIndexes();
    console.log("  ✔ otps  (TTL index: auto-expire after 5 min)");

    // ── 3. Seed a default admin account ────────────────────────────────────
    // Note: The app stores passwords as plain text (see routes/auth.js login).
    console.log("\n🌱 Seeding a default admin user…");
    await User.create({
        name: "System Admin",
        email: "admin@urbanai.com",
        password: "Admin@1234",
        role: "admin",
    });
    console.log("  ✔ Admin user created");
    console.log("    📧  Email   : admin@urbanai.com");
    console.log("    🔑  Password: Admin@1234");
    console.log("    ⚠️  Change this password immediately after first login!\n");

    // ── Done ────────────────────────────────────────────────────────────────
    console.log("🎉 Database reset complete. All collections are fresh.\n");
    await mongoose.disconnect();
    process.exit(0);
}

resetDatabase().catch((err) => {
    console.error("❌ Reset failed:", err);
    process.exit(1);
});
