const mongoose = require('mongoose');

const InventoryUnitSchema = new mongoose.Schema({
  name: { type: String, required: true,index:true  },     // kg, pcs, box
  symbol: String,                             // KG, PCS

  orgId: { type: String, required: true,index:true },

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

module.exports = mongoose.model('InventoryUnit', InventoryUnitSchema);
