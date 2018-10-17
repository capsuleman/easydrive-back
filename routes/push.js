var express = require('express');
var router = express.Router();
var Data = require('../models/Data');
var User = require('../models/User');
var config = require('../config');
var VerifyToken = require('../middleware/VerifyToken');


router.post('/', function (req, res, next) {
    if (req.headers['keyhead'] == config.cred.keyhead) {
        Data.create(req.body, function (err, data) {
            if (err) return next(err);
            res.status(200).render('resp', { message: '200 OK' });
        })    
    } else {
        res.status(401).render('resp', { message: '401 Unauthorized' });
    }
});

router.get('/', VerifyToken, function(req, res, next) {
    User.findById(req.userId, function(err, user) {
        if (user.admin) {
            Data.find(function (err, data) {
                if (err) return next(err);
                res.status(200).json(data);
            });
        } else {
            res.status(401).render('resp', { message: '401 Unauthorized' });
        };    
    });
});
  
router.get('/:type', VerifyToken, function(req, res, next) {
    if (!(req.params.type in ['join', 'uplink', 'downlink'])) return res.status(404).render('resp', { message: '404 Not found' });
    User.findById(req.userId, function(err, user) {
        if (user.admin) {
            Data.find({type: req.params.type}, function (err, data) {
                if (err) return next(err);
                res.status(200).json(data);
            });
        } else {
            res.status(401).render('resp', { message: '401 Unauthorized' });
        };
    });
});
  
module.exports = router;