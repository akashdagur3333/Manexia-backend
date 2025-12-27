const mongoose = require('mongoose');

const AccountSchema = new mongoose.Schema(
  {
    /* =====================
       BASIC INFO
    ===================== */
    name: {
      type: String,
      required: true,
      trim: true,
      index: true          // fast search
    },

    type: {
      type: String,
      enum: ['CASH', 'BANK', 'UPI', 'CHEQUE'],
      required: true,
      index: true
    },

    /* =====================
       BANK DETAILS (OPTIONAL)
    ===================== */
    accountNumber: {
      type: String
    },

    /* =====================
       BALANCES
    ===================== */
    openingBalance: {
      type: Number,
      default: 0,
      min: 0
    },

    currentBalance: {
      type: Number,
      default: 0
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
   AUTO SET CURRENT BALANCE
   (ONLY ON CREATE)
===================== */
AccountSchema.pre('save', function (next) {
  if (this.isNew) {
    this.currentBalance = this.openingBalance;
  }
  next();
});

/* =====================
   INDEXES
===================== */
AccountSchema.index({ orgId: 1, name: 1 });
AccountSchema.index({ orgId: 1, type: 1 });

module.exports = mongoose.model('Account', AccountSchema);
