const mongoose = require('mongoose');
module.exports = mongoose.model('Plan', new mongoose.Schema({
  name: String,
  price: Number,
  features: [String]
}));
