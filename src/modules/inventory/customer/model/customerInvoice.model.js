const mongoose = require('mongoose');

const CustomerInvoiceSchema = new mongoose.Schema(
  {
    customerId: { type: String, required: true, index: true },
    orderId: { type: String, required: true, index: true },

    invoiceNumber: { type: String, required: true, index: true },
    invoiceDate: { type: Date, required: true },

    amount: { type: Number, required: true, min: 0 },
    taxAmount: { type: Number, default: 0, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },

    paymentStatus: {
      type: String,
      enum: ['UNPAID', 'PARTIAL', 'PAID'],
      default: 'UNPAID',
      index: true
    },

    orgId: { type: String, required: true, index: true },

    isDeleted: { type: Boolean, default: false, index: true },

    createdBy: {
      userId: String,
      name: String,
      email: String
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('CustomerInvoice', CustomerInvoiceSchema);
