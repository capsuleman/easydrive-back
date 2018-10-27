var express = require('express');
var router = express.Router();
var Archive = require('../models/Archive');
var Data = require('../models/Data');
var config = require('../config');


router.post('/', function (req, res) {
    if (!Boolean(req.headers['keyhead']) || req.headers.keyhead !== config.cred.keyhead) return res.status(418).send();
    if (!req.body) return res.status(400).send();
    Archive.create(req.body)
    .then(data => {
        if (data.type !== 'uplink') return;

        var dataClear = {}
        
        const payload = data.payload_cleartext;
        dataClear.lat   = parseInt(payload.substring(0, 8), 16)/1e6;
        dataClear.long  = parseInt(payload.substring(8, 16), 16)/1e6;
        dataClear.speed         = [];
        dataClear.rpm           = [];
        dataClear.engineLoad    = [];
        dataClear.mafFlow       = [];
        dataClear.AccMaxXY      = [];
        dataClear.lacetMax      = [];
        for (i = 0; i < 5; i++) {
            dataClear.speed.push(parseInt(payload.substring(16 + 2*i, 18 + 2*i), 16));
            dataClear.rpm.push(parseInt(payload.substring(26 + 2*i, 28 + 2*i), 16) << 5);
            dataClear.engineLoad.push(parseInt(payload.substring(36 + 2*i, 38 + 2*i), 16));
            dataClear.mafFlow.push(parseInt(payload.substring(36 + 2*i, 38 + 2*i), 16) << 2);
            dataClear.AccMaxXY.push(parseInt(payload.substring(46 + 2*i, 48 + 2*i), 16));
            dataClear.lacetMax.push(parseInt(payload.substring(56 + 2*i, 58 + 2*i), 16));
        };
        dataClear.antenaId = data.device_id;
        dataClear.date = data.timestamp;
        dataClear.archive = data._id;

        return Data.create(dataClear);
    })
    .then(_ => {return res.status(200).send()})
    .catch(_ => {return res.status(500).send()});
});
  
module.exports = router;