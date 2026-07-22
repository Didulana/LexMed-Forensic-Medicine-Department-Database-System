const db = require('../config/db');

exports.addEvidence = async (req, res) => {
    const { case_id, item_type, description, current_status } = req.body;
    try {
        const [result] = await db.query(
            `INSERT INTO evidence_items (case_id, item_type, description, current_status) VALUES (?, ?, ?, ?)`,
            [case_id, item_type, description, current_status]
        );
        res.status(201).json({ success: true, message: 'Evidence added', data: { item_id: result.insertId } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error adding evidence' });
    }
};

exports.addChainOfCustody = async (req, res) => {
    const { item_id, released_by_user, received_by_name } = req.body;
    try {
        const [result] = await db.query(
            `INSERT INTO chain_of_custody (item_id, released_by_user, received_by_name) VALUES (?, ?, ?)`,
            [item_id, released_by_user, received_by_name]
        );
        res.status(201).json({ success: true, message: 'Chain of custody logged', data: { transfer_id: result.insertId } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error logging chain of custody' });
    }
};

exports.addCourtSummons = async (req, res) => {
    const { jmo_id, case_id, appearance_date, status } = req.body;
    try {
        const [result] = await db.query(
            `INSERT INTO court_summons (jmo_id, case_id, appearance_date, status) VALUES (?, ?, ?, ?)`,
            [jmo_id, case_id, appearance_date, status]
        );
        res.status(201).json({ success: true, message: 'Summons logged', data: { summon_id: result.insertId } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error logging summons' });
    }
};

exports.addLegalDocument = async (req, res) => {
    const { case_id, authority_id, doc_type, reference_no } = req.body;
    try {
        const [result] = await db.query(
            `INSERT INTO legal_documents (case_id, authority_id, doc_type, reference_no) VALUES (?, ?, ?, ?)`,
            [case_id, authority_id || null, doc_type, reference_no]
        );
        res.status(201).json({ success: true, message: 'Legal document added', data: { doc_id: result.insertId } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error adding legal document' });
    }
};
