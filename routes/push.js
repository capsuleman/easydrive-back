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
        const payload = data.payload_cleartext;
        const dataType = parseInt(payload.substring(0, 2), 16);
        
        switch (dataType) {
            case 0:
                return res.status(501).send();
            
            case 1:
                var dataClear = {}
                timestamp = parseInt(payload.substring(2, 10), 16);

                dataClear.sentDate = new Date(timestamp * 1000);
                dataClear.recepDate = data.timestamp;
                dataClear.lat   = parseInt(payload.substring(10, 18), 16)/1e6;
                dataClear.long  = parseInt(payload.substring(18, 26), 16)/1e6;
                dataClear.speed         = [];
                dataClear.rpm           = [];
                dataClear.engineLoad    = [];
                dataClear.accMaxXY      = [];
                dataClear.lacetMax      = [];
                dataClear.timestamp     = [];
                for (i = 0; i < 5; i++) {
                    dataClear.speed.push(parseInt(payload.substring(26 + 2*i, 28 + 2*i), 16));
                    dataClear.rpm.push(parseInt(payload.substring(36 + 2*i, 38 + 2*i), 16) << 5);
                    dataClear.engineLoad.push(parseInt(payload.substring(46 + 2*i, 48 + 2*i), 16));
                    dataClear.accMaxXY.push(parseInt(payload.substring(56 + 2*i, 58 + 2*i), 16));
                    dataClear.lacetMax.push(parseInt(payload.substring(66 + 2*i, 68 + 2*i), 16));
                    dataClear.timestamp.push(new Date((timestamp + parseInt(payload.substring(76 + 2*i, 78 + 2*i), 16)) * 1000));
                };
                dataClear.antenna = data.device_id;
                dataClear.archive = data._id;
        
                return Data.create(dataClear);
            
            default:
                return res.status(501).send();
        }


    })
    .then(data => {
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