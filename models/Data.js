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
    antenna: Number,
    date: String,
    archive: String
});

module.exports = mongoose.model('Data', DataSchema);