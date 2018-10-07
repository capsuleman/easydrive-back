var express = require('express');
var router = express.Router();
var Data = require('../models/Data');


router.post('/', function (req, res, next) {
    console.log(req.body);
    Data.create(req.body, function (err, data) {
        if (err) return next(err);
        res.render('resp', { message: '200 OK' });
    })
});

router.get('/', function(req, res, next) {
    Data.find(function (err, data) {
        if (err) return next(err);
        res.json(data);
    });
  });
  
router.get('/:type', function(req, res, next) {
    Data.find({type: req.params.type}, function (err, data) {
        if (err) return next(err);
        console.log(req);
        res.json(data);
    });
  });
  
module.exports = router;