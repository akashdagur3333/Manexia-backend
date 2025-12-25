const mongoose = require('mongoose');

const ContactUsSchema = new mongoose.Schema(
  {
    /* =====================
       USER DETAILS
    ===================== */
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },

    phoneNumber: {
      type: String,
      trim: true
    },

    /* =====================
       MESSAGE
    ===================== */
    subject: {
      type: String,
      required: true,
      trim: true
    },

    message: {
      type: String,
      required: true,
      trim: true
    },

    /* =====================
       STATUS (ADMIN HANDLING)
    ===================== */
    status: {
      type: String,
      enum: ['NEW', 'IN_PROGRESS', 'RESOLVED'],
      default: 'NEW',
      index: true
    },

    /* =====================
       ORGANIZATION (OPTIONAL)
       useful if multi-tenant
    ===================== */
    orgId: {
      type: String,
      index: true
    },

    /* =====================
       SOFT DELETE (OPTIONAL)
    ===================== */
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ContactUs', ContactUsSchema);
 