import mongoose from 'mongoose';
import 'dotenv/config';
import User from './models/User.js';

async function seed() {
  try {
    const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/urbanreport";
    await mongoose.connect(MONGO_URI);
    
    const resolvers = [
      {
        name: "Ravi Kumar",
        email: "ravi@smartnagar.gov.in",
        password: "hashedpassword",
        role: "resolver",
        dept_name: "Roads & Highways",
        phone: "9876543210",
        activity_status: "Available",
        experience_level: "Senior",
      },
      {
        name: "Suresh Singh",
        email: "suresh@smartnagar.gov.in",
        password: "hashedpassword",
        role: "resolver",
        dept_name: "Sanitation",
        phone: "9876543211",
        activity_status: "Busy",
        experience_level: "Intermediate",
      },
      {
        name: "Amit Sharma",
        email: "amit@smartnagar.gov.in",
        password: "hashedpassword",
        role: "resolver",
        dept_name: "Water Supply",
        phone: "9876543212",
        activity_status: "Available",
        experience_level: "Junior",
      }
    ];

    for (const res of resolvers) {
      const exists = await User.findOne({ email: res.email });
      if (!exists) {
        await User.create(res);
        console.log(`Created resolver: ${res.name}`);
      }
    }

    console.log('Seeding complete.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
