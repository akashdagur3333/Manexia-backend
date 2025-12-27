const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema(
  {
    employeeId: { type: String, required: true, index: true },
    date: { type: Date, required: true, index: true },

    checkIn: Date,
    checkOut: Date,

    status: {
      type: String,
      enum: ['PRESENT', 'ABSENT', 'HALF_DAY'],
      required: true,
      index: true
    },

    orgId: { type: String, required: true, index: true },
    isDeleted: { type: Boolean, default: false, index: true },

    createdBy: {
      userId: String,
      name: String
    }
  },
  { timestamps: true }
);

/* =====================
   PREVENT DUPLICATE ENTRY
===================== */
AttendanceSchema.index(
  { orgId: 1, employeeId: 1, date: 1 },
  { unique: true }
);

module.exports = mongoose.model('Attendance', AttendanceSchema);
