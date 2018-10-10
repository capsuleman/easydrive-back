var express = require('express');
var router = express.Router();
var Data = require('../models/Data');
var config = require('../config');


router.post('/', function (req, res, next) {
    if (req.headers['keyhead'] == config.cred.keyhead) {
        Data.create(req.body, function (err, data) {
            if (err) return next(err);
            res.status(200);
            res.render('resp', { message: '200 OK' });
        })    
    } else {
        res.status(401);
        res.render('resp', { message: '401 Unauthorized' });
    }
});

router.get('/', function(req, res, next) {
    if (req.headers['keyhead'] == config.cred.getmdp) {
        Data.find(function (err, data) {
            if (err) return next(err);
            res.status(200);
            res.json(data);
        });
    } else {
        res.status(401);
        res.render('resp', { message: '401 Unauthorized' });
    };
});
  
router.get('/:type', function(req, res, next) {
    if (req.headers['keyhead'] == config.cred.getmdp) {
        Data.find({type: req.params.type}, function (err, data) {
            if (err) return next(err);
            res.json(data);
        });
    } else {
        res.status(401);
        res.render('resp', { message: '401 Unauthorized' });
    }
});
  
module.exports = router;