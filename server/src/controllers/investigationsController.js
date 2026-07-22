const db = require('../config/db');

exports.submitRadiology = async (req, res) => {
    const { case_id, modality, body_region, findings } = req.body;
    try {
        const [result] = await db.query(
            `INSERT INTO radiology_scans (case_id, modality, body_region, findings) VALUES (?, ?, ?, ?)`,
            [case_id, modality, body_region, findings]
        );
        res.status(201).json({ success: true, message: 'Radiology scan added successfully', data: { scan_id: result.insertId } });
    } catch (error) {
        console.error('Radiology Insert Error:', error);
        res.status(500).json({ success: false, message: 'Server error while adding radiology scan' });
    }
};

exports.submitToxicology = async (req, res) => {
    const { case_id, sample_material, substance_tested, result_text } = req.body;
    try {
        const [result] = await db.query(
            `INSERT INTO toxicology_tests (case_id, sample_material, substance_tested, result) VALUES (?, ?, ?, ?)`,
            [case_id, sample_material, substance_tested, result_text]
        );
        res.status(201).json({ success: true, message: 'Toxicology test added successfully', data: { tox_id: result.insertId } });
    } catch (error) {
        console.error('Toxicology Insert Error:', error);
        res.status(500).json({ success: false, message: 'Server error while adding toxicology test' });
    }
};
