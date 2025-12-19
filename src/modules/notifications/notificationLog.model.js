const mongoose = require('mongoose');
module.exports = mongoose.model('NotificationLog', new mongoose.Schema({
  orgId: mongoose.Schema.Types.ObjectId,
  type: String,
  message: String
}));
