const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  accountId: { type: String, required: true },

  referenceType: String,   // VENDOR | CUSTOMER
  referenceId: String,

  invoiceId: String,

  type: { type: String, required: true }, // IN | OUT
  amount: { type: Number, required: true },
  paymentMode: String,    // CASH | BANK | UPI
  paymentDate: Date,

  remarks: String,

  orgId: { type: String, required: true },

  createdBy: {
    userId: String,
    name: String,
    email: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Payment', PaymentSchema);
