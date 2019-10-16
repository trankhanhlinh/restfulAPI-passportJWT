const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const passportJWT = require('passport-jwt');
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const UsersModel = require('./models/users.model');

passport.use(
  new LocalStrategy(
    {
      usernameField: 'USERNAME',
      passwordField: 'PASSWORD'
    },
    function(username, password, done) {
      //this one is typically a DB call. Assume that the returned user object is pre-formatted and ready for storing in JWT
      return UsersModel.findOne({ username, password })
        .then(user => {
          if (!user) {
            return done(null, false, {
              message: 'Incorrect email or password.'
            });
          }
          return done(null, user[0], { message: 'Logged In Successfully' });
        })
        .catch(err => done(err));
    }
  )
);

passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'your_jwt_secret'
    },
    function(jwtPayload, done) {
      //find the user in db if needed. This functionality may be omitted if you store everything you'll need in JWT payload.
      return UsersModel.findOneById(jwtPayload.ID)
        .then(user => {
          return done(null, user);
        })
        .catch(err => {
          return done(err);
        });
    }
  )
);
