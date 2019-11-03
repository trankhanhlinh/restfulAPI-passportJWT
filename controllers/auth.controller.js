const jwt = require('jsonwebtoken');
const passport = require('passport');
const UsersModel = require('../models/users.model');
const { JWT_SECRET, saltRounds } = require('../configuration');
const bcrypt = require('bcrypt');

signToken = user => {
  return jwt.sign(
    {
      iss: 'Omy',
      userInfo: { ID: user.ID, USERNAME: user.USERNAME },
      iat: new Date().getTime()
    },
    JWT_SECRET
  );
};

module.exports.postRegister = (req, res, next) => {
  var hashPassword = bcrypt.hashSync(req.body.PASSWORD, saltRounds);
  var avatar =
    'https://cdn.pixabay.com/photo/2016/11/18/23/38/child-1837375_960_720.png';

  var newUser = {
    USERNAME: req.body.USERNAME,
    PASSWORD: hashPassword,
    FIRSTNAME: req.body.FIRSTNAME,
    LASTNAME: req.body.LASTNAME || '',
    AVATAR: avatar,
    EMAIL: req.body.EMAIL
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
        res.status(403).send({
          error: {
            message: 'Username already exists.',
            username: newUser.USERNAME
          }
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
      return res.status(403).send({
        error: {
          message: info ? info.message : err,
          user: user
        }
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
  const token = signToken(req.user);
  return res.status(200).json({ token });
};

// module.exports.googleOAuth = (req, res, next) => {
//   passport.authenticate(
//     'google-plus-token',
//     { session: false },
//     (err, user, info) => {
//       if (err || !user) {
//         return res.status(403).json({
//           message: info ? info.message : err,
//           user: user
//         });
//       }

//       const token = signToken(user);
//       return res.status(200).json({ token });
//     }
//   )(req, res);
// };
