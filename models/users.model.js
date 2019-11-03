var db = require('../utils/db');

module.exports.findOne = user => {
  return db.load(
    `SELECT *
    FROM users
    WHERE USERNAME = '${user.username}' AND PASSWORD = '${user.password}'`
  );
};

module.exports.checkIfExisted = username => {
  return db.load(
    `SELECT *
    FROM users
    WHERE USERNAME = '${username}'`
  );
};

module.exports.findOneById = userId => {
  return db.load(`SELECT * FROM users WHERE ID = ${userId}`);
};

module.exports.addOne = user => {
  user.CREATED = getDateNow();
  return db.add('users', user);
};

//Hàm trả về thời gian hiện tại
function getDateNow() {
  var today = new Date();
  var dd = today.getDate();

  var mm = today.getMonth() + 1;
  var yyyy = today.getFullYear();
  if (dd < 10) {
    dd = '0' + dd;
  }

  if (mm < 10) {
    mm = '0' + mm;
  }
  today = yyyy + '-' + mm + '-' + dd;
  return today;
}
