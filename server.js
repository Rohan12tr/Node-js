const express = require('express');
const app = express();
const pool = require('./db');
require('dotenv').config();


app.use(express.json());

// optional: test route
app.get('/', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        res.send('✅ Server + DB working');
    } catch (err) {
        res.status(500).send('❌ DB not connected');
    }
});


// post api
app.post('/postData', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const query = `
      INSERT INTO users (name, email, password)
      VALUES ($1, $2, $3)
      RETURNING id, name, email 
    `;

        const result = await pool.query(query, [name, email, password]);

        res.status(201).json({
            message: '✅ Data inserted',
            users: result.rows[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: '❌ Error inserting data'
        });
    }
});

// get data
app.get('/getData', async (req, res) => {
    try {
        const query = `SELECT id, name, email FROM users`;
        const result = await pool.query(query);

        res.status(200).json({
            message: '✅ Data fetched',
            users: result.rows
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: '❌ Error fetching data'
        });
    }
}); 
 
// update data
app.put('/users/:ID', async (req, res) => {
    const { ID } = req.params;
    const { name, email, password } = req.body;

    try{
      const query = `UPDATE users SET name=$1 , email=$2 , password=$3 Where id =$4  RETURNING id, name, email,password ` ;
      const result = await pool.query(query,[name, email, password, ID]);

      res.status(200).json({
      message: '✅ User updated',
      user: result.rows[0]
    });
    }catch(error){
        console.error(error);
        res.status(500).json({
            message: '❌ Error update data'
        });
    }
})

// delete data
app.delete('/delete/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const query = `
      DELETE FROM users
      WHERE id = $1
      RETURNING id, name, email
    `;

    const result = await pool.query(query, [id]);

    // check if user exists
    if (result.rows.length === 0) {
      return res.status(404).json({
        message: '❌ User not found'
      });
    }

    res.status(200).json({
      message: '🗑️ User deleted',
      user: result.rows[0]
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: '❌ Error deleting user'
    });
  }
});



// start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});