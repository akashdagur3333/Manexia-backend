const mongoose = require('mongoose');

const VendorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true
    },

    email: {
      type: String,
      trim: true,
      lowercase: true
    },

    phone: {
      type: String,
      trim: true
    },

    address: {
      type: String,
      trim: true
    },

    gstNumber: {
      type: String,
      trim: true,
      uppercase: true
    },

    // 🔹 Organization scope
    orgId: {
      type: String,
      required: true,
      index: true
    },

    // 🔹 Soft delete
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
  {
    timestamps: true
  }
);

// 🔹 Helpful indexes
VendorSchema.index({ orgId: 1, name: 1 });
VendorSchema.index({ orgId: 1, isDeleted: 1 });

module.exports = mongoose.model('Vendor', VendorSchema);
