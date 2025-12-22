const mongoose = require('mongoose');

const BillingHistorySchema = new mongoose.Schema({
  orgId: String,
  invoiceId: String,

  paymentDate: Date,
  amount: Number,
  paymentMode: String, // CARD | UPI | BANK

  transactionId: String
}, { timestamps: true });

module.exports = mongoose.model('BillingHistory', BillingHistorySchema);
