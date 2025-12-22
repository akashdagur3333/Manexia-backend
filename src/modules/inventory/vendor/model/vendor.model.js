const mongoose = require('mongoose');

const VendorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: String,
  phone: String,
  address: String,
  gstNumber: String,

  orgId: { type: String, required: true },
  isDeleted: { type: Boolean, default: false },

  createdBy: {
    userId: String,
    name: String,
    email: String
  },

  deletedBy: {
    userId: String,
    name: String,
    email: String,
    deletedAt: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('Vendor', VendorSchema);
