const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const FacebookTokenStrategy = require('passport-facebook-token');
const GooglePlusTokenStrategy = require('passport-google-plus-token');
const passportJWT = require('passport-jwt');
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const UsersModel = require('./models/users.model');
const config = require('./configuration');

passport.use(
  new LocalStrategy(
    {
      usernameField: 'USERNAME',
      passwordField: 'PASSWORD'
    },
    function(username, password, cb) {
      //this one is typically a DB call. Assume that the returned user object is pre-formatted and ready for storing in JWT
      return UsersModel.findOne({ username, password })
        .then(users => {
          if (!users || users.length === 0) {
            return cb(null, false, {
              message: 'Incorrect email or password.'
            });
          }
          return cb(null, users[0]);
        })
        .catch(err => cb(err, false, { message: err.message }));
    }
  )
);

passport.use(
  new FacebookTokenStrategy(
    {
      clientID: config.oauth.facebook.clientID,
      clientSecret: config.oauth.facebook.clientSecret
    },
    function(accessToken, refreshToken, profile, cb) {
      console.log('facebook');
      console.log('access token', accessToken);
      console.log('profile', profile);
      UsersModel.checkIfExisted(profile.id)
        .then(users => {
          if (!users || users.length === 0) {
            var newUser = {
              USERNAME: profile.id,
              PASSWORD: 'Facebook'
            };
            UsersModel.addOne(newUser)
              .then(newUserId => {
                newUser.ID = newUserId;
                return cb(null, newUser);
              })
              .catch(err => {
                return cb(err, false, err.message);
              });
          } else {
            return cb(null, users[0]);
          }
        })
        .catch(err => {
          return cb(err, false, err.message);
        });
    }
  )
);

passport.use(
  new GooglePlusTokenStrategy(
    {
      clientID: config.oauth.google.clientID,
      clientSecret: config.oauth.google.clientSecret,
      passReqToCallback: true
    },
    function(req, accessToken, refreshToken, profile, cb) {
      console.log('google');
      console.log('access token', accessToken);
      console.log('profile', profile);
      UsersModel.checkIfExisted(profile.id)
        .then(users => {
          if (!users || users.length === 0) {
            var newUser = {
              USERNAME: profile.id,
              PASSWORD: 'Google'
            };
            UsersModel.addOne(newUser)
              .then(newUserId => {
                newUser.ID = newUserId;
                return cb(null, newUser);
              })
              .catch(err => {
                return cb(err, false, err.message);
              });
          } else {
            return cb(null, users[0]);
          }
        })
        .catch(err => {
          return cb(err, false, err.message);
        });
    }
  )
);

passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.JWT_SECRET
    },
    function(jwtPayload, done) {
      //find the user in db if needed. This functionality may be omitted if you store everything you'll need in JWT payload.
      return UsersModel.findOneById(jwtPayload.userInfo.ID)
        .then(users => {
          var userInfo = {
            ID: users[0].ID,
            USERNAME: users[0].USERNAME
          };
          return done(null, userInfo);
        })
        .catch(err => {
          return done(err);
        });
    }
  )
);

// Passport session setup.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});
