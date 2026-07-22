const db = require('../config/db');

exports.registerPatient = async (req, res) => {
    const { nic_passport, first_name, dob, gender } = req.body;

    try {
        // Insert the new patient into the MySQL database
        const [result] = await db.query(
            `INSERT INTO patients (nic_passport, first_name, dob, gender) 
             VALUES (?, ?, ?, ?)`,
            [nic_passport, first_name, dob, gender]
        );

        res.json({
            success: true,
            message: 'Patient registered successfully!',
            data: {
                patient_id: result.insertId,
                first_name: first_name
            }
        });
    } catch (error) {
        console.error('Database Error:', error);
        // Handle duplicate NIC error (MySQL Error Code 1062)
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: 'A patient with this NIC/Passport already exists.' });
        }
        res.status(500).json({ success: false, message: 'Server error while registering patient.' });
    }
};