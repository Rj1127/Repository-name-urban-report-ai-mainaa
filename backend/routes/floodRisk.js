import express from "express";
import Complaint from "../models/Complaint.js";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure advisory output directory exists
const ADVISORY_DIR = path.join(__dirname, "../public/documents/flood-advisories");
if (!fs.existsSync(ADVISORY_DIR)) fs.mkdirSync(ADVISORY_DIR, { recursive: true });

const router = express.Router();

// ─── Risk weight per issue type ───────────────────────────────────────────────
const RISK_WEIGHTS = {
    waterlogging: 3,
    blocked_drain: 3,
    drainage: 3,
    garbage: 2,
    pothole: 1,
    road_damage: 1,
};

const FLOOD_RELEVANT_TYPES = Object.keys(RISK_WEIGHTS);

function clusterComplaints(complaints) {
    const clusters = {};
    for (const c of complaints) {
        if (!c.latitude || !c.longitude) continue;
        const gridLat = (Math.round(c.latitude / 0.05) * 0.05).toFixed(2);
        const gridLng = (Math.round(c.longitude / 0.05) * 0.05).toFixed(2);
        const key = `${gridLat}_${gridLng}`;
        if (!clusters[key]) {
            clusters[key] = { lat: parseFloat(gridLat), lng: parseFloat(gridLng), complaints: [], riskScore: 0 };
        }
        const weight = RISK_WEIGHTS[c.issue_type] || 1;
        const statusMultiplier = ['New', 'Forwarded', 'Assigned', 'In Progress'].includes(c.status) ? 2 : 1;
        clusters[key].riskScore += weight * statusMultiplier;
        clusters[key].complaints.push(c);
    }
    return Object.values(clusters).map(cluster => {
        const addressComp = cluster.complaints.find(c => c.address);
        const address = addressComp?.address || `Lat ${cluster.lat}, Lng ${cluster.lng}`;
        let riskLevel, riskColor;
        if (cluster.riskScore >= 20) { riskLevel = 'Critical'; riskColor = 'red'; }
        else if (cluster.riskScore >= 10) { riskLevel = 'High'; riskColor = 'orange'; }
        else if (cluster.riskScore >= 5) { riskLevel = 'Moderate'; riskColor = 'yellow'; }
        else { riskLevel = 'Low'; riskColor = 'green'; }
        const typeCounts = {};
        for (const c of cluster.complaints) {
            typeCounts[c.issue_type] = (typeCounts[c.issue_type] || 0) + 1;
        }
        return {
            lat: cluster.lat, lng: cluster.lng, riskScore: cluster.riskScore,
            riskLevel, riskColor, address,
            totalComplaints: cluster.complaints.length, typeCounts,
            unresolvedCount: cluster.complaints.filter(c => ['New', 'Forwarded', 'Assigned', 'In Progress'].includes(c.status)).length,
        };
    }).sort((a, b) => b.riskScore - a.riskScore);
}

