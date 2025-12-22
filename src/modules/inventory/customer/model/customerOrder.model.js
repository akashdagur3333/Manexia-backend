const mongoose = require('mongoose');

const CustomerOrderSchema = new mongoose.Schema({
  customerId: { type: String, required: true },
  orderNumber: String,
  orderDate: Date,

  items: [{
    materialId: String,
    quantity: Number,
    rate: Number
  }],

  totalAmount: Number,
  status: { type: String, default: 'PENDING' },

  orgId: { type: String, required: true },

  createdBy: {
    userId: String,
    name: String,
    email: String
  }
}, { timestamps: true });

module.exports = mongoose.model('CustomerOrder', CustomerOrderSchema);
