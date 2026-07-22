const db = require('../config/db');

exports.search = async (req, res) => {
    const { q } = req.query;
    if (!q) {
        return res.json({ success: true, data: [] });
    }

    try {
        const searchTerm = `%\${q}%`;
        
        // Search across patients and cases
        const query = `
            SELECT 
                c.case_id, c.case_type, c.status, c.incident_time,
                p.patient_id, p.first_name, p.nic_passport, p.dob, p.gender
            FROM forensic_cases c
            JOIN patients p ON c.patient_id = p.patient_id
            WHERE c.case_id = ? 
               OR p.nic_passport LIKE ? 
               OR p.first_name LIKE ?
            ORDER BY c.incident_time DESC
        `;

        // If q is not a number, case_id search might fail or just return empty for that condition. 
        // We can safely pass it.
        const caseIdParam = isNaN(q) ? null : parseInt(q);

        const [results] = await db.query(query, [caseIdParam, searchTerm, searchTerm]);
        
        res.json({ success: true, data: results });
    } catch (error) {
        console.error('Search Error:', error);
        res.status(500).json({ success: false, message: 'Server error while searching' });
    }
};
