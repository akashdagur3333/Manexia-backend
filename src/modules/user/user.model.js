const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  orgId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  status: { type: String, default: 'ACTIVE' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
