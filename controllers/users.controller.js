const UsersModel = require('../models/users.model');
const { saltRounds } = require('../configuration');
const bcrypt = require('bcrypt');

module.exports.postUpdateInfo = (req, res, next) => {
  //Trường hợp cập nhật thông tin cá nhân không bao gồm hình ảnh
  UsersModel.checkIfExisted(req.body.USERNAME)
    .then(users => {
      var updatedUser = {
        ID: users[0].ID,
        FIRSTNAME: req.body.FIRSTNAME,
        LASTNAME: req.body.LASTNAME,
        EMAIL: req.body.EMAIL
      };

      UsersModel.updateOne(updatedUser)
        .then(changedRows => {
          res.status(200).json({
            message: 'Successfully update user.',
            user: updatedUser
          });
        })
        .catch(err => {
          res.send({ message: 'Failed to update user.' });
        });
    })
    .catch(err => res.send(err));
};

module.exports.postUpdateAvatar = (req, res, next) => {
  if (!req.file) {
    res.status(403).json({
      message: 'File is null or undefined.'
    });
    return next(err);
  }
  res.status(200).json({
    fileUrl:
      'https://restfulapi-passport-jwt.herokuapp.com/images/' +
      req.file.filename
  });
};
