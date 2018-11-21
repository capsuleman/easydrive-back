var mongoose = require('mongoose');

var VehiculeSchema = new mongoose.Schema({
    vin: String,
    manufactor: String,
    model: String,
    serialNumber: Number,
    fuel: Number,
    userGroup: String
});

module.exports = mongoose.model('Vehicule', VehiculeSchema);