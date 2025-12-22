const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
  orgId: { type: String, required: true },
  planId: String,

  startDate: Date,
  endDate: Date,

  status: {
    type: String,
    default: 'ACTIVE' // ACTIVE | EXPIRED | CANCELLED
  },

  autoRenew: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Subscription', SubscriptionSchema);
