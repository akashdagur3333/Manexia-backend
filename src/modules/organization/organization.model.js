const mongoose = require('mongoose');

const CreatedBySchema = new mongoose.Schema(
  {
    userId: { type: String},
    email: { type: String },
    name: { type: String }
  },
  { _id: false }
);

const OrganizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true },
    phone: { type: String },
    address: { type: String },
    description: { type: String },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE'
    },
    createdBy: { type: CreatedBySchema, required: true },
    isDeleted: { type: Boolean, default: false },
    deletedBy: {
      type: mongoose.Schema.Types.Mixed,
    },
    deletedAt: { type: Date }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Organization', OrganizationSchema);
