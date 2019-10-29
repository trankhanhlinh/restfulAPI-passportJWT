const jwt = require('jsonwebtoken');
const passport = require('passport');
const UsersModel = require('../models/users.model');
const { JWT_SECRET } = require('../configuration');

signToken = user => {
  return jwt.sign(
    {
      iss: 'Omy',
      userInfo: { ID: user.ID },
      iat: new Date().getTime()
    },
    JWT_SECRET
  );
};

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
            res.status(200).json({
              message: 'Successfully create new user',
              userId: newUserId,
              username: newUser.USERNAME
            });
          })
          .catch(err => {
            res.status(400).json({ message: err.message });
          });
      } else {
        res.status(403).json({
          message: 'Username already exists.',
          username: newUser.USERNAME
        });
      }
    })
    .catch(err => {
      res.status(400).json({ message: err.message });
    });
};

module.exports.postLogin = (req, res, next) => {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err || !user) {
      return res.status(403).json({
        message: info.message,
        user: user
      });
    }

    req.login(user, { session: false }, err => {
      if (err) {
        res.status(400).json({ message: err.message });
      }

      //const token = jwt.sign(JSON.stringify(user), config.JWT_SECRET);
      const token = signToken(user);

      return res.status(200).json({ token });
    });
  })(req, res);
};

module.exports.facebookOAuth = (req, res, next) => {
  const token = signToken(req.user);
  return res.status(200).json({ token });
};

module.exports.googleOAuth = (req, res, next) => {
  passport.authenticate(
    'google-plus-token',
    { session: false },
    (err, user, info) => {
      if (err || !user) {
        return res.status(403).json({
          message: info.message,
          user: user
        });
      }

      const token = signToken(user);
      return res.status(200).json({ token });
    }
  )(req, res);
};
