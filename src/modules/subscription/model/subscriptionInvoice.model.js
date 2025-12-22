const mongoose = require('mongoose');

const SubscriptionInvoiceSchema = new mongoose.Schema({
  orgId: String,
  subscriptionId: String,

  invoiceNumber: String,
  invoiceDate: Date,

  amount: Number,
  taxAmount: Number,
  totalAmount: Number,

  paymentStatus: { type: String, default: 'UNPAID' }
}, { timestamps: true });

module.exports = mongoose.model('SubscriptionInvoice', SubscriptionInvoiceSchema);
