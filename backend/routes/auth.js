import express from "express";
import User from "../models/User.js";
import OTP from "../models/OTP.js";
import { sendOTP } from "../utils/mailer.js";

const router = express.Router();

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// REGISTER
router.post("/register", async (req, res) => {
    try {
        const {
            name, email, password, role,
            phone, gov_id_type, gov_id_number, area, district, state, pincode,
            dept_name, head_of_dept, experience_level,
            position, area_expertise, otp
        } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists with this email" });

        if (!otp) {
            // Generate and send OTP
            const code = generateOTP();
            await OTP.findOneAndUpdate({ email }, { otp: code }, { upsert: true, new: true, setDefaultsOnInsert: true });

            const emailSent = await sendOTP(email, code);
            if (!emailSent) {
                return res.status(500).json({ message: "Failed to send OTP email. Please ensure your Google App Password is correct." });
            }
            return res.json({ requireOtp: true, message: "OTP sent to your email for verification. Code expires in 5 minutes." });
        }

        // Verify OTP
        const otpRecord = await OTP.findOne({ email });
        if (!otpRecord) return res.status(400).json({ message: "OTP expired or missing. Please request a new one." });
        if (otpRecord.otp !== otp) return res.status(401).json({ message: "Invalid OTP code." });

        // OTP Valid! Create the user.
        const user = await User.create({
            name, email, password, role,
            phone: phone || null,
            gov_id_type: gov_id_type || null,
            gov_id_number: gov_id_number || null,
            area: area || null,
            district: district || null,
            state: state || null,
            pincode: pincode || null,
            dept_name: dept_name || null,
            head_of_dept: head_of_dept || null,
            experience_level: experience_level || null,
            position: position || null,
            area_expertise: area_expertise || null
        });

        // Delete the consumed OTP
        await OTP.deleteOne({ email });

        res.json({ message: "User registered successfully", id: user._id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// LOGIN
router.post("/login", async (req, res) => {
    try {
        const { email, password, otp } = req.body;

        const user = await User.findOne({ email, password });
        if (!user) return res.status(401).json({ message: "Invalid email or password" });

        if (!otp) {
            // Generate and send OTP
            const code = generateOTP();
            await OTP.findOneAndUpdate({ email }, { otp: code }, { upsert: true, new: true, setDefaultsOnInsert: true });

            const emailSent = await sendOTP(email, code);
            if (!emailSent) {
                return res.status(500).json({ message: "Failed to send OTP email. Please ensure your Google App Password is correct." });
            }
            return res.json({ requireOtp: true, message: "OTP sent to your email for 2-Step Verification. Code expires in 5 minutes." });
        }

        // Verify OTP
        const otpRecord = await OTP.findOne({ email });
        if (!otpRecord) return res.status(400).json({ message: "OTP expired or missing. Please request a new one." });
        if (otpRecord.otp !== otp) return res.status(401).json({ message: "Invalid OTP code." });

        // OTP Valid! Delete consumed OTP and authenticate user.
        await OTP.deleteOne({ email });

        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;