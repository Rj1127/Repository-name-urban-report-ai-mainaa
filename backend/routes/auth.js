import express from "express";
import User from "../models/User.js";

const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
    try {
        const {
            name, email, password, role,
            phone, gov_id, area, city, state,
            dept_name, head_of_dept, experience_level,
            position, area_expertise
        } = req.body;

        const user = await User.create({
            name, email, password, role,
            phone: phone || null,
            gov_id: gov_id || null,
            area: area || null,
            city: city || null,
            state: state || null,
            dept_name: dept_name || null,
            head_of_dept: head_of_dept || null,
            experience_level: experience_level || null,
            position: position || null,
            area_expertise: area_expertise || null
        });

        res.json({ message: "User registered successfully", id: user._id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// LOGIN
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email, password });
        if (!user) return res.status(401).json({ message: "Invalid credentials" });

        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;