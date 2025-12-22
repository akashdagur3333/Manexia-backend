const mongoose = require('mongoose');

const CustomerInvoiceSchema = new mongoose.Schema({
  customerId: String,
  orderId: String,
  invoiceNumber: String,
  invoiceDate: Date,

  amount: Number,
  taxAmount: Number,
  totalAmount: Number,

  paymentStatus: { type: String, default: 'UNPAID' },

  orgId: { type: String, required: true },

  createdBy: {
    userId: String,
    name: String,
    email: String
  }
}, { timestamps: true });

module.exports = mongoose.model('CustomerInvoice', CustomerInvoiceSchema);
