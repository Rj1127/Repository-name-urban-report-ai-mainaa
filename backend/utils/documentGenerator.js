import PDFDocument from 'pdfkit';
import puppeteer from 'puppeteer';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SLIPS_DIR = path.join(__dirname, '../public/documents/slips');
const CERTIFICATES_DIR = path.join(__dirname, '../public/documents/certificates');

// Ensure directories exist
if (!fs.existsSync(SLIPS_DIR)) fs.mkdirSync(SLIPS_DIR, { recursive: true });
if (!fs.existsSync(CERTIFICATES_DIR)) fs.mkdirSync(CERTIFICATES_DIR, { recursive: true });

/**
 * Generates an Acknowledgement Slip in PDF and JPG formats
 */
export const generateAcknowledgementSlip = async (complaint, user) => {
    const refId = complaint.reference_number || `REF-${Date.now()}`;
    const pdfPath = path.join(SLIPS_DIR, `${refId}.pdf`);
    const jpgPath = path.join(SLIPS_DIR, `${refId}.jpg`);

    // 1. Generate QR Code
    const qrBuffer = await QRCode.toBuffer(JSON.stringify({ refId, id: complaint._id }));

    // 2. Generate PDF
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const stream = fs.createWriteStream(pdfPath);
    doc.pipe(stream);

    // Header
    doc.fontSize(20).text('SMART NAGAR REPORTING PORTAL (SNRP)', { align: 'center' });
    doc.fontSize(24).fillColor('#2563eb').text('COMLAINT ACKNOWLEDGEMENT RECEIPT', { align: 'center' });
    doc.moveDown();

    // Horizontal Line
    doc.moveTo(50, 150).lineTo(545, 150).stroke();
    doc.moveDown();

    // Content
    doc.fillColor('#000').fontSize(12);
    doc.text(`Reference Number: ${refId}`, { underline: true });
    doc.moveDown();
    doc.text(`Citizen Name: ${user.name}`);
    doc.text(`Complaint ID: ${complaint._id}`);
    doc.text(`Date of Submission: ${new Date(complaint.created_at).toLocaleDateString()}`);
    doc.text(`Time: ${new Date(complaint.created_at).toLocaleTimeString()}`);
    doc.text(`Complaint Type: ${complaint.issue_type}`);
    doc.text(`Address: ${complaint.address || 'Not Provided'}`);
    doc.text(`Coordinates: ${complaint.latitude}, ${complaint.longitude}`);
    doc.moveDown();

    // QR Code
    doc.image(qrBuffer, 400, 200, { width: 100 });
    
    // Seal/Watermark logic (simulated with light text)
    doc.opacity(0.1).fontSize(60).text('OFFICIAL RECEIPT', 50, 400, { angle: 45 });
    doc.opacity(1);

    doc.end();

    // 3. Generate JPG using Puppeteer
    const html = `
        <html>
        <head>
            <style>
                body { font-family: 'Arial', sans-serif; padding: 40px; background: #f8fafc; color: #1e293b; }
                .receipt { border: 2px solid #e2e8f0; border-radius: 12px; background: white; padding: 30px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
                h1 { color: #2563eb; font-size: 24px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
                .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px; }
                .item label { font-size: 10px; font-weight: bold; text-transform: uppercase; color: #64748b; }
                .item p { font-size: 14px; margin: 4px 0; font-weight: 600; }
                .qr { text-align: right; }
                .watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg); font-size: 80px; opacity: 0.05; font-weight: 900; pointer-events: none; }
            </style>
        </head>
        <body>
            <div class="receipt">
                <h1>Complaint Acknowledgement</h1>
                <div class="grid">
                    <div class="item"><label>Reference #</label><p>${refId}</p></div>
                    <div class="item"><label>Citizen Name</label><p>${user.name}</p></div>
                    <div class="item"><label>Submission Date</label><p>${new Date(complaint.created_at).toLocaleString()}</p></div>
                    <div class="item"><label>Status</label><p>${complaint.status}</p></div>
                    <div class="item"><label>Issue Type</label><p>${complaint.issue_type}</p></div>
                    <div class="item"><label>Location</label><p>${complaint.address || 'N/A'}</p></div>
                </div>
                <div class="watermark">SNRP OFFICIAL</div>
            </div>
        </body>
        </html>
    `;

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({ width: 800, height: 600 });
    await page.setContent(html);
    await page.screenshot({ path: jpgPath, type: 'jpeg', quality: 90 });
    await browser.close();

    return { pdf: `/documents/slips/${refId}.pdf`, jpg: `/documents/slips/${refId}.jpg` };
};

