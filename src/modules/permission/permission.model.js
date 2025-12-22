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
      type: String,
      required: true,
      index: true
    },

    createdBy: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    deletedBy: {
      type: mongoose.Schema.Types.Mixed,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE'
    },
    isDeleted:{
      type: Boolean,
      default: false
    },
  },
  { timestamps: true }
);

// Prevent duplicate permission per org
permissionSchema.index();

module.exports = mongoose.model('Permission', permissionSchema);
