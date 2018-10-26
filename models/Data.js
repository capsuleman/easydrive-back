var mongoose = require('mongoose');

var DataSchema = new mongoose.Schema({
    lat: Number,
    long: Number,
    speed: [Number],
    rpm: [Number],
    engineLoad: [Number],
    mafFlow: [Number],
    AccMaxXY: [Number],
    lacetMax: [Number],
    antenaId: Number,
    date: String
});

module.exports = mongoose.model('Data', DataSchema);