/**
 * Generates an Leave Certificate in PDF and JPG formats
 */
export const generateLeaveCertificate = async (leave, user, adminName = "System Admin") => {
    const certId = `CERT-${Date.now()}`;
    const pdfPath = path.join(CERTIFICATES_DIR, `${certId}.pdf`);
    const jpgPath = path.join(CERTIFICATES_DIR, `${certId}.jpg`);

    // 1. Generate PDF
    const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 50 });
    const stream = fs.createWriteStream(pdfPath);
    doc.pipe(stream);

    // Border
    doc.rect(20, 20, 802, 555).stroke();

    doc.moveDown(2);
    doc.fontSize(30).text('LEAVE APPROVAL CERTIFICATE', { align: 'center' });
    doc.fontSize(14).text('Smart Nagar Reporting Portal (SNRP)', { align: 'center' });
    doc.moveDown(2);

    doc.fontSize(16).text('This is to certify that the leave application of:', { align: 'center' });
    doc.moveDown();
    doc.fontSize(24).font('Helvetica-Bold').text(user.name, { align: 'center' });
    doc.font('Helvetica').fontSize(16).text(`Employee ID: ${user._id}`, { align: 'center' });
    doc.text(`Department: ${user.dept_name || 'Operations'}`, { align: 'center' });
    doc.moveDown();

    doc.fontSize(16).text('has been APPROVED for the following duration:', { align: 'center' });
    doc.moveDown();
    doc.fontSize(20).text(`${new Date(leave.duration_from).toLocaleDateString()} to ${new Date(leave.duration_to).toLocaleDateString()}`, { align: 'center' });
    doc.moveDown(2);

    // Signature Area
    doc.fontSize(12).text('Digital Signature of Admin', 100, 480);
    doc.fontSize(18).font('Times-Italic').text(adminName, 100, 500); // Stylized Signature
    doc.font('Helvetica').fontSize(12).text('Officer-in-Charge, SNRP', 100, 520);

    doc.end();

    // 2. Generate JPG
    const html = `
        <html>
        <head>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,700&display=swap');
                body { padding: 40px; background: #f3f4f6; }
                .cert { border: 15px double #1e293b; background: white; padding: 50px; text-align: center; }
                h1 { font-family: 'Playfair Display', serif; font-size: 40px; color: #1e293b; }
                .name { font-size: 32px; font-weight: bold; margin: 20px 0; color: #2563eb; }
                .details { font-size: 18px; margin: 10px 0; }
                .sig { margin-top: 50px; text-align: left; margin-left: 100px; font-family: 'Playfair Display', serif; font-style: italic; font-size: 24px; }
            </style>
        </head>
        <body>
            <div class="cert">
                <h1>LEAVE APPROVAL CERTIFICATE</h1>
                <p>Smart Nagar Reporting Portal</p>
                <div style="margin-top: 40px;">
                    <p class="details">This is to certify that leave for</p>
                    <p class="name">${user.name}</p>
                    <p class="details">ID: ${user._id}</p>
                    <p class="details">From ${new Date(leave.duration_from).toLocaleDateString()} to ${new Date(leave.duration_to).toLocaleDateString()}</p>
                </div>
                <div class="sig">
                    ${adminName}
                    <p style="font-family: sans-serif; font-style: normal; font-size: 12px; font-weight: bold;">OFFICIAL SEAL ATTACHED</p>
                </div>
            </div>
        </body>
        </html>
    `;

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({ width: 1000, height: 700 });
    await page.setContent(html);
    await page.screenshot({ path: jpgPath, type: 'jpeg', quality: 90 });
    await browser.close();

    return { pdf: `/documents/certificates/${certId}.pdf`, jpg: `/documents/certificates/${certId}.jpg`, certId };
};
/**
 * Generates an Official Suspension Letter in PDF format
 */
