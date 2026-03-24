import express from "express";
import User from "../models/User.js";
import Leave from "../models/Leave.js";
import Certificate from "../models/Certificate.js";
import { generateLeaveCertificate } from "../utils/documentGenerator.js";

const router = express.Router();

// APPLY FOR LEAVE (Engineer)
router.post("/apply", async (req, res) => {
    try {
        const { engineer_id, reason, duration_from, duration_to, proof_document } = req.body;

        const engineer = await User.findById(engineer_id);
        if (!engineer) return res.status(404).json({ error: "Engineer not found" });

        const leave = await Leave.create({
            engineer_id,
            reason,
            duration_from,
            duration_to,
            proof_document,
            status: "Pending"
        });

        res.json({ message: "Leave application submitted. Status: Pending Approval", leave });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET ALL LEAVE APPLICATIONS (Admin)
router.get("/all", async (req, res) => {
    try {
        const leaves = await Leave.find().populate("engineer_id", "name dept_name").sort({ submitted_at: -1 });
        res.json(leaves);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET LEAVE BY ENGINEER ID
router.get("/status/:engineer_id", async (req, res) => {
    try {
        const leaves = await Leave.find({ engineer_id: req.params.engineer_id }).sort({ submitted_at: -1 });
        res.json(leaves);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// APPROVE/REJECT LEAVE (Admin)
router.patch("/approve/:id", async (req, res) => {
    try {
        const { status, admin_message, admin_id } = req.body;
        const leave = await Leave.findById(req.params.id);
        if (!leave) return res.status(404).json({ error: "Leave application not found" });

        leave.status = status;
        leave.admin_message = admin_message;
        if (status === "Approved") {
            leave.approved_at = new Date();
        }
        await leave.save();

        if (status === "Approved") {
            // Update engineer status to 'On Leave'
            await User.findByIdAndUpdate(leave.engineer_id, { activity_status: "On Leave" });

            // Generate Digital Certificate
            const engineer = await User.findById(leave.engineer_id);
            const admin = await User.findById(admin_id);
            const certData = await generateLeaveCertificate(leave, engineer, admin?.name || "Senior Admin");

            // Update Leave Document with Certificate Paths
            leave.certificate_pdf = certData.pdf;
            leave.certificate_jpg = certData.jpg;
            await leave.save();

            // Save Certificate Record (Legacy/Audit)
            await Certificate.create({
                engineer_id: leave.engineer_id,
                leave_id: leave._id,
                certificate_id: certData.certId,
                file_url: certData.pdf
            });
        }

        res.json({ message: `Leave ${status} successfully.`, leave });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DOWNLOAD CERTIFICATE
router.get("/certificate/:engineer_id", async (req, res) => {
    try {
        const cert = await Certificate.findOne({ engineer_id: req.params.engineer_id }).sort({ generated_at: -1 });
        if (!cert) return res.status(404).json({ error: "Certificate not found" });
        res.json(cert);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