// ─── GET /api/flood-risk/analysis ─────────────────────────────────────────────
router.get("/analysis", async (req, res) => {
    try {
        const complaints = await Complaint.find({ issue_type: { $in: FLOOD_RELEVANT_TYPES } }).lean();
        const hotspots = clusterComplaints(complaints);
        const criticalCount = hotspots.filter(h => h.riskLevel === 'Critical').length;
        const highCount = hotspots.filter(h => h.riskLevel === 'High').length;
        const issueBreakdown = {};
        for (const c of complaints) { issueBreakdown[c.issue_type] = (issueBreakdown[c.issue_type] || 0) + 1; }
        res.json({ hotspots, summary: { totalRelevantComplaints: complaints.length, criticalZones: criticalCount, highRiskZones: highCount, issueBreakdown } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── POST /api/flood-risk/advisory ────────────────────────────────────────────
// Saves PDF to disk then returns download URL (avoids Chrome UUID blob names)
router.post("/advisory", async (req, res) => {
    try {
        const { hotspot } = req.body;
        if (!hotspot) return res.status(400).json({ error: "Hotspot data required" });

        const now = new Date();
        const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
        const timeStr = now.toLocaleTimeString('en-IN');
        const refNo = `CDB-FLOOD-${Date.now().toString().slice(-8)}`;
        const fileName = `CDB-FloodAdvisory-${refNo}.pdf`;
        const filePath = path.join(ADVISORY_DIR, fileName);

        // Create PDF stream to disk file
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const writeStream = fs.createWriteStream(filePath);

        const pdfDone = new Promise((resolve, reject) => {
            writeStream.on('finish', resolve);
            writeStream.on('error', reject);
            doc.on('error', reject);
        });

        doc.pipe(writeStream);

        // ── Red Header ───────────────────────────────────────────────────────────
        doc.rect(0, 0, doc.page.width, 110).fill('#7a0000');
        doc.fillColor('white').fontSize(22).font('Helvetica-Bold').text('CivicDrishti Bharat', 50, 26);
        doc.fontSize(10).font('Helvetica').text('Urban AI Governance Platform  |  Flood Risk Management Division', 50, 55);
        doc.fontSize(9).text(`Issued: ${dateStr} at ${timeStr}   |   Ref: ${refNo}`, 50, 73);

        // ── Risk Banner ──────────────────────────────────────────────────────────
        const bannerColor = hotspot.riskLevel === 'Critical' ? '#b71c1c' :
                            hotspot.riskLevel === 'High'     ? '#e65100' :
                            hotspot.riskLevel === 'Moderate' ? '#bf360c' : '#1b5e20';

        doc.rect(50, 125, doc.page.width - 100, 58).fill(bannerColor);
        doc.fillColor('white').fontSize(15).font('Helvetica-Bold')
            .text(`[ ${hotspot.riskLevel.toUpperCase()} RISK ]  FLOOD EVACUATION ADVISORY`, 62, 135, { width: doc.page.width - 130 });
        doc.fontSize(10).font('Helvetica')
            .text(`Risk Score: ${hotspot.riskScore} pts  |  Zone: ${hotspot.address}`, 62, 160);

        // ── Divider ──────────────────────────────────────────────────────────────
        doc.moveTo(50, 200).lineTo(doc.page.width - 50, 200).strokeColor('#bbbbbb').lineWidth(1).stroke();
        doc.fillColor('#666666').fontSize(9).font('Helvetica')
            .text(`GPS: ${hotspot.lat}, ${hotspot.lng}   |   Reference No: ${refNo}`, 50, 206);
        doc.moveTo(50, 220).lineTo(doc.page.width - 50, 220).strokeColor('#bbbbbb').lineWidth(1).stroke();

        // ── Section 1: Complaint Analysis ────────────────────────────────────────
        doc.fillColor('#7a0000').fontSize(12).font('Helvetica-Bold').text('1.  Complaint-Based Risk Analysis', 50, 234);
        doc.fillColor('#222222').fontSize(10).font('Helvetica')
            .text(`Total Flood-Risk Complaints in Zone:  ${hotspot.totalComplaints}`, 60, 254)
            .text(`Unresolved (Active) Complaints:       ${hotspot.unresolvedCount}`, 60, 270)
            .text(`Computed Risk Score:                  ${hotspot.riskScore} points`, 60, 286);

        doc.fillColor('#444444').fontSize(10).font('Helvetica-Bold').text('Issue Type Breakdown:', 60, 308);

        const typeLabels = {
            waterlogging: 'Waterlogging / Drainage Flood',
            blocked_drain: 'Blocked Drain',
            garbage: 'Garbage Accumulation (Drain Blockage Risk)',
            pothole: 'Pothole (Water Pooling Risk)',
            road_damage: 'Road Damage',
            drainage: 'Drainage Issue',
        };

        let yPos = 326;
        for (const [type, count] of Object.entries(hotspot.typeCounts || {})) {
            const weight = RISK_WEIGHTS[type] || 1;
            const label = typeLabels[type] || type;
            doc.fillColor('#333333').fontSize(10).font('Helvetica')
                .text(`  - ${label}: ${count} complaint(s)  x  ${weight} weight  =  ${count * weight} pts`, 60, yPos);
            yPos += 16;
        }

        // ── Section 2: Methodology ────────────────────────────────────────────────
        yPos += 8;
        doc.fillColor('#7a0000').fontSize(12).font('Helvetica-Bold').text('2.  AI Prediction Methodology', 50, yPos);
        yPos += 18;
        const methods = [
            'Complaint Clustering: GPS points grouped into 5km grid cells.',
            'Weighted Scoring: Drainage/waterlogging = 3x | Garbage = 2x | Pothole = 1x.',
            'Status Multiplier: Unresolved complaints score 2x compared to resolved.',
            'Risk Thresholds: Critical >=20 | High >=10 | Moderate >=5 | Low <5.',
        ];
        for (const m of methods) {
            doc.fillColor('#333333').fontSize(10).font('Helvetica').text(`  - ${m}`, 60, yPos, { width: doc.page.width - 110 });
            yPos += 16;
        }

        // ── Section 3: Advisory Actions ───────────────────────────────────────────
        yPos += 10;
        doc.moveTo(50, yPos).lineTo(doc.page.width - 50, yPos).strokeColor('#dddddd').lineWidth(1).stroke();
        yPos += 10;
        doc.fillColor('#7a0000').fontSize(12).font('Helvetica-Bold').text('3.  Official Advisory Actions', 50, yPos);
        yPos += 18;

        const advisories = hotspot.riskLevel === 'Critical' ? [
            'IMMEDIATE evacuation of low-lying areas within 500m of drain complaint clusters.',
            'Emergency pumping units to be deployed within 2 hours.',
            'Temporarily seal all potholes in zone to prevent water pooling.',
            'Municipal garbage clearance within 4 hours - prioritise drain-adjacent waste.',
            'Issue public alert via local media and CivicDrishti Bharat platform.',
        ] : hotspot.riskLevel === 'High' ? [
            'Place residents in affected zone on HIGH ALERT immediately.',
            'Drainage inspection teams to assess all blocked drain complaint sites.',
            'Garbage clearance to be completed within 24 hours.',
            'Monitor zone for 48 hours; escalate if new complaints appear.',
        ] : [
            'Schedule routine drainage inspection for the zone within 72 hours.',
            'Assign garbage clearance crew to the area.',
            'Log complaint cluster for preventive maintenance and monitoring.',
        ];

        for (const line of advisories) {
            doc.fillColor('#222222').fontSize(10).font('Helvetica')
                .text(`  ->  ${line}`, 60, yPos, { width: doc.page.width - 110 });
            yPos += 20;
        }

        // ── Footer ────────────────────────────────────────────────────────────────
        doc.rect(0, doc.page.height - 58, doc.page.width, 58).fill('#f5f5f5');
        doc.moveTo(0, doc.page.height - 58).lineTo(doc.page.width, doc.page.height - 58)
            .strokeColor('#dddddd').lineWidth(1).stroke();
        doc.fillColor('#aaaaaa').fontSize(8).font('Helvetica').text(
            `Auto-generated by CivicDrishti Bharat AI  |  Based on live complaint data  |  ${dateStr}\nFor official use only  |  Authorized by: Municipal Command Centre  |  Ref: ${refNo}`,
            50, doc.page.height - 46, { width: doc.page.width - 100, align: 'center' }
        );

        doc.end();

        // Wait for file to fully write before responding
        await pdfDone;

        console.log(`[FloodRisk] Advisory PDF saved: ${fileName}`);

        // Return JSON with download URL
        res.json({
            success: true,
            fileName,
            refNo,
            downloadUrl: `/documents/flood-advisories/${fileName}`,
        });

    } catch (err) {
        console.error('[FloodRisk] Advisory PDF error:', err);
        res.status(500).json({ error: err.message });
    }
});

export default router;
