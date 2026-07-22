const db = require('../config/db');

exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find the user in the MySQL database
        const [users] = await db.query(
            `SELECT u.user_id, u.username, u.password_hash, r.role_name 
             FROM users u 
             JOIN roles r ON u.role_id = r.role_id 
             WHERE u.username = ?`, 
            [username]
        );

        if (users.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid username' });
        }

        const user = users[0];

        // Note: For production, we will use bcrypt.compare() here.
        // For now, we simulate a match for our initial testing.
        if (password !== 'admin123') { 
            return res.status(401).json({ success: false, message: 'Invalid password' });
        }

        // Send successful response
        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user_id: user.user_id,
                username: user.username,
                role: user.role_name
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};