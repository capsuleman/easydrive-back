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

router.post('/register', function (req, res) {

    User.find({email: req.body.email}, function(err, user) {

        if (user.length !== 0) return res.status(409).send('email is already registered.');

        var hashedPassword = bcrypt.hashSync(req.body.password, 8);

        User.create({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: hashedPassword,
            admin: false,
            listGroupUsers: [],
            listRide: []
        },
            function (err, user) {
                if (err) return res.status(500).send('There was a problem registering the user.');
    
                // create a token
                var token = jwt.sign({ id: user._id }, config.cred.authsecret, {
                    expiresIn: 86400 // expires in 24 hours
                });
    
                res.status(201).send({ auth: true, token: token });
            });
    
    });

});

router.get('/me', VerifyToken, function (req, res, next) {

    User.findById(req.userId, { password: 0 }, function (err, user) {
        if (err) return res.status(500).send('There was a problem finding the user.');
        if (!user) return res.status(404).send('No user found.');

        res.status(200).send(user);
    });

});


router.post('/login', function (req, res) {

    User.findOne({ email: req.body.email }, function (err, user) {

        if (err) return res.status(500).send('Error on the server.');
        if (!user) return res.status(404).send('No user found.');

        var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
        if (!passwordIsValid) return res.status(401).send({ auth: false, token: null });

        var token = jwt.sign({ id: user._id }, config.cred.authsecret, {
            expiresIn: 86400 // expires in 24 hours
        });

        res.status(200).send({ auth: true, token: token });
    });

});


router.post('/setadmin', VerifyToken, function(req, res, next) {
    if (!req.body.email) return res.status(418).send('Not email provided.');
    User.findById(req.userId, function(err, user) {
        if (!user) return res.status(401).render('resp', { message: '401 Unauthorized' });
        if (user.admin) {
            User.findOne({email: req.body.email}, function (err, newadmin) {
                if (err) return res.status(500).send('500 Internal error.');
                newadmin.admin = true;
                User.findOneAndUpdate({_id: newadmin._id}, newadmin, function(err, data) {
                    if (err) return res.status(500).send('500 Internal error.');
                    res.status(200).render('resp', { message: '200 Ok' });
                });
            });
        } else {
            res.status(401).render('resp', { message: '401 Unauthorized' });
        };    
    });
});

router.post('/deladmin', VerifyToken, function(req, res, next) {
    if (!req.body.email) return res.status(418).send('Not email provided.');
    User.findById(req.userId, function(err, user) {
        if (!user) return res.status(401).render('resp', { message: '401 Unauthorized' });
        if (user.admin) {
            User.findOne({email: req.body.email}, function (err, oldadmin) {
                if (err) return res.status(500).send('500 Internal error.');
                if (req.userId == oldadmin._id) return res.status(418).render('resp', { message : '418 You can not delete your admin rights.'});
                oldadmin.admin = false;
                User.findOneAndUpdate({_id: oldadmin._id}, oldadmin, function(err, data) {
                    if (err) return res.status(500).send('500 Internal error.');
                    res.status(200).render('resp', { message: '200 Ok' });
                });
            });
        } else {
            res.status(401).render('resp', { message: '401 Unauthorized' });
        };    
    });
});

module.exports = router;