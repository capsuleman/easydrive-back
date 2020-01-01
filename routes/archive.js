var express = require('express');
var router = express.Router();
var Archive = require('../models/Archive');
var VerifyAdmin = require('../middleware/VerifyAdmin');

router.get('/', VerifyAdmin, function(req, res) {
    if (!req.isAdmin) return res.status(401).send('Only for admin team.');
    options = {sort: 'timestamp'};
    if (req.query.limit) options.limit = Number(req.query.limit);
    if (req.query.skip) options.skip = Number(req.query.skip);
    Archive.find({}, null, options).exec()
    .then(data => {return res.status(200).json(data)})
    .catch(_ => {return res.status(500).send('Internal error.')})
});

router.get('/length', VerifyAdmin, function(req, res) {
    if (!req.isAdmin) return res.status(401).send('Only for admin team.');
    Archive.countDocuments().exec()
    .then(len => {return res.status(200).send(String(len))})
    .catch(_ => {return res.status(500).send('Internal error.')});
});

router.get('/:type', VerifyAdmin, function(req, res) {
    if (['join', 'uplink', 'downlink'].indexOf(req.params.type) === -1) return res.status(404).send(`No data of type ${req.params.type}.`);
    if (!req.isAdmin) return res.status(401).send('Only for admin team.');
    options = {};
    if (req.query.limit) options.limit = Number(req.query.limit);
    if (req.query.skip) options.skip = Number(req.query.skip);
    Archive.find({type: req.params.type}, null, options).exec()
    .then(data => {return res.status(200).json(data)})
    .catch(_ => {return res.status(500).send('Internal error.')});
});

router.get('/length/:type', VerifyAdmin, function(req, res) {
    if (['join', 'uplink', 'downlink'].indexOf(req.params.type) === -1) return res.status(404).send(`No data of type ${req.params.type}.`);
    if (!req.isAdmin) return res.status(401).send('Only for admin team.');
    Archive.countDocuments({type: req.params.type}).exec()
    .then(len => {return res.status(200).send(String(len))})
    .catch(_ => {return res.status(500).send('Internal error.')});
});


module.exports = router;