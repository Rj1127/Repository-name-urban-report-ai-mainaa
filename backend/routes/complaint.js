import express from "express";
import User from "../models/User.js";
import Complaint from "../models/Complaint.js";
import Assignment from "../models/Assignment.js";
import Notification from "../models/Notification.js";
import Notice from "../models/Notice.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const router = express.Router();

// HELPER: Generate random reference number for unique identification
const generateRefNum = () => 'URB-' + Math.random().toString(36).substr(2, 6).toUpperCase();

/**
 * HELPER: Predicts severity and estimated resolution days based on issue type.
 * This can be expanded with more sophisticated AI logic in the future.
 */
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
            // Handle possible 'undefined' string or empty id
            const eng_id = req.query.engineer_id === 'undefined' ? null : req.query.engineer_id;
            if (!eng_id) return res.json([]);

            const assignments = await Assignment.find({ engineer_id: eng_id });
            const complaintIds = assignments.map(a => a.complaint_id);
            complaints = await Complaint.find({ _id: { $in: complaintIds } })
                .populate("user_id", "name")
                .sort({ created_at: -1 });
            
            // For engineers, we want to attach the assignment details (like deadline)
            const resultWithAssignments = complaints.map(c => {
                const obj = c.toObject();
                obj.id = obj._id;
                obj.citizen_name = obj.user_id?.name || null;
                const assignment = assignments.find(a => a.complaint_id.toString() === c._id.toString());
                if (assignment) {
                    obj.deadline = assignment.deadline;
                    obj.assigned_at = assignment.assigned_at;
                }
                return obj;
            });
            return res.json(resultWithAssignments);
        } else {
            complaints = await Complaint.find()
                .populate("user_id", "name")
                .sort({ created_at: -1 });
        }

        // Fetch all assignments to map engineers to complaints
        const allAssignments = await Assignment.find().populate("engineer_id", "name dept_name");

        // Map populated user name to citizen_name for frontend compatibility
        const result = complaints.map(c => {
            const obj = c.toObject();
            obj.id = obj._id;
            obj.citizen_name = obj.user_id?.name || null;
            
            // Find assignment for this complaint
            const assignment = allAssignments.find(a => a.complaint_id.toString() === c._id.toString());
            if (assignment) {
                obj.assigned_engineer_name = assignment.engineer_id?.name || "Unknown";
                obj.assigned_engineer_dept = assignment.engineer_id?.dept_name || null;
                obj.engineer_id = assignment.engineer_id?._id || assignment.engineer_id;
                obj.deadline = assignment.deadline;
                obj.assigned_at = assignment.assigned_at;
            }
            return obj;
        });

        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// UPDATE COMPLAINT DESCRIPTION
