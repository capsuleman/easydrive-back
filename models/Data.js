var mongoose = require('mongoose');

var DataSchema = new mongoose.Schema({
    profile: String, 
    payload_encrypted: String, 
    group: String, 
    protocol_data: {
      noise: mongoose.Schema.Types.Decimal128, 
      AppNonce: String, 
      NetID: String, 
      signal: mongoose.Schema.Types.Decimal128, 
      DevAddr: String, 
      best_gateway_id: String, 
      sf: Number, 
      lora_version: Number, 
      DevNonce: String, 
      snr: mongoose.Schema.Types.Decimal128, 
      gateways: Number, 
      rssi: Number, 
      port: Number
    }, 
    timestamp: String, 
    profile_id: Number, 
    geolocation_precision: Number, 
    lat: mongoose.Schema.Types.Decimal128, 
    device_properties: {
      appeui: String, 
      external_id: String, 
      deveui: String
    }, 
    city_name: String, 
    delivered_at: String, 
    payload_cleartext: String, 
    geolocation_type: String, 
    lng: mongoose.Schema.Types.Decimal128, 
    group_id: Number, 
    type: String, 
    id: String, 
    city_code: String, 
    device_id: Number
});

module.exports = mongoose.model('Data', DataSchema);