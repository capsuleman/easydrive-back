var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({  
  firstName: {
    type: String,
    required: true,
    maxlength: 36
  },
  lastName: {
    type: String,
    required: true,
    maxlength: 36
  },
  email: {
    type: String,
    required: function() {
      return this.email.indexOf('@') > -1
    },
    maxlength: 72
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  admin: Boolean,
  listUsersGroup: [String],
  listRide: [String]
  
});

module.exports = mongoose.model('User', UserSchema);