export const generateSuspensionLetter = async (engineer, notice, adminNotes, days = 7) => {
    const suspId = `SUSP-${Date.now()}`;
    const pdfPath = path.join(CERTIFICATES_DIR, `${suspId}.pdf`);
    const untilDate = new Date();
    untilDate.setDate(untilDate.getDate() + parseInt(days));

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const stream = fs.createWriteStream(pdfPath);
    doc.pipe(stream);

    // Header with Red Accents
    doc.fontSize(20).fillColor('#991b1b').text('SMART NAGAR REPORTING PORTAL', { align: 'center' });
    doc.fontSize(24).font('Helvetica-Bold').text('OFFICIAL SUSPENSION ORDER', { align: 'center' });
    doc.moveDown();

    doc.moveTo(50, 150).lineTo(545, 150).strokeColor('#991b1b').stroke();
    doc.moveDown();

    // Body
    doc.fillColor('#000').font('Helvetica').fontSize(12);
    doc.text(`Order Number: ${suspId}`, { align: 'right' });
    doc.text(`Date of Issue: ${new Date().toLocaleDateString()}`, { align: 'right' });
    doc.moveDown(2);

    doc.text('To,');
    doc.font('Helvetica-Bold').text(engineer.name);
    doc.font('Helvetica').text(`Employee ID: ${engineer._id}`);
    doc.text(`Department: ${engineer.dept_name || 'Operations'}`);
    doc.moveDown(2);

    doc.font('Helvetica-Bold').text('Subject: NOTICE OF TEMPORARY SUSPENSION FROM DUTY');
    doc.moveDown();

    doc.font('Helvetica').text(`This is a formal disciplinary order issued following the review of your explanation regarding the resolution conflict for Complaint Ref: ${notice.complaint_id?.reference_number || 'N/A'}.`);
    doc.moveDown();

    doc.text('Upon review by the Urban Command Center, your justification was found to be ');
    doc.font('Helvetica-Bold').text('NOT SATISFACTORY', { continued: true });
    doc.font('Helvetica').text(' for the following reasons:');
    doc.moveDown(0.5);
    doc.font('Helvetica-Oblique').text(`"${adminNotes || 'Professional negligence/dishonesty detected in field report.'}"`, { indent: 20 });
    doc.moveDown();

    doc.font('Helvetica-Bold').text('CONSEQUENCES:');
    doc.font('Helvetica').list([
        `Immediate suspension from the portal for a period of ${days} days.`,
        `Access to new assignments is blocked until ${untilDate.toLocaleDateString()}.`,
        `All current and pending bonuses are withheld for the current cycle.`,
        `This incident will be permanently recorded in your professional conduct file.`
    ]);
    doc.moveDown(2);

    doc.text('By Order of,');
    doc.moveDown();
    doc.font('Helvetica-Bold').text('The Municipal Commissioner');
    doc.text('Smart Nagar Urban Administration');

    // Footer Warning
    doc.fontSize(10).fillColor('#991b1b').text('This is an electronically generated order and does not require a physical signature.', 50, 700, { align: 'center' });

    doc.end();
    return { pdf: `/documents/certificates/${suspId}.pdf`, suspId, untilDate };
};

/**
 * Generates an Official Disciplinary Notice in JPG format (Karan Batao)
 */
