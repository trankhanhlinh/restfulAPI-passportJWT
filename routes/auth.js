const express = require('express');
const router = express.Router();
var authController = require('../controllers/auth.controller');
const passport = require('passport');

router.post('/register', authController.postRegister);

router.post('/login', authController.postLogin);

router.post(
  '/oauth/facebook',
  passport.authenticate('facebook-token', { session: false }),
  authController.facebookOAuth
);

router.post('/oauth/google', authController.googleOAuth);

module.exports = router;
