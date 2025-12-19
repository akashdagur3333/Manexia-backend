const mongoose = require('mongoose');
module.exports = mongoose.model('Role', new mongoose.Schema({
  name: String,
  permissions: [String],
  orgId: mongoose.Schema.Types.ObjectId
}));
