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
        const query = `
            SELECT case_type, COUNT(*) as count 
            FROM forensic_cases 
            WHERE MONTH(incident_time) = MONTH(CURRENT_DATE())
              AND YEAR(incident_time) = YEAR(CURRENT_DATE())
            GROUP BY case_type
        `;
        const [results] = await db.query(query);
        res.json({ success: true, data: results });
    } catch (error) {
        console.error('Report Error (Monthly):', error);
        res.status(500).json({ success: false, message: 'Server error while fetching monthly stats' });
    }
};

exports.getPendingCases = async (req, res) => {
    try {
        const query = `
            SELECT c.case_id, p.first_name, c.case_type, c.incident_time 
            FROM forensic_cases c
            JOIN patients p ON c.patient_id = p.patient_id
            WHERE c.status = 'Open'
            ORDER BY c.incident_time ASC
        `;
        const [results] = await db.query(query);
        res.json({ success: true, data: results });
    } catch (error) {
        console.error('Report Error (Pending):', error);
        res.status(500).json({ success: false, message: 'Server error while fetching pending cases' });
    }
};
