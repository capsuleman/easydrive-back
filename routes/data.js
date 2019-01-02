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

router.get('/:id', VerifyToken, function(req, res) {
    Promise.all([
        User.findById(req.userId).exec(),
        Data.findById(req.params.id).exec()
    ])
    .catch(_ => {return res.status(404).send('This data does not exist.')})
    .then(result => {
        [user, data] = result;
        if (!user.admin) return res.status(401).send('You must be admin of the data.');
            res.status(200).json(data);
    })
    .catch(_ => {return res.status(500).send('There was a problem getting the data.')})
});



router.get('/length', VerifyAdmin, function(req, res) {
    if (!req.isAdmin) return res.status(401).send('Only for admin team.');
    Data.countDocuments().exec()
    .then(len => {return res.status(200).send(String(len))})
    .catch(_ => {return res.status(500).send('Internal error.')});
});

module.exports = router;