const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  employeeId: String,
  date: Date,

  checkIn: Date,
  checkOut: Date,
  status: String, // PRESENT | ABSENT | HALF_DAY

  orgId: { type: String, required: true },

  createdBy: {
    userId: String,
    name: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);
