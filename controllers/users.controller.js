const UsersModel = require('../models/users.model');
const { saltRounds } = require('../configuration');
// const bcrypt = require('bcrypt');

module.exports.postUpdateInfo = (req, res, next) => {
  //Trường hợp cập nhật thông tin cá nhân không bao gồm hình ảnh
  UsersModel.checkIfExisted(req.body.USERNAME)
    .then(users => {
      let newAvatar = '';
      if (req.body.AVATAR) {
        newAvatar = req.body.AVATAR;
      } else {
        newAvatar = users[0].AVATAR;
      }
      var updatedUser = {
        ID: users[0].ID,
        FIRSTNAME: req.body.FIRSTNAME,
        LASTNAME: req.body.LASTNAME,
        EMAIL: req.body.EMAIL,
        AVATAR: newAvatar
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

module.exports.postUploadAvatar = (req, res, next) => {
  if (!req.file) {
    res.status(403).send({
      error: {
        message: 'File is null or undefined.'
      }
    });
    return next(err);
  }
  res.status(200).json({
    fileUrl:
      'https://restfulapi-passport-jwt.herokuapp.com/images/' +
      req.file.filename
  });
};

// module.exports.postUpdateAvatar = (req, res, next) => {
//   UsersModel.checkIfExisted(req.body.USERNAME)
//     .then(users => {
//       var updatedUser = {
//         ID: users[0].ID,
//         AVATAR: req.body.AVATAR
//       };

//       UsersModel.updateOne(updatedUser)
//         .then(changedRows => {
//           res.status(200).json({
//             message: "Successfully update user's avatar.",
//             user: updatedUser
//           });
//         })
//         .catch(err => {
//           res.send({ message: "Failed to update user's avatar." });
//         });
//     })
//     .catch(err => res.send(err));
// };

// module.exports.postUpdatePassword = (req, res, next) => {
//   UsersModel.checkIfExisted(req.body.USERNAME)
//     .then(users => {
//       var currentPassword = req.body.CUR_PASSWORD;
//       var newPassword = req.body.PASSWORD;
//       var ret = bcrypt.compareSync(currentPassword, users[0].PASSWORD);
//       if (ret) {
//         var updatedUser = {
//           ID: users[0].ID,
//           PASSWORD: newPassword
//         };

//         UsersModel.updateOne(updatedUser)
//         .then(changedRows => {
//           res.status(200).json({
//             message: 'Successfully update password.',
//             user: updatedUser
//           });
//         })
//         .catch(err => {
//           res.send({ message: 'Failed to update password.' });
//         });
//       } else {
//         res.status(403).send({
//           error: {
//             message: 'Current password is incorrect. Please try again.'
//           }
//         });
//       }
//     })
//     .catch(err => res.send(err));
// };
