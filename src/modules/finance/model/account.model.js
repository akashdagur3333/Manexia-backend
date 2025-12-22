const mongoose = require('mongoose');

const AccountSchema = new mongoose.Schema({
  name: { type: String, required: true },      // Cash, HDFC Bank
  type: { type: String, required: true },      // CASH | BANK
  accountNumber: String,
  openingBalance: { type: Number, default: 0 },
  currentBalance: { type: Number, default: 0 },

  orgId: { type: String, required: true },
  isDeleted: { type: Boolean, default: false },

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
}, { timestamps: true });

module.exports = mongoose.model('Account', AccountSchema);
