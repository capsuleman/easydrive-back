var express = require('express');
var router = express.Router();
var Data = require('../models/Data');
var VerifyAdmin = require('../middleware/VerifyAdmin');

router.get('/', VerifyAdmin, function(req, res) {
    if (!req.isAdmin) return res.status(401).send('Only for admin team.');
    options = {sort: 'timestamp'};
    if (req.query.limit) options.limit = Number(req.query.limit);
    if (req.query.skip) options.skip = Number(req.query.skip);
    Data.find({}, null, options).exec()
    .then(data => {return res.status(200).json(data)})
    .catch(_ => {return res.status(500).send('Internal error.')})
});

router.get('/length', VerifyAdmin, function(req, res) {
    if (!req.isAdmin) return res.status(401).send('Only for admin team.');
    Data.countDocuments().exec()
    .then(len => {return res.status(200).send(String(len))})
    .catch(_ => {return res.status(500).send('Internal error.')});
});

module.exports = router;