var mongoose = require('mongoose');  
var RideSchema = new mongoose.Schema({  
  listData: [String],
  vehicule: String,
  antenna: String,
  groupUser: String,
  user: String,
  firstData: String
  
});
mongoose.model('RideSchema', RideSchema);

module.exports = mongoose.model('RideSchema');