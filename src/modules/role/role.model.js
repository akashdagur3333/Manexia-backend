const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
    },

    permissions: {
      type: [String],
      default: []
    },

    orgId: {
      type: String,
      required: true,
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
  {
    timestamps: true 
  }
);

module.exports = mongoose.model('Role', roleSchema);
