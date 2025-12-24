const mongoose = require('mongoose');
const { Schema } = mongoose;

const MaterialStockUsageSchema = new Schema(
  {
    // 🔹 Organization
    orgId: {
      type: String,
      required: true,
      index: true
    },

    // 🔹 Material & Warehouse (STRING IDs)
    materialId: {
      type: String,
      required: true,
      index: true
    },

    warehouseId: {
      type: String,
      required: true,
      index: true
    },

    // 🔹 Stock info
    quantity: {
      type: Number,
      required: true,
      min: 1
    },

    type: {
      type: String,
      enum: ['IN', 'OUT'],
      required: true,
      index: true
    },

    remark: {
      type: String,
      trim: true
    },

    // 🔹 Audit info
    createdBy: {
      userId: {
        type: String
      },
      name: String,
      email: String
    },

    // 🔹 Soft delete
    isDeleted: {
      type: Boolean,
      default: false,
      index: true
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

// 🔹 Indexes for fast reports
MaterialStockUsageSchema.index({ orgId: 1, materialId: 1 });
MaterialStockUsageSchema.index({ orgId: 1, warehouseId: 1 });
MaterialStockUsageSchema.index({ orgId: 1, createdAt: -1 });

module.exports = mongoose.model(
  'MaterialStockUsage',
  MaterialStockUsageSchema
);
