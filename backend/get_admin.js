import mongoose from 'mongoose';
import 'dotenv/config';

// Import User model
import './models/User.js'; 

async function findAdmin() {
  try {
    const MONGO_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/urban_ai";
    await mongoose.connect(MONGO_URI);
    
    // Dynamically get the model to avoid compilation issues in evaluated script
    const User = mongoose.model('User');
    const admin = await User.findOne({ role: 'admin' });
    
    if (admin) {
        console.log('---ADMIN_FOUND---');
        console.log(JSON.stringify(admin));
        console.log('---END---');
    } else {
        console.log('No admin found');
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

findAdmin();
