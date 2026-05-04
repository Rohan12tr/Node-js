const pool = require('../db');

const checkEmailExists = async (req, res, next) => {
    const { email } = req.body;

    try {
        const result = await pool.query(
            `SELECT * FROM users WHERE email = $1`,
            [email]
        );

        if (result.rows.length > 0) {
            return res.status(400).json({
                message: '❌ Email already exists'
            });
        }

        next(); // continue if email not found

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: '❌ Server error'
        });
    }
};

module.exports = checkEmailExists;