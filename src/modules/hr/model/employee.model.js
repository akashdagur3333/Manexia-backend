const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
  employeeCode: String,
  name: { type: String, required: true },
  email: String,
  phone: String,

  department: String,
  designation: String,
  joiningDate: Date,

  salary: Number,
  status: { type: String, default: 'ACTIVE' },

  orgId: { type: String, required: true },
  isDeleted: { type: Boolean, default: false },

  createdBy: {
    userId: String,
    name: String,
    email: String
  },

  deletedBy: {
    userId: String,
    name: String,
    email: String,
    deletedAt: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('Employee', EmployeeSchema);
