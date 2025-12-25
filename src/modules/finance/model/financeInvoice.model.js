const mongoose = require('mongoose');

const FinanceInvoiceSchema = new mongoose.Schema(
  {
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
       INVOICE INFO
    ===================== */
    invoiceNumber: {
      type: String,
      required: true,
      index: true
    },

    invoiceDate: {
      type: Date,
      default: Date.now,
      index: true
    },

    /* =====================
       AMOUNTS
    ===================== */
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

    paidAmount: {
      type: Number,
      default: 0,
      min: 0
    },

    dueAmount: {
      type: Number,
      required: true,
      min: 0
    },

    /* =====================
       PAYMENT STATUS
    ===================== */
    paymentStatus: {
      type: String,
      enum: ['UNPAID', 'PARTIAL', 'PAID'],
      default: 'UNPAID',
      index: true
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
   AUTO CALCULATIONS
===================== */
FinanceInvoiceSchema.pre('save', function (next) {
  // Ensure totalAmount consistency
  if (this.isModified('amount') || this.isModified('taxAmount')) {
    this.totalAmount = (this.amount || 0) + (this.taxAmount || 0);
  }

  // Ensure dueAmount consistency
  if (this.isNew) {
    this.paidAmount = 0;
    this.dueAmount = this.totalAmount;
    this.paymentStatus = 'UNPAID';
  }

  next();
});

/* =====================
   INDEXES
===================== */
FinanceInvoiceSchema.index({ orgId: 1, invoiceNumber: 1 });
FinanceInvoiceSchema.index({ orgId: 1, referenceType: 1, referenceId: 1 });
FinanceInvoiceSchema.index({ orgId: 1, paymentStatus: 1 });

module.exports = mongoose.model('FinanceInvoice', FinanceInvoiceSchema);
