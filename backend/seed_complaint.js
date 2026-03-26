import mongoose from 'mongoose';
import 'dotenv/config';
import Complaint from './models/Complaint.js';

async function seed() {
  try {
    const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/urbanreport";
    await mongoose.connect(MONGO_URI);
    
    const complaint = {
        user_id: new mongoose.Types.ObjectId(),
        issue_type: "Drainage",
        description: "Severe overflow and blockage near main junction.",
        address: "Karamtarn, Ward 12",
        latitude: 23.341,
        longitude: 85.321,
        severity: "High",
        status: "New",
        reference_number: "REF-" + Math.random().toString(36).substring(7).toUpperCase(),
        created_at: new Date()
    };

    await Complaint.create(complaint);
    console.log('Complaint seeded successfully.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
