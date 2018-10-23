var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
var User = require('../models/User');

var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var config = require('../config');
var VerifyToken = require('../middleware/VerifyToken');

// REGISTER NEW USER
// Everybody can create an account.
// Returns a JWT.
router.post('/register', function (req, res) {
    User.findOne({email: req.body.email}).exec()
    .then(user => {
        if (user) return res.status(409).send('email is already registered.');
        var hashedPassword = bcrypt.hashSync(req.body.password, 8);
        return User.create({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: hashedPassword,
            admin: false,
            listGroupUsers: [],
            listRide: []
        })
    })
    .then(user => {
        var token = jwt.sign({ id: user._id }, config.cred.authsecret, {
            expiresIn: 86400 // expires in 24 hours
        });
        return res.status(201).send({ auth: true, token: token });
    })
    .catch(_ => {return res.status(500).send('There was a problem registering the user.')})
});

// ACCESS TO USER INFORMATION
// Only the connected user can access to it.
router.get('/me', VerifyToken, function (req, res) {
    User.findById(req.userId, { password: 0 }).exec()
    .then(user => {
        if (!user) return res.status(404).send('No user found.');
        res.status(200).send(user);
    })
    .catch(_ => {return res.status(500).send('There was a problem finding the user.')});
});

// LOGIN ROUTE
// email and password are required.
// Returns a JWT.
router.post('/login', function (req, res) {
    User.findOne({ email: req.body.email }).exec()
    .then(user => {
        if (!user) return res.status(404).send('No user found.');

        var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
        if (!passwordIsValid) return res.status(401).send({ auth: false, token: null });

        var token = jwt.sign({ id: user._id }, config.cred.authsecret, {
            expiresIn: 86400 // expires in 24 hours
        });
        res.status(200).send({ auth: true, token: token });
    })
    .catch(_ => {return res.status(500).send('Error on the server.')})
});

// PROMOTING USER TO ADMIN
// Only an admin can do it.
router.post('/setadmin', VerifyToken, function(req, res) {
    if (!req.body.email) return res.status(418).send('No email provided.');
    Promise.all([
        User.findById(req.userId).exec(),
        User.findOne({email: req.body.email}).exec()
    ])
    .then(result => {
        [admin, newadmin] = result;
        if (!newadmin) return res.status(404).send('No user found.');
        if (admin.admin) {
            newadmin.admin = true;
            return newadmin.save();
        } else {
            res.status(401).send('Only admin can promote a new admin.');
        }
    })
    .then(_ => res.status(200).send('Admin promoted.'))
    .catch(_ => {return res.status(500).send('500 Internal error.')})
});

// REMOVING ADMIN RIGHTS
// Only an admin can do it.
// An admin can not remove it admin rights.
router.post('/deladmin', VerifyToken, function(req, res, next) {
    if (!req.body.email) return res.status(418).send('No email provided.');
    Promise.all([
        User.findById(req.userId).exec(),
        User.findOne({email: req.body.email}).exec()
    ])
    .then(result => {
        [admin, oldadmin] = result;
        if (!oldadmin) return res.status(404).send('No user found.');
        if (user.admin) {
            if (admin._id == oldadmin._id) return res.status(418).render('You can not delete your admin rights.');
                oldadmin.admin = false;
                return oldadmin.save();
        } else {
            res.status(401).send('Only admin can remove an admin.');
        }
    })
    .then(_ => res.status(200).send('Admin removed.'))
    .catch(_ => {return res.status(500).send('500 Internal error.')})
});

module.exports = router;