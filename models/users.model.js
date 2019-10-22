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
  return db.add('users', user);
};
