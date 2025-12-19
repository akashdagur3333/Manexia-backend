const mongoose = require('mongoose');
module.exports = mongoose.model('Subscription', new mongoose.Schema({
  orgId: mongoose.Schema.Types.ObjectId,
  planId: mongoose.Schema.Types.ObjectId,
  active: Boolean,
  endDate: Date
}));
