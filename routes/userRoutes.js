// const express = require('express');
// const router = express.Router();

// const userController = require('../controllers/userController');

// // routes
// router.get('/', userController.testDB);
// router.post('/users', userController.createUser);
// router.get('/users', userController.getUsers);
// router.put('/users/:ID', userController.updateUser);
// router.delete('/users/:id', userController.deleteUser);

// module.exports = router;



const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const validateUser = require('../middleware/validationMiddleware');
const emailCheck = require('../middleware/checkEmailExists');
const adminMiddleware = require('../middleware/adminMiddleware');

// public routes
router.get('/', userController.testDB);
router.post('/register',emailCheck, validateUser, userController.createUser);
router.post('/login', userController.loginUser);

// protected routes
router.get('/users', authMiddleware, adminMiddleware,userController.getUsers);
router.put('/users/:ID', authMiddleware, userController.updateUser);
router.delete('/users/:id', authMiddleware, userController.deleteUser);

module.exports = router;