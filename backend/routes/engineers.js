import express from "express";
import User from "../models/User.js";
import Assignment from "../models/Assignment.js";

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
            .select("name email phone dept_name activity_status experience_level")
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

export default router;
