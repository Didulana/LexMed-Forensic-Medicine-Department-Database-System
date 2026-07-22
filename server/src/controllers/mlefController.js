const db = require('../config/db');

exports.submitMLEF = async (req, res) => {
    const { case_id, jmo_id, consent_status, history_given, injuries, referrals } = req.body;
    
    // We use a transaction because we're inserting into multiple tables
    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();
        
        // 1. Insert into clinical_exams
        const [examResult] = await connection.query(
            `INSERT INTO clinical_exams (case_id, jmo_id, consent_status, history_given) VALUES (?, ?, ?, ?)`,
            [case_id, jmo_id, consent_status, history_given]
        );
        const exam_id = examResult.insertId;
        
        // 2. Insert injuries if they exist
        if (injuries && injuries.length > 0) {
            const injuryValues = injuries.map(inj => [
                exam_id, inj.injury_type, inj.weapon, inj.body_part, inj.hurt_category
            ]);
            await connection.query(
                `INSERT INTO injury_records (exam_id, injury_type, weapon, body_part, hurt_category) VALUES ?`,
                [injuryValues]
            );
        }
        
        // 3. Insert referrals if they exist
        if (referrals && referrals.length > 0) {
            const referralValues = referrals.map(ref => [
                exam_id, ref.department, ref.referral_date, ref.findings
            ]);
            await connection.query(
                `INSERT INTO clinical_referrals (exam_id, department, referral_date, findings) VALUES ?`,
                [referralValues]
            );
        }
        
        await connection.commit();
        
        res.status(201).json({
            success: true,
            message: 'MLEF submitted successfully',
            data: { exam_id }
        });
        
    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Database Error during MLEF submission:', error);
        res.status(500).json({ success: false, message: 'Server error while submitting MLEF.' });
    } finally {
        if (connection) connection.release();
    }
};
