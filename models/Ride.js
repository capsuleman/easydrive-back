var mongoose = require('mongoose');  
var RideSchema = new mongoose.Schema({  
  listData: [String],
  vehicule: String,
  antenna: String,
  groupUser: String,
  user: String,
  firstData: String,
  begin: Date
  
});
module.exports = mongoose.model('Ride', RideSchema);