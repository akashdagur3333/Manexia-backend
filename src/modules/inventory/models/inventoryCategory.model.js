const mongoose = require('mongoose');

const InventoryCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true ,index:true },
  description: String,

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

module.exports = mongoose.model('InventoryCategory', InventoryCategorySchema);
