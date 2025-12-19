const mongoose = require('mongoose');
module.exports = mongoose.model('Employee', new mongoose.Schema({
  orgId: mongoose.Schema.Types.ObjectId,
  name: String
}));
