var authRoute = require('../routes/auth');
var indexRoute = require('../routes/index');
var userRoute = require('../routes/users');
require('../passport');

module.exports = function(app) {
  app.use('/', indexRoute);
  app.use('/user', authRoute);
  app.use('/me', userRoute);
};
