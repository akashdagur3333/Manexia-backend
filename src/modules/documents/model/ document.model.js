const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  fileName: String,
  originalName: String,

  fileUrl: String,
  fileSize: Number,
  mimeType: String,

  fileCategory: {
    type: String, // IMAGE | VIDEO | AUDIO | PDF | DOC | OTHER
    required: true
  },

  department: {
    type: String, // FINANCE | HR | INVENTORY | ADMIN | COMMON
    required: true
  },

  referenceType: String, // employee | invoice | material | vendor
  referenceId: String,

  description: String,

  orgId: { type: String, required: true },

  uploadedBy: {
    userId: String,
    name: String,
    email: String
  },

  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Document', DocumentSchema);
