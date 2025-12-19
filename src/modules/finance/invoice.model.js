const mongoose = require('mongoose');
module.exports = mongoose.model('Invoice', new mongoose.Schema({
  orgId: mongoose.Schema.Types.ObjectId,
  amount: Number,
  status: String
}));
