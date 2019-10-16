const jwt = require('jsonwebtoken');
const passport = require('passport');
const UsersModel = require('../models/users.model');

module.exports.postRegister = (req, res, next) => {
  var newUser = {
    USERNAME: req.body.USERNAME,
    PASSWORD: req.body.PASSWORD
  };

  UsersModel.addOne(newUser)
    .then(newUserId => {
      res.send(newUserId.toString());
    })
    .catch(err => {
      res.send(err);
    });
};

module.exports.postLogin = (req, res, next) => {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err || !user) {
      return res.status(400).json({
        message: info ? info.message : 'Login failed',
        user: user
      });
    }

    req.login(user, { session: false }, err => {
      if (err) {
        res.send(err);
      }

      const token = jwt.sign(JSON.stringify(user), 'your_jwt_secret');

      return res.json({ user, token });
    });
  })(req, res);
};
