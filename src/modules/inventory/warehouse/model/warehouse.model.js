const mongoose = require('mongoose');

const WarehouseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: String,
  location: String,
  managerName: String,
  contactNumber: String,

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

module.exports = mongoose.model('Warehouse', WarehouseSchema);
