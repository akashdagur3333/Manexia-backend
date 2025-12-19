const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      index: true
    },

    customName: { type: String, required: true },
    originalName: { type: String, required: true },
    fileSize: Number,
    mimeType: String,

    fileKey: { type: String, required: true }, // S3 key

    uploadedBy: {
      type: mongoose.Schema.Types.Mixed    },

    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: Date
  },
  { timestamps: true }
);

module.exports = mongoose.model('Document', documentSchema);
