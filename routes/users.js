var express = require('express');
var router = express.Router();
var usersController = require('../controllers/users.controller');
const passport = require('passport');

router.get('/', passport.authenticate('jwt', { session: false }), function(
  req,
  res,
  next
) {
  res.send(req.user);
});

router.post('/update', usersController.postUpdateInfo);

module.exports = router;
