const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');

// TEST
const testDB = async (req, res) => {
    try {
        await pool.query('SELECT 1');
        res.send('✅ Server + DB working');
    } catch (err) {
        res.status(500).send('❌ DB not connected');
    }
};

// CREATE
// const createUser = async (req, res) => {
//     const { name, email, password } = req.body;

//     try {
//         const result = await pool.query(
//             `INSERT INTO users (name, email, password)
//              VALUES ($1, $2, $3)
//              RETURNING id, name, email`,
//             [name, email, password]
//         );

//         res.status(201).json({
//             message: '✅ User created',
//             user: result.rows[0]
//         });

//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: '❌ Error creating user' });
//     }
// };

// READ
const getUsers = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, name, email FROM users`
        );

        res.status(200).json({
            message: '✅ Users fetched',
            users: result.rows
        });

    } catch (error) {
        res.status(500).json({ message: '❌ Error fetching users' });
    }
};

// UPDATE
const updateUser = async (req, res) => {
    const { ID } = req.params;
    const { name, email, password } = req.body;

    try {
        const result = await pool.query(
            `UPDATE users
             SET name=$1, email=$2, password=$3
             WHERE id=$4
             RETURNING id, name, email`,
            [name, email, password, ID]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: '❌ User not found' });
        }

        res.status(200).json({
            message: '✅ User updated',
            user: result.rows[0]
        });

    } catch (error) {
        res.status(500).json({ message: '❌ Error updating user' });
    }
};

// DELETE
const deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            `DELETE FROM users
             WHERE id=$1
             RETURNING id, name, email`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: '❌ User not found' });
        }

        res.status(200).json({
            message: '🗑️ User deleted',
            user: result.rows[0]
        });

    } catch (error) {
        res.status(500).json({ message: '❌ Error deleting user' });
    }
};

// create
const createUser = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const {rows} = await pool.query(
            `INSERT INTO users (name, email, password,role)
             VALUES ($1, $2, $3,$4)
             RETURNING id, name, email,role`,
            [name, email, hashedPassword,0]
        );

        const user = rows[0]

        const token = jwt.sign(
            { id: user.id, email: user.email,role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

          res.status(200).json({
            message: '✅ Login successful',
            token,
            user
        });

    } catch (error) {
        console.error("error creating user:", error)
        res.status(500).json({ message: '❌ Error creating user' });
    }
};

// login
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await pool.query(
            `SELECT * FROM users WHERE email = $1`,
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ message: '❌ User not found' });
        }

        const user = result.rows[0];

        // compare password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: '❌ Invalid credentials' });
        }

        // create token
        const token = jwt.sign(
            { id: user.id, email: user.email ,role: user.role},
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

          res.status(200).json({
            message: '✅ Login successful',
            token,
            user
        });

    } catch (error) {
        res.status(500).json({ message: '❌ Login error' });
    }
};



module.exports = {
    testDB,
    getUsers,
    updateUser,
    deleteUser,
    createUser,
    loginUser
};