export const generateDisciplinaryJPG = async (engineer, notice, adminNotes, days = 7) => {
    const noticeId = `NOTICE-${Date.now()}`;
    const jpgPath = path.join(CERTIFICATES_DIR, `${noticeId}.jpeg`);
    const untilDate = new Date();
    untilDate.setDate(untilDate.getDate() + parseInt(days));

    const html = `
        <html>
        <head>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
                body { 
                    font-family: 'Inter', sans-serif; 
                    margin: 0; 
                    padding: 40px; 
                    background: #7f1d1d; 
                    display: flex; 
                    justify-content: center; 
                    align-items: center; 
                    min-height: 100vh;
                }
                .notice-card {
                    background: white;
                    width: 700px;
                    border-radius: 24px;
                    padding: 40px;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                    border: 8px solid #ef4444;
                    position: relative;
                    overflow: hidden;
                }
                .header {
                    text-align: center;
                    border-bottom: 2px solid #fee2e2;
                    padding-bottom: 20px;
                    margin-bottom: 30px;
                }
                .header h1 {
                    color: #991b1b;
                    font-size: 28px;
                    margin: 0;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                }
                .header p {
                    color: #7f1d1d;
                    font-weight: 800;
                    margin: 5px 0 0;
                    font-size: 14px;
                }
                .main-title {
                    text-align: center;
                    font-size: 36px;
                    font-weight: 900;
                    color: #111827;
                    margin-bottom: 30px;
                    line-height: 1.1;
                }
                .details-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                    margin-bottom: 30px;
                }
                .detail-item {
                    background: #fef2f2;
                    padding: 15px;
                    border-radius: 12px;
                }
                .detail-item label {
                    display: block;
                    font-size: 10px;
                    font-weight: 900;
                    color: #991b1b;
                    text-transform: uppercase;
                    margin-bottom: 4px;
                }
                .detail-item span {
                    font-size: 16px;
                    font-weight: 700;
                    color: #111827;
                }
                .reason-box {
                    background: #111827;
                    color: white;
                    padding: 25px;
                    border-radius: 16px;
                    margin-bottom: 30px;
                    position: relative;
                }
                .reason-box label {
                    color: #ef4444;
                    font-size: 10px;
                    font-weight: 900;
                    text-transform: uppercase;
                    display: block;
                    margin-bottom: 10px;
                }
                .reason-box p {
                    margin: 0;
                    font-size: 15px;
                    line-height: 1.6;
                    font-style: italic;
                }
                .footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    border-top: 2px solid #fee2e2;
                    padding-top: 20px;
                }
                .restriction {
                    color: #991b1b;
                    font-weight: 800;
                    font-size: 12px;
                }
                .timestamp {
                    color: #64748b;
                    font-size: 10px;
                    font-weight: 600;
                }
                .qr-placeholder {
                    position: absolute;
                    top: -20px;
                    right: -20px;
                    width: 100px;
                    height: 100px;
                    background: #ef4444;
                    transform: rotate(45deg);
                }
            </style>
        </head>
        <body>
            <div class="notice-card">
                <div class="qr-placeholder"></div>
                <div class="header">
                    <h1>Goverance Accountability Office</h1>
                    <p>SMART NAGAR REPORTING PORTAL (SNRP)</p>
                </div>
                
                <h2 class="main-title">OFFICIAL TERMINAL<br>DISCIPLINARY BLOCK</h2>
                
                <div class="details-grid">
                    <div class="detail-item">
                        <label>Personnel Name</label>
                        <span>${engineer.name}</span>
                    </div>
                    <div class="detail-item">
                        <label>Case Reference</label>
                        <span>${notice.complaint_id?.reference_number || 'N/A'}</span>
                    </div>
                    <div class="detail-item">
                        <label>Block Duration</label>
                        <span>${days} Days</span>
                    </div>
                    <div class="detail-item">
                        <label>Restricted Until</label>
                        <span>${untilDate.toLocaleDateString()}</span>
                    </div>
                </div>
                
                <div class="reason-box">
                    <label>Grounds for Action</label>
                    <p>"${adminNotes || 'Submission of fraudulent field data and failure to provide satisfactory justification.'}"</p>
                </div>
                
                <div class="footer">
                    <div class="restriction">
                        STATUS: ACCESS RESTRICTED
                    </div>
                    <div class="timestamp">
                        ISSUED: ${new Date().toLocaleString()} | ID: ${noticeId}
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({ width: 850, height: 850 });
    await page.setContent(html);
    await page.screenshot({ path: jpgPath, type: 'jpeg', quality: 95 });
    await browser.close();

    return { jpg: `/documents/certificates/${noticeId}.jpeg` };
};
