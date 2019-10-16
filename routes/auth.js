const express = require('express');
const router = express.Router();
var authController = require('../controllers/auth.controller');

router.post('/register', authController.postRegister);

/* POST login. */
router.post('/login', authController.postLogin);

module.exports = router;