router.put("/:id", async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id);
        if (!complaint) return res.status(404).json({ error: "Complaint not found" });
        if (complaint.status !== 'New') return res.status(400).json({ error: "Cannot modify a complaint that is already being processed." });

        complaint.description = req.body.description;
        await complaint.save();
        res.json({ message: "Complaint updated successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * ASSIGN COMPLAINT TO ENGINEER
 * Creates an assignment record with a specific deadline provided by the Admin.
 */
router.post("/assign", async (req, res) => {
    try {
        const { complaint_id, engineer_id, provided_time } = req.body;
        
        // provided_time is expected in hours from the Admin Dashboard.
        // We calculate the absolute deadline timestamp here.
        const deadline = new Date();
        deadline.setHours(deadline.getHours() + (parseInt(provided_time) || 24)); 

        // Create Assignment entry - tracks the relationship and timing
        await Assignment.create({
            complaint_id,
            engineer_id,
            deadline,
            status: "Assigned"
        });

        // Update Complaint status to 'Forwarded' (meaning it's in the hands of an engineer)
        await Complaint.findByIdAndUpdate(complaint_id, { status: "Forwarded" });
        
        // Update Engineer activity status to 'Busy' to prevent over-assignment
        await User.findByIdAndUpdate(engineer_id, { activity_status: "Busy" });

        res.json({ 
            message: "Engineer assigned successfully", 
            deadline: deadline.toISOString() 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// RESOLVE COMPLAINT (Engineer uploads after-image)
router.post("/resolve", async (req, res) => {
    try {
        const { complaint_id, after_image, engineer_id } = req.body;

        const complaint = await Complaint.findById(complaint_id);
        if (!complaint) return res.status(404).json({ error: "Complaint not found" });

        if (complaint.before_image === after_image && complaint.before_image) {
            return res.status(400).json({ error: "AI Warning: Uploaded image appears identical to the Before image." });
        }

        // --- AI RESOLUTION VERIFICATION ---
        let resolutionAnalysis = { is_resolved: false, analysis_text: "AI verification pending", confidence: 0 };
        
        try {
            const base64Data = after_image.replace(/^data:image\/\w+;base64,/, "");
            const beforeBase64 = complaint.before_image ? complaint.before_image.replace(/^data:image\/\w+;base64,/, "") : null;

            const prompt = `
            Analyze these two images of a civic issue (Before and After).
            Before Image Type: ${complaint.issue_type}
            Before Image Description: ${complaint.description}

            Compare them and determine:
            1. Is the issue resolved in the After image?
            2. Is the After image related to the Before image/issue?
            3. Is the After image a "False Image" (irrelevant, same as before, or clearly fraudulent)?
            4. If it is a False Image, what does the After image actually show?

            Return ONLY a JSON object:
            {
                "is_resolved": boolean,
                "is_false_image": boolean,
                "confidence": number (0-1),
                "analysis": "string describing what changed or why it is false",
                "detected_content": "string describing the actual content if false, else empty"
            }
        `;

            const contents = [
                { role: "user", parts: [ { text: prompt }, 
                    { inlineData: { data: beforeBase64, mimeType: "image/jpeg" } },
                    { inlineData: { data: base64Data, mimeType: "image/jpeg" } }
                ] }
            ];

            const result = await model.generateContent({ contents });
            const response = await result.response;
            const text = response.text().trim();
            const aiData = JSON.parse(text);

            resolutionAnalysis = {
                is_resolved: aiData.is_resolved || false,
                is_false_image: aiData.is_false_image || false,
                analysis_text: aiData.analysis || "Analysis complete",
                detected_content: aiData.detected_content || "",
                confidence: aiData.confidence || 0.5
            };
        } catch (aiErr) {
            console.error("AI Resolution Analysis Failed:", aiErr);
        }

        await Complaint.findByIdAndUpdate(complaint_id, { 
            status: "Resolved", 
            after_image,
            resolution_analysis: resolutionAnalysis
        });
        
        await Assignment.updateMany({ complaint_id }, { status: "Resolved" });
        await User.findByIdAndUpdate(engineer_id, { activity_status: "Available" });

        res.json({ 
            message: "Resolution uploaded and verified by AI.",
            analysis: resolutionAnalysis
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// CITIZEN FEEDBACK
router.post("/feedback", async (req, res) => {
    try {
        const { complaint_id, satisfied, rating, feedback } = req.body;

        if (satisfied) {
            await Complaint.findByIdAndUpdate(complaint_id, {
                satisfaction_status: "Satisfied",
                citizen_rating: rating || 5,
                citizen_feedback: feedback || "Satisfied with work",
                status: "Closed"
            });
            res.json({ message: "Thank you! Complaint closed and rating submitted." });
        } else {
            await Complaint.findByIdAndUpdate(complaint_id, { 
                satisfaction_status: "Dissatisfied",
                citizen_feedback: feedback || "Work not satisfactory"
            });
            res.json({ message: "Feedback sent to Admin. Notice may be issued to engineer." });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// CREATE NOTICE (Admin to Engineer)
router.post("/notice", async (req, res) => {
    try {
        const { engineer_id, admin_id, complaint_id, message } = req.body;
        const notice = await Notice.create({ engineer_id, admin_id, complaint_id, message });
        res.json({ message: "Notice issued to engineer.", notice });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET NOTICES FOR ENGINEER
router.get("/notices/:engineer_id", async (req, res) => {
    try {
        const notices = await Notice.find({ engineer_id: req.params.engineer_id })
            .populate("complaint_id", "reference_number status")
            .sort({ created_at: -1 });
        res.json(notices);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// RESPOND TO NOTICE (Engineer reply)
router.post("/notices/:notice_id/respond", async (req, res) => {
    try {
        const { reason } = req.body;
        await Notice.findByIdAndUpdate(req.params.notice_id, { 
            reason, 
            responded: true 
        });
        res.json({ message: "Response submitted to Admin." });
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

// DELETE COMPLAINT (Citizen withdraws report)
router.delete("/:id", async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id);
        if (!complaint) return res.status(404).json({ error: "Complaint not found" });

        // Security: only allow deletion if not yet processed
        if (complaint.status !== 'New') {
            return res.status(400).json({ error: "Cannot delete a complaint that is already being processed." });
        }

        await Complaint.findByIdAndDelete(req.params.id);
        
        // Also cleanup any associated assignments (though there shouldn't be any for 'New' status)
        await Assignment.deleteMany({ complaint_id: req.params.id });

        res.json({ message: "Complaint deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;