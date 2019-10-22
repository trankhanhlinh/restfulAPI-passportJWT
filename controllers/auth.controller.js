const jwt = require('jsonwebtoken');
const passport = require('passport');
const UsersModel = require('../models/users.model');

module.exports.postRegister = (req, res, next) => {
  var newUser = {
    USERNAME: req.body.USERNAME,
    PASSWORD: req.body.PASSWORD
  };

  UsersModel.checkIfExisted(newUser.USERNAME)
    .then(users => {
      if (users.length === 0) {
        UsersModel.addOne(newUser)
          .then(newUserId => {
            res.send({
              message: 'successfully create new user',
              userId: newUserId
            });
          })
          .catch(err => {
            res.send(err);
          });
      } else {
        res.send({ message: 'user is existed', username: newUser.USERNAME });
      }
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

      return res.json(token);
    });
  })(req, res);
};
