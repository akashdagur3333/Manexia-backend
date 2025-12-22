const mongoose = require('mongoose');

const MaterialStockSchema = new mongoose.Schema({
  materialId: { type: String, required: true },
  warehouseId: { type: String, required: true },

  availableQty: { type: Number, default: 0 },
  reservedQty: { type: Number, default: 0 },

  orgId: { type: String, required: true },
  isDeleted: { type: Boolean, default: false },

  createdBy: {
    userId: String,
    name: String,
    email: String
  }
}, { timestamps: true });

module.exports = mongoose.model('MaterialStock', MaterialStockSchema);
