import express from "express";
import User from "../models/User.js";
import Complaint from "../models/Complaint.js";
import Assignment from "../models/Assignment.js";
import Notification from "../models/Notification.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const router = express.Router();

// HELPER: Generate random reference number
const generateRefNum = () => 'URB-' + Math.random().toString(36).substr(2, 6).toUpperCase();

// HELPER: Simulate AI Severity and Prediction
const predictSeverity = (issueType) => {
    if (['pothole', 'structural_damage', 'waterlogging'].includes(issueType)) {
        return { severity: 'High', predicted_days: 2 };
    }
    if (['garbage', 'broken_streetlight'].includes(issueType)) {
        return { severity: 'Medium', predicted_days: 1 };
    }
    return { severity: 'Low', predicted_days: 3 };
};

// SUBMIT COMPLAINT
router.post("/", async (req, res) => {
    try {
        const { user_email, issue_type, description, latitude, longitude, address, image_url } = req.body;

        // Lookup user by email
        const user = await User.findOne({ email: user_email });
        if (!user) return res.status(400).json({ error: "User not found" });

        const refNum = generateRefNum();
        const ai = predictSeverity(issue_type);

        const complaint = await Complaint.create({
            user_id: user._id,
            issue_type,
            description,
            latitude: latitude || null,
            longitude: longitude || null,
            address: address || null,
            before_image: image_url || null,
            severity: ai.severity,
            predicted_days: ai.predicted_days,
            reference_number: refNum,
            status: "New"
        });

        res.json({
            message: "Complaint submitted",
            ref: refNum,
            severity: ai.severity,
            predicted_days: ai.predicted_days
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET COMPLAINTS
// Optionally filter by user_id or engineer_id
router.get("/", async (req, res) => {
    try {
        let complaints;

        if (req.query.user_id) {
            complaints = await Complaint.find({ user_id: req.query.user_id })
                .populate("user_id", "name")
                .sort({ created_at: -1 });
        } else if (req.query.engineer_id) {
            // Find complaints assigned to this engineer
            const assignments = await Assignment.find({ engineer_id: req.query.engineer_id });
            const complaintIds = assignments.map(a => a.complaint_id);
            complaints = await Complaint.find({ _id: { $in: complaintIds } })
                .populate("user_id", "name")
                .sort({ created_at: -1 });
        } else {
            complaints = await Complaint.find()
                .populate("user_id", "name")
                .sort({ created_at: -1 });
        }

        // Map populated user name to citizen_name for frontend compatibility
        const result = complaints.map(c => {
            const obj = c.toObject();
            obj.id = obj._id;
            obj.citizen_name = obj.user_id?.name || null;
            return obj;
        });

        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ASSIGN COMPLAINT TO ENGINEER
router.post("/assign", async (req, res) => {
    try {
        const { complaint_id, engineer_id } = req.body;

        await Assignment.create({
            complaint_id,
            engineer_id,
            status: "Assigned"
        });

        await Complaint.findByIdAndUpdate(complaint_id, { status: "Forwarded" });
        await User.findByIdAndUpdate(engineer_id, { activity_status: "Busy" });

        res.json({ message: "Engineer assigned successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// RESOLVE COMPLAINT (Engineer uploads after-image)
router.post("/resolve", async (req, res) => {
    try {
        const { complaint_id, after_image, engineer_id } = req.body;

        // Simulate Fake Validator
        const complaint = await Complaint.findById(complaint_id);
        if (!complaint) return res.status(404).json({ error: "Complaint not found" });

        if (complaint.before_image === after_image && complaint.before_image) {
            return res.status(400).json({ error: "AI Warning: Uploaded image appears identical to the Before image." });
        }

        await Complaint.findByIdAndUpdate(complaint_id, { status: "Resolved", after_image });
        await Assignment.updateMany({ complaint_id }, { status: "Resolved" });
        await User.findByIdAndUpdate(engineer_id, { activity_status: "Available" });

        res.json({ message: "Resolution uploaded. Awaiting citizen confirmation." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// CITIZEN FEEDBACK
router.post("/feedback", async (req, res) => {
    try {
        const { complaint_id, satisfied, citizen_id } = req.body;

        if (satisfied) {
            await Complaint.findByIdAndUpdate(complaint_id, {
                citizen_satisfied: true,
                status: "Closed"
            });
            res.json({ message: "Thank you. Complaint closed." });
        } else {
            await Complaint.findByIdAndUpdate(complaint_id, { citizen_satisfied: false });

            await Notification.create({
                complaint_id,
                type: "WARNING",
                message: "Citizen marked work as Not Satisfied. Show-cause notice issued."
            });

            res.json({ message: "Warning issued to engineer." });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Analyze Image using Gemini
router.post("/analyze-image", async (req, res) => {
    try {
        const { imageBase64 } = req.body;

        if (!imageBase64) {
            return res.status(400).json({ error: "No image provided" });
        }

        // Strip the data:image/jpeg;base64,... prefix
        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

        const prompt = `Analyze this image of a civic/urban environment. 
Determine if it depicts a civic problem that a municipal corporation would fix.
You must return a raw JSON object with exactly these three keys:
- "issueType": string (one of: 'garbage', 'pothole', 'waterlogging', 'broken_streetlight', 'structural_damage', or 'other'). Choose 'other' if it is not a civic issue or not clearly one of the specified types.
- "confidence": number (between 0.0 and 1.0 representing your confidence)
- "description": string (A short, professional 1-2 sentence description of what you see and why it's a problem)

Do NOT wrap the response in markdown blocks like \`\`\`json. Return ONLY the raw JSON string.`;

        const imagePart = {
            inlineData: {
                data: base64Data,
                mimeType: "image/jpeg"
            }
        };

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        let text = response.text();

        if (text.startsWith('```json')) {
            text = text.replace(/```json\n|\n```/g, '');
        } else if (text.startsWith('```')) {
            text = text.replace(/```\n|\n```/g, '');
        }

        try {
            const parsed = JSON.parse(text);
            res.json(parsed);
        } catch (e) {
            console.error("Failed to parse Gemini JSON:", text);
            res.json({
                issueType: "other",
                confidence: 0.5,
                description: "AI analyzed the image but formatting failed. " + text.substring(0, 100)
            });
        }

    } catch (err) {
        console.error("AI Analysis Error:", err);
        res.status(500).json({ error: "AI Analysis Failed: " + err.message });
    }
});

export default router;