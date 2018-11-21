var express = require('express');
var router = express.Router();
var Archive = require('../models/Archive');
var Data = require('../models/Data');
var Vehicule = require('../models/Vehicule');
var Ride = require('../models/Ride');
var UsersGroup = require('../models/UsersGroup');
var config = require('../config');
var https = require('https');


router.post('/', function (req, res, next) {
    if (!Boolean(req.headers['keyhead']) || req.headers.keyhead !== config.cred.keyhead) return res.status(418).send();
    if (!req.body) return res.status(400).send();
    Promise.all([
        Archive.create(req.body),
        UsersGroup.findOne({listAntenna: {$all: [req.body.device_id]}})
    ])
    .then(result => {
        [data, group] = result;
        if (data.type !== 'uplink') return;
        const payload = data.payload_cleartext;
        const dataType = parseInt(payload.substring(0, 2), 16);

        switch (dataType) {
            case 0:
                var vehicule = {};
                vehicule.vin = '';
                for (i = 2; i < 36; i += 2) {
                    vehicule.vin += String.fromCharCode(parseInt(payload.substring(i, i+2), 16));
                }
                vehicule.manufactor = vehicule.vin.substring(1, 3);
                vehicule.model = vehicule.vin.substring(3, 8);
                vehicule.serialNumber = vehicule.vin.substring(11, 17);
                vehicule.fuel = parseInt(payload.substring(36, 38), 16);
                vehicule.userGroup = group._id;

                return Vehicule.findOne(vehicule).exec()
                .then(vehc => {
                    if (vehc) return vehc;
                    sendDataToEasyBot(vehicule);
                    return Vehicule.create(vehicule);
                })
                .then(vehicule => {
                    ride = {};
                    ride.listData = [];
                    ride.vehicule = vehicule._id;
                    ride.antenna = data.device_id;
                    ride.groupUser = group._id;
                    ride.firstData = data._id;
                    ride.begin = new Date(data.timestamp);
                    return Ride.create(ride);
                })
                     
            case 1:
                return Ride.findOne({antenna: data.device_id}, {}, {sort: {begin: -1}})
                .then(ride => {
                    var dataClear = {};
                    timestamp = parseInt(payload.substring(2, 10), 16);
    
                    dataClear.sentDate = new Date(timestamp * 1000);
                    dataClear.recepDate = data.timestamp;
                    dataClear.lat   = parseInt(payload.substring(10, 18), 16)*1e-6;
                    dataClear.long  = parseInt(payload.substring(18, 26), 16)*1e-6;
                    dataClear.speed = [];
                    dataClear.rpm = [];
                    dataClear.engineLoad = [];
                    dataClear.accMaxXY = [];
                    dataClear.lacetMax = [];
                    dataClear.timestamp = [];
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
                    dataClear.ride = ride._id;

                    return Data.create(dataClear).then(data => {return [data, ride]})
                })
                .then(result => {
                    [data, ride] = result;
                    ride.listData.push(data._id);
                    return ride.save();
                })
            
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