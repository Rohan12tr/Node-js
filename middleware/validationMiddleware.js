const validateUser = (req, res, next) => {
    const { name, email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: '❌ Email and password required'
        });
    }

    if (password.length < 6) {
        return res.status(400).json({
            message: '❌ Password must be at least 6 characters'
        });
    }

    next();
};

module.exports = validateUser;