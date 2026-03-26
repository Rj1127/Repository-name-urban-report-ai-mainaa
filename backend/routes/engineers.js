import express from "express";
import User from "../models/User.js";
import Assignment from "../models/Assignment.js";
import Notice from "../models/Notice.js";
import Complaint from "../models/Complaint.js";

const router = express.Router();

// GET ALL ENGINEERS (FOR ADMIN SIDEBAR)
router.get("/", async (req, res) => {
    try {
        const { department } = req.query;

        const filter = { role: "resolver" };
        if (department) {
            filter.dept_name = department;
        }

        const engineers = await User.find(filter)
            .select("name email phone dept_name activity_status experience_level gov_id area city state head_of_dept position area_expertise created_at")
            .lean();

        // Count active tasks for each engineer
        const result = await Promise.all(
            engineers.map(async (eng) => {
                const activeTasks = await Assignment.countDocuments({
                    engineer_id: eng._id,
                    status: { $in: ["Assigned", "In Progress"] }
                });
                return { ...eng, id: eng._id, active_tasks: activeTasks };
            })
        );

        // Sort: fewer active tasks first, then by activity_status
        result.sort((a, b) => {
            if (a.active_tasks !== b.active_tasks) return a.active_tasks - b.active_tasks;
            return (a.activity_status || "").localeCompare(b.activity_status || "");
        });

        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE ENGINEER
router.delete("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        
        // 1. Check if engineer has active tasks
        const activeTasks = await Assignment.countDocuments({
            engineer_id: id,
            status: { $in: ["Assigned", "In Progress"] }
        });

        if (activeTasks > 0) {
            return res.status(400).json({ error: "Cannot delete engineer with active assignments. Reassign their tasks first." });
        }

        // 2. Delete engineer
        await User.findByIdAndDelete(id);
        
        // 3. Cleanup archived assignments (optional, but good for cleanliness)
        await Assignment.deleteMany({ engineer_id: id });

        res.json({ message: "Engineer record removed successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET DISCIPLINE DATA
router.get("/discipline", async (req, res) => {
    try {
        const engineers = await User.find({ role: "resolver" }).lean();
        const allAssignments = await Assignment.find().lean();
        const allNotices = await Notice.find().lean();
        const allComplaints = await Complaint.find().lean();

        const data = await Promise.all(engineers.map(async (eng) => {
            const engAssignments = allAssignments.filter(a => a.engineer_id.toString() === eng._id.toString());
            const engNotices = allNotices.filter(n => n.engineer_id.toString() === eng._id.toString());
            
            // Violations: Rejected notices or Dissatisfied complaints where this engineer was assigned
            const rejectedNotices = engNotices.filter(n => n.admin_decision === 'Rejected').length;
            
            // For dissatisfied complaints, find which ones were assigned to this specific engineer
            const dissociatedAssignedComplaints = allAssignments
                .filter(a => a.engineer_id.toString() === eng._id.toString())
                .map(a => a.complaint_id.toString());
                
            const dissatisfiedComplaintsCount = allComplaints.filter(c => 
                c.satisfaction_status === 'Dissatisfied' && 
                dissociatedAssignedComplaints.includes(c._id.toString())
            ).length;

            const violations = rejectedNotices + dissatisfiedComplaintsCount;

            // Late tasks: UpdatedAt > Deadline (resolved tasks only)
            const lateTasks = engAssignments.filter(a => 
                a.status === 'Resolved' && 
                a.updatedAt && 
                a.deadline && 
                new Date(a.updatedAt) > new Date(a.deadline)
            ).length;

            // Intelligence Scoring logic
            const complianceScore = Math.max(0, 100 - (violations * 10) - (lateTasks * 5));

            let status = "Good";
            if (complianceScore < 50) status = "Suspend Candidate";
            else if (complianceScore < 70) status = "Critical";
            else if (complianceScore < 90) status = "Warning";

            return {
                id: eng._id,
                _id: eng._id,
                name: eng.name,
                department: eng.dept_name || "General Maintenance",
                assigned: engAssignments.length,
                violations,
                lateTasks,
                complianceScore,
                status,
                is_suspended: eng.is_suspended || false,
                email: eng.email,
                phone: eng.phone
            };
        }));

        const summary = {
            totalEngineers: engineers.length,
            violationsToday: allNotices.filter(n => new Date(n.created_at).toDateString() === new Date().toDateString()).length,
            activeWarnings: allNotices.filter(n => n.admin_decision === 'Pending').length,
            suspendedEngineers: engineers.filter(e => e.is_suspended).length
        };

        res.json({ engineers: data, summary });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// TAKE ACTION
router.post("/discipline/action", async (req, res) => {
    try {
        const { engineerId, action, reason } = req.body;
        if (!engineerId || !action) return res.status(400).json({ error: "Missing engineerId or action" });

        if (action === 'SUSPEND') {
            const suspensionUntil = new Date();
            suspensionUntil.setDate(suspensionUntil.getDate() + 7); // Default 7 days
            await User.findByIdAndUpdate(engineerId, { 
                is_suspended: true, 
                suspension_until: suspensionUntil,
                activity_status: "On Leave" 
            });
        }
        
        // This could be expanded to create a formal log or notice in the future
        res.json({ message: `Action ${action} recorded for engineer.` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET ENGINEER LOGS
router.get("/discipline/:id/logs", async (req, res) => {
    try {
        const notices = await Notice.find({ engineer_id: req.params.id })
            .populate("complaint_id", "reference_number issue_type status")
            .sort({ created_at: -1 });
        res.json(notices);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
