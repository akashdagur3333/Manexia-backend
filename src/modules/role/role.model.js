const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    permissions: {
      type: [String],
      default: []
    },

    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
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
  {
    timestamps: true // ✅ adds createdAt & updatedAt automatically
  }
);

module.exports = mongoose.model('Role', roleSchema);
