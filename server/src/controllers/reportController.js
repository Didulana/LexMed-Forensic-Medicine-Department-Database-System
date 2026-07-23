const db = require('../config/db');

exports.getDailyCases = async (req, res) => {
    try {
        const query = `
            SELECT c.case_id, p.first_name, c.case_type, c.status, c.incident_time 
            FROM forensic_cases c
            JOIN patients p ON c.patient_id = p.patient_id
            WHERE DATE(c.incident_time) = CURDATE()
            ORDER BY c.incident_time DESC
        `;
        const [results] = await db.query(query);
        res.json({ success: true, data: results });
    } catch (error) {
        console.error('Report Error (Daily):', error);
        res.status(500).json({ success: false, message: 'Server error while fetching daily cases' });
    }
};

exports.getMonthlyStats = async (req, res) => {
    try {
        const query = `SELECT * FROM v_report_monthly_stats LIMIT 50`;
        const [results] = await db.query(query);
        res.json({ success: true, data: results });
    } catch (error) {
        console.error('Report Error (Monthly):', error);
        res.status(500).json({ success: false, message: 'Server error while fetching monthly stats' });
    }
};

exports.getPendingCases = async (req, res) => {
    try {
        const query = `SELECT * FROM v_report_pending_cases`;
        const [results] = await db.query(query);
        res.json({ success: true, data: results });
    } catch (error) {
        console.error('Report Error (Pending):', error);
        res.status(500).json({ success: false, message: 'Server error while fetching pending cases' });
    }
};

exports.getEvidenceAnomalies = async (req, res) => {
    try {
        const query = `SELECT * FROM v_report_evidence_anomalies`;
        const [results] = await db.query(query);
        res.json({ success: true, data: results });
    } catch (error) {
        console.error('Report Error (Evidence Anomalies):', error);
        res.status(500).json({ success: false, message: 'Server error while fetching evidence anomalies' });
    }
};

exports.getJmoCaseload = async (req, res) => {
    try {
        const query = `SELECT * FROM v_report_jmo_caseload`;
        const [results] = await db.query(query);
        res.json({ success: true, data: results });
    } catch (error) {
        console.error('Report Error (JMO Caseload):', error);
        res.status(500).json({ success: false, message: 'Server error while fetching JMO caseload' });
    }
};

exports.getTurnaroundTime = async (req, res) => {
    try {
        const query = `SELECT * FROM v_report_turnaround_time`;
        const [results] = await db.query(query);
        res.json({ success: true, data: results });
    } catch (error) {
        console.error('Report Error (Turnaround Time):', error);
        res.status(500).json({ success: false, message: 'Server error while fetching turnaround time' });
    }
};
