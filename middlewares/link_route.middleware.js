var authRoute = require('../routes/auth');
var indexRoute = require('../routes/index');
var userRoute = require('../routes/users');
const passport = require('passport');
require('../passport');

module.exports = function(app) {
  app.use('/', indexRoute);
  app.use('/user', authRoute);
  app.use('/me', passport.authenticate('jwt', { session: false }), userRoute);
};
