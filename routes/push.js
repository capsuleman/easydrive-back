var express = require('express');
var router = express.Router();
var Archive = require('../models/Archive');
var Data = require('../models/Data');
var config = require('../config');
var https = require('https');


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
        dataClear.antenna = data.device_id;
        dataClear.date = data.timestamp;
        dataClear.archive = data._id;
        console.log(1, dataClear);

        return Data.create(dataClear);
    })
    .then(data => {
        console.log(2, data);
        if (data) sendDataToEasyBot(data);
        return res.status(200).send();
    })
    .catch(err => {
        sendDataToEasyBot(err);
        return res.status(500).send();
    });
});

function sendDataToEasyBot(data) {
    config.tg.chatIDs.map(function(chatID) {
        var body = {
            'chat_id': chatID,
            'text': JSON.stringify(data, null, '\t'),

        }
        body = JSON.stringify(body);
        var options = {
            host: 'api.telegram.org',
            path: '/bot'+config.tg.token+'/sendMessage',
            port: 443,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body)
            }
        };
        request = https.request(options);

        request.write(body);
        request.end();
    })
}

module.exports = router;