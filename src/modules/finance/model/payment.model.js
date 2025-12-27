const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema(
  {
    /* =====================
       ACCOUNT
    ===================== */
    accountId: {
      type: String,
      required: true,
      index: true
    },

    /* =====================
       REFERENCE
    ===================== */
    referenceType: {
      type: String,
      enum: ['CUSTOMER', 'VENDOR'],
      required: true,
      index: true
    },

    referenceId: {
      type: String,
      required: true,
      index: true
    },

    orderId: {
      type: String,
      index: true
    },

    /* =====================
       PAYMENT INFO
    ===================== */
    type: {
      type: String,
      enum: ['IN', 'OUT'],   // IN = Customer payment, OUT = Vendor payment
      required: true,
      index: true
    },

    amount: {
      type: Number,
      required: true,
      min: 0.01
    },

    paymentMode: {
      type: String,
      enum: ['CASH', 'BANK', 'UPI', 'CHEQUE'],
      required: true
    },

    paymentDate: {
      type: Date,
      default: Date.now,
      index: true
    },

    remarks: {
      type: String,
      trim: true
    },

    /* =====================
       ORGANIZATION
    ===================== */
    orgId: {
      type: String,
      required: true,
      index: true
    },

    /* =====================
       SOFT DELETE
    ===================== */
    isDeleted: {
      type: Boolean,
      default: false,
      index: true
    },

    /* =====================
       AUDIT
    ===================== */
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

/* =====================
   INDEXES (PERFORMANCE)
===================== */
PaymentSchema.index({ orgId: 1, paymentDate: -1 });
PaymentSchema.index({ orgId: 1, referenceType: 1, referenceId: 1 });
PaymentSchema.index({ orgId: 1, accountId: 1 });

module.exports = mongoose.model('Payment', PaymentSchema);
