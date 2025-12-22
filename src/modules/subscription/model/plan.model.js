const mongoose = require('mongoose');

const PlanSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true },
    durationInDays: { type: Number, required: true }, // e.g. 30, 365
    features: [{ type: String }],
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },

    isDeleted: { type: Boolean, default: false },
    createdBy: {
      userId: String,
      email: String
    },
    deletedBy: {
      userId: String,
      email: String
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Plan', PlanSchema);
