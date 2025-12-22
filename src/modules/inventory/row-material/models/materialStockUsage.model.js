const mongoose = require('mongoose');

const MaterialStockUsageSchema = new mongoose.Schema({
  materialId: String,
  warehouseId: String,

  quantity: Number,
  type: { type: String, enum: ['IN', 'OUT'], required: true },

  referenceType: String, // order, production, damage
  referenceId: String,

  remarks: String,

  orgId: { type: String, required: true },

  createdBy: {
    userId: String,
    name: String,
    email: String
  }
}, { timestamps: true });

module.exports = mongoose.model('MaterialStockUsage', MaterialStockUsageSchema);
