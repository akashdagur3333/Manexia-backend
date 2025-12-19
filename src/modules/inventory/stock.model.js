const mongoose = require('mongoose');
module.exports = mongoose.model('Stock', new mongoose.Schema({
  orgId: mongoose.Schema.Types.ObjectId,
  name: String,
  qty: Number,
  minQty: Number
}));
