const db = require('../config/db');

// Fetch officers for the dropdown
exports.getOfficers = async (req, res) => {
    try {
        const [officers] = await db.query(
            `SELECT officer_id, badge_no, name FROM police_officers`
        );
        res.json({ success: true, data: officers });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to fetch officers' });
    }
};

// Create the forensic case
exports.createCase = async (req, res) => {
    const { patient_id, officer_id, case_type, incident_time } = req.body;

    try {
        const [result] = await db.query(
            `INSERT INTO forensic_cases (patient_id, officer_id, case_type, incident_time, status) 
             VALUES (?, ?, ?, ?, 'Open')`,
            [patient_id, officer_id, case_type, incident_time]
        );

        res.json({
            success: true,
            message: 'Forensic Case officially opened!',
            data: { case_id: result.insertId }
        });
    } catch (error) {
        console.error('Database Error:', error);
        res.status(500).json({ success: false, message: 'Server error while opening case.' });
    }
};

// Fetch all open pending cases
exports.getPendingCases = async (req, res) => {
    try {
        const query = `
            SELECT 
                c.case_id, 
                c.case_type, 
                c.incident_time, 
                c.status,
                p.first_name AS patient_name,
                p.nic_passport,
                o.badge_no,
                o.name AS officer_name
            FROM forensic_cases c
            JOIN patients p ON c.patient_id = p.patient_id
            JOIN police_officers o ON c.officer_id = o.officer_id
            WHERE c.status = 'Open'
            ORDER BY c.incident_time DESC
        `;
        const [cases] = await db.query(query);
        res.json({ success: true, data: cases });
    } catch (error) {
        console.error('Database Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch pending cases.' });
    }
};