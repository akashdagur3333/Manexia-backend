const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema(
  {
    employeeCode: { type: String, required: true, index: true },
    name: { type: String, required: true },
    email: { type: String, index: true },
    phone: { type: String, index: true },

    department: String,
    designation: String,
    joiningDate: Date,

    salary: { type: Number, min: 0 },

    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE',
      index: true
    },

    orgId: { type: String, required: true, index: true },
    isDeleted: { type: Boolean, default: false, index: true },

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
  },
  { timestamps: true }
);

module.exports = mongoose.model('Employee', EmployeeSchema);
