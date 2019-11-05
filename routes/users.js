var express = require('express');
var router = express.Router();
var usersController = require('../controllers/users.controller');
const passport = require('passport');
var multer = require('multer');
var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './public/images');
  },
  filename: function(req, file, cb) {
    var filetype = '';
    if (file.mimetype === 'image/gif') {
      filetype = 'gif';
    }
    if (file.mimetype === 'image/png') {
      filetype = 'png';
    }
    if (file.mimetype === 'image/jpeg') {
      filetype = 'jpg';
    }
    cb(null, 'image-' + Date.now() + '.' + filetype);
  }
});
var upload = multer({ storage: storage });

router.get('/', passport.authenticate('jwt', { session: false }), function(
  req,
  res,
  next
) {
  res.send(req.user);
});

router.post('/update', usersController.postUpdateInfo);
router.post(
  '/avatar/upload',
  upload.single('avatar'),
  usersController.postUploadAvatar
);
router.post(
  '/avatar/update',
  usersController.postUpdateAvatar
);
router.post('/update/password', usersController.postUpdatePassword);

module.exports = router;
