const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  organization: { type: mongoose.Schema.Types.Mixed },
  role: {
    type: mongoose.Schema.Types.Mixed,
    require:true
  }
  , status: { type: String, default: 'ACTIVE' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
