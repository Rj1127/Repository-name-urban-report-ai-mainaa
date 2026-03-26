import mongoose from 'mongoose';
import 'dotenv/config';
import User from './models/User.js';

async function check() {
  try {
    const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/urbanreport";
    await mongoose.connect(MONGO_URI);
    const count = await User.countDocuments({ role: 'resolver' });
    console.log('Resolver count:', count);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
