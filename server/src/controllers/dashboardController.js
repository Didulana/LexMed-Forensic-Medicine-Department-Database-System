const db = require('../config/db');

exports.getStats = async (req, res) => {
    try {
        const [casesRes] = await db.query(`SELECT COUNT(*) as total, SUM(CASE WHEN status='Open' THEN 1 ELSE 0 END) as open_cases FROM forensic_cases`);
        const [mlefRes] = await db.query(`SELECT COUNT(*) as total FROM clinical_exams`);
        const [pmrRes] = await db.query(`SELECT COUNT(*) as total FROM postmortems`);
        
        res.json({
            success: true,
            data: {
                total_cases: casesRes[0].total || 0,
                open_cases: casesRes[0].open_cases || 0,
                mlef_count: mlefRes[0].total || 0,
                pmr_count: pmrRes[0].total || 0
            }
        });
    } catch (error) {
        console.error('Dashboard Stats Error:', error);
        res.status(500).json({ success: false, message: 'Server error while fetching stats' });
    }
};
