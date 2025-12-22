const mongoose = require('mongoose');

const InventoryQuantitySchema = new mongoose.Schema({
  name: { type: String, required: true }, // Low / Medium / High
  minValue: Number,
  maxValue: Number,

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

module.exports = mongoose.model('InventoryQuantity', InventoryQuantitySchema);
