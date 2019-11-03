const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const FacebookTokenStrategy = require('passport-facebook-token');
const GooglePlusTokenStrategy = require('passport-google-plus-token');
const GoogleTokenStrategy = require('passport-google-token').Strategy;
const passportJWT = require('passport-jwt');
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const UsersModel = require('./models/users.model');
const config = require('./configuration');
const bcrypt = require('bcrypt');

passport.use(
  new LocalStrategy(
    {
      usernameField: 'USERNAME',
      passwordField: 'PASSWORD'
    },
    function(username, password, cb) {
      //this one is typically a DB call. Assume that the returned user object is pre-formatted and ready for storing in JWT
      return UsersModel.checkIfExisted(username)
        .then(users => {
          if (!users || users.length === 0) {
            return cb(null, false, {
              message: 'Incorrect username.'
            });
          }

          var user = users[0];
          var ret = bcrypt.compareSync(password, users[0].PASSWORD);
          if (ret) {
            return cb(null, user);
          }

          return cb(null, false, {
            message: 'Incorrect password.'
          });
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
              PASSWORD: profile.provider,
              FIRSTNAME: profile.name.givenName,
              LASTNAME: profile.name.familyName + ' ' + profile.name.middleName,
              AVATAR: profile.photos[0].value,
              EMAIL: profile.emails[0].value
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
              PASSWORD: profile.provider,
              FIRSTNAME: profile.name.givenName,
              LASTNAME: profile.name.familyName,
              AVATAR: profile._json.picture,
              EMAIL: profile.emails[0].value
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
  new GoogleTokenStrategy(
    {
      clientID: config.oauth.google.clientID,
      clientSecret: config.oauth.google.clientSecret
    },
    function(accessToken, refreshToken, profile, cb) {
      console.log('google');
      console.log('access token', accessToken);
      console.log('profile', profile);
      UsersModel.checkIfExisted(profile.id)
        .then(users => {
          if (!users || users.length === 0) {
            var newUser = {
              USERNAME: profile.id,
              PASSWORD: profile.provider,
              FIRSTNAME: profile.name.givenName,
              LASTNAME: profile.name.familyName,
              AVATAR: profile._json.picture,
              EMAIL: profile.emails[0].value
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
          return done(null, users[0]);
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
