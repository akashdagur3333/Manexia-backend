const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    key: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },

    description: {
      type: String
    },

    module: {
      type: String,
      required: true
    },

    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true
    },

    createdBy: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// Prevent duplicate permission per org
permissionSchema.index({ orgId: 1, key: 1 }, { unique: true });

module.exports = mongoose.model('Permission', permissionSchema);
