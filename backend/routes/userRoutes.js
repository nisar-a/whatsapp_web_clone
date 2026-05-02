const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Create/Login user
router.post('/', userController.createOrLoginUser);

// Get all users
router.get('/', userController.getAllUsers);

// Get user by ID
router.get('/:userId', userController.getUserById);

module.exports = router;
