const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
  name: String,
  status: { type: String, default: 'ACTIVE' }
}, { timestamps: true });

module.exports = mongoose.model('Organization', organizationSchema);
