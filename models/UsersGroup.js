var mongoose = require('mongoose');  

var UsersGroupSchema = new mongoose.Schema({  
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 36
  },
  type: {
      type: String,
      required: true,
      enum: ['enterprise', 'family']
  },
  listAdmin: [String],
  listUser: [String],
  listRide: [String],
  listVehicule: [String],
  listAntenna: [String]
  
});
mongoose.model('UsersGroup', UsersGroupSchema);

module.exports = mongoose.model('UsersGroup');