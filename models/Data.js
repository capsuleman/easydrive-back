var mongoose = require('mongoose');

var DataSchema = new mongoose.Schema({
    sentDate: Date,
    recepDate: Date,
    lat: Number,
    long: Number,
    speed: [Number],
    rpm: [Number],
    engineLoad: [Number],
    accMaxXY: [Number],
    lacetMax: [Number],
    timestamp: [Date],
    antenna: Number,
    ride: String,
    archive: String
});

module.exports = mongoose.model('Data', DataSchema);