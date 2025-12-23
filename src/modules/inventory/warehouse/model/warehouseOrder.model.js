const mongoose = require('mongoose');

const WarehouseOrderSchema = new mongoose.Schema({
  fromWarehouseId: String,
  toWarehouseId: String,

  orderNumber: String,
  orderDate: Date,

  items: [{
    materialId: String,
    quantity: Number
  }],

  status: {
    type: String,
    default: 'PENDING'
  },

  orgId: { type: String, required: true },

  createdBy: {
    userId: String,
    name: String,
    email: String
  }
}, { timestamps: true });

module.exports = mongoose.model('WarehouseOrder', WarehouseOrderSchema);
