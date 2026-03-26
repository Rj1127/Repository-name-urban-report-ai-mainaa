import express from "express";
import Complaint from "../models/Complaint.js";

const router = express.Router();

// 🧠 ML / SCORING LOGIC (MANDATORY)
const calculateScores = (metrics) => {
    const { rain, drainBlockage, history, complaints, elevation } = metrics;
    
    // FloodRisk = (Rainfall * 0.35) + (DrainBlockage * 0.25) + (PastFloodHistory * 0.20) + (ComplaintDensity * 0.10) + (ElevationFactor * 0.10)
    const elevationFactor = 100 - elevation; // Lower elevation = higher risk
    const floodRisk = Math.min(100, Math.max(0, Math.round(
        (rain * 0.35) + 
        (drainBlockage * 0.25) + 
        (history * 0.20) + 
        (complaints * 0.10) + 
        (elevationFactor * 0.10)
    )));

    // Priority Score (for heatmap emphasis)
    // Priority = (FloodRisk * 0.5) + (ComplaintDensity * 0.3) + (SeverityIndex * 0.2)
    const priority = Math.min(100, Math.max(0, Math.round(
        (floodRisk * 0.5) + (complaints * 0.3) + (80 * 0.2) // Using 80 as fixed severity index for simplicity
    )));

    return { floodRisk, priority };
};

// GET /api/heatmap
router.get("/", async (req, res) => {
    try {
        const { range } = req.query; // '24h', '7d', 'live'
        
        // 1. FETCH ACTUAL COMPLAINTS (MARKERS)
        const complaints = await Complaint.find({
            status: { $ne: "Closed" }
        }).select("latitude longitude severity issue_type created_at");

        const points = complaints
            .filter(c => c.longitude !== null && c.latitude !== null && c.longitude !== undefined && c.latitude !== undefined)
            .map(c => ({
                id: c._id,
                type: c.issue_type,
                coordinates: [c.longitude, c.latitude],
                severity: c.severity === "High" ? 0.9 : c.severity === "Medium" ? 0.6 : 0.3,
                timestamp: c.created_at
            }));

        // 2. GENERATE ZONE-WISE INTELLIGENCE (WARDS)
        const rawZones = [
            { id: "z12", name: "Ward 12 - Karamtarn", coords: [85.32, 23.34], metrics: { rain: 88, drainBlockage: 75, history: 90, complaints: 40, elevation: 15 } },
            { id: "z15", name: "Ward 15 - City Center", coords: [85.34, 23.36], metrics: { rain: 20, drainBlockage: 20, history: 10, complaints: 80, elevation: 90 } },
            { id: "z08", name: "Ward 08 - Industrial", coords: [85.30, 23.32], metrics: { rain: 40, drainBlockage: 95, history: 80, complaints: 20, elevation: 10 } },
            { id: "z22", name: "Ward 22 - Suburbs", coords: [85.36, 23.30], metrics: { rain: 45, drainBlockage: 30, history: 25, complaints: 50, elevation: 50 } },
            { id: "z05", name: "Ward 05 - West End", coords: [85.28, 23.35], metrics: { rain: 60, drainBlockage: 85, history: 40, complaints: 70, elevation: 25 } }
        ];

        const zones = rawZones.map(zone => {
            const scores = calculateScores(zone.metrics);
            
            // Classification & Predictive Feature
            let level = "Low";
            if (scores.floodRisk >= 90) level = "Critical";
            else if (scores.floodRisk >= 70) level = "High";
            else if (scores.floodRisk >= 40) level = "Medium";

            // AI Insights / Strategic Recommendation
            let recommendation = "Zone stable. Current infrastructure within limits.";
            let insight = `Zone ${zone.id} topography handles current rain levels.`;
            
            if (scores.floodRisk > 85) {
                recommendation = "IMMEDIATE: Deploy high-capacity water pumps. Mobilize flood rescue teams.";
                insight = `Ward ${zone.id.replace('z','')} floods repeatedly after heavy rainfall (Historical Correlation: 0.92)`;
            } else if (zone.metrics.drainBlockage > 80) {
                recommendation = "ACTION: Send drain-cleaning septic trucks to priority nodes.";
                insight = "Drain blockage + garbage = flood trigger detected.";
            } else if (zone.metrics.complaints > 60) {
                recommendation = "ADVISORY: Dispatch regional maintenance unit for rapid assessment.";
                insight = "High citizen report frequency indicates localized system failure.";
            }

            return {
                ...zone,
                floodRisk: scores.floodRisk,
                priority: scores.priority,
                level,
                recommendation,
                insight,
                prediction: scores.floodRisk > 70 ? `Flood expected in next ${Math.max(1, Math.round(10 - scores.floodRisk/10))} hours` : null
            };
        });

        // 3. GENERATE ALERTS
        const alerts = zones
            .filter(z => z.floodRisk > 70 || z.metrics.drainBlockage > 90)
            .map(z => ({
                id: `alert-${z.id}`,
                zoneId: z.id,
                level: z.floodRisk > 85 ? "CRITICAL" : "HIGH",
                message: z.floodRisk > 85 ? `🚨 ${z.name}: Flood risk critical (Expected soon)` : `⚠️ ${z.name}: Severe drain blockage detected.`,
                timestamp: new Date().toISOString()
            }));

        res.json({ points, zones, alerts });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/dispatch
// This is the upgraded endpoint for strategic dispatch
router.post("/dispatch", async (req, res) => {
    try {
        const { zoneId, priority, reason } = req.body;
        // In a real app, this would query the User model for nearest resolver/engineer
        // For now, we simulate success
        res.json({ 
            success: true, 
            message: `Strategic unit deployed to ${zoneId}`,
            dispatchRef: `FIRE-${Math.random().toString(36).substring(7).toUpperCase()}`
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
