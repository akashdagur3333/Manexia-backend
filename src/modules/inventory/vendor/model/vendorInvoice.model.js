const mongoose = require('mongoose');

const VendorInvoiceSchema = new mongoose.Schema(
  {
    // 🔹 Relations (STRING IDs)
    vendorId: {
      type: String,
      required: true,
      index: true
    },

    orderId: {
      type: String,
      required: true,
      index: true
    },

    // 🔹 Invoice Details
    invoiceNumber: {
      type: String,
      required: true,
      index: true
    },

    invoiceDate: {
      type: Date,
      required: true
    },

    // 🔹 Amounts
    amount: {
      type: Number,
      required: true,
      min: 0
    },

    taxAmount: {
      type: Number,
      default: 0,
      min: 0
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },

    // 🔹 Payment
    paymentStatus: {
      type: String,
      enum: ['UNPAID', 'PARTIAL', 'PAID'],
      default: 'UNPAID',
      index: true
    },

    paymentDate: {
      type: Date
    },

    // 🔹 Organization
    orgId: {
      type: String,
      required: true,
      index: true
    },

    // 🔹 Soft Delete (IMPORTANT for finance)
    isDeleted: {
      type: Boolean,
      default: false,
      index: true
    },

    // 🔹 Audit
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
  },
  { timestamps: true }
);

// 🔹 Indexes for reports
VendorInvoiceSchema.index({ orgId: 1, vendorId: 1 });
VendorInvoiceSchema.index({ orgId: 1, orderId: 1 });
VendorInvoiceSchema.index({ orgId: 1, invoiceDate: -1 });

module.exports = mongoose.model('VendorInvoice', VendorInvoiceSchema);
