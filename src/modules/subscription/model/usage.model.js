const mongoose = require('mongoose');

const UsageSchema = new mongoose.Schema({
  orgId: String,

  feature: String,        // users, storage, transactions
  used: Number,
  limit: Number
}, { timestamps: true });

module.exports = mongoose.model('Usage', UsageSchema);
