var VerifyToken = require('./VerifyToken');
var User = require('../models/User');

function verifyAdmin(req, res, next) {
  VerifyToken(req, res, function() {
    User.findById(req.userId, {admin: 1}).exec()
    .then(user => {
        req.isAdmin = user.admin;
        next();
    })
    .catch(_ => {return res.status(500).send('Internal error.')})
  });
}

module.exports = verifyAdmin;