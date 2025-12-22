const mongoose = require('mongoose');

const MaterialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,

  categoryId: String,
  unitId: String,
  quantityId: String,

  reorderLevel: Number,

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

module.exports = mongoose.model('Material', MaterialSchema);
