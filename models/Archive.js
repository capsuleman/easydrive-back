var mongoose = require('mongoose');

var ArchiveSchema = new mongoose.Schema({
    profile: String, 
    payload_encrypted: String, 
    group: String, 
    protocol_data: {
      noise: Number, 
      AppNonce: String, 
      NetID: String, 
      signal: Number, 
      DevAddr: String, 
      best_gateway_id: String, 
      sf: Number, 
      lora_version: Number, 
      DevNonce: String, 
      snr: Number, 
      gateways: Number, 
      rssi: Number, 
      port: Number
    }, 
    timestamp: String, 
    profile_id: Number, 
    geolocation_precision: Number, 
    lat: Number, 
    device_properties: {
      appeui: String, 
      external_id: String, 
      deveui: String
    }, 
    city_name: String, 
    delivered_at: String, 
    payload_cleartext: String, 
    geolocation_type: String, 
    lng: Number, 
    group_id: Number, 
    type: String, 
    id: String, 
    city_code: String, 
    device_id: Number
});

module.exports = mongoose.model('Archive', ArchiveSchema);