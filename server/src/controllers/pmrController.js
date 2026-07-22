const db = require('../config/db');

exports.submitPMR = async (req, res) => {
    const { case_id, jmo_id, death_category, pm_date, immediate_cause, antecedent_cause, contributory, histology_samples } = req.body;
    
    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();
        
        // 1. Insert into postmortems
        const [pmResult] = await connection.query(
            `INSERT INTO postmortems (case_id, jmo_id, death_category, pm_date) VALUES (?, ?, ?, ?)`,
            [case_id, jmo_id, death_category, pm_date || null]
        );
        const pm_id = pmResult.insertId;
        
        // 2. Insert into causes_of_death (1:1 relationship with postmortem)
        await connection.query(
            `INSERT INTO causes_of_death (pm_id, immediate_cause, antecedent_cause, contributory) VALUES (?, ?, ?, ?)`,
            [pm_id, immediate_cause, antecedent_cause, contributory]
        );
        
        // 3. Insert histology samples if any exist
        if (histology_samples && histology_samples.length > 0) {
            const sampleValues = histology_samples.map(sample => [
                pm_id, sample.tissue_type, sample.analysis_result
            ]);
            await connection.query(
                `INSERT INTO histology_samples (pm_id, tissue_type, analysis_result) VALUES ?`,
                [sampleValues]
            );
        }
        
        await connection.commit();
        
        res.status(201).json({
            success: true,
            message: 'Postmortem Report (PMR) submitted successfully',
            data: { pm_id }
        });
        
    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Database Error during PMR submission:', error);
        res.status(500).json({ success: false, message: 'Server error while submitting PMR.' });
    } finally {
        if (connection) connection.release();
    }
};
