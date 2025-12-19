const mongoose = require('mongoose');
module.exports = mongoose.model('Document', new mongoose.Schema({
  orgId: mongoose.Schema.Types.ObjectId,
  name: String,
  path: String
}));
