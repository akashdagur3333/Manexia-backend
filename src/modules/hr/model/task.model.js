const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,

    assignedTo: { type: String, index: true }, // employeeId

    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH'],
      default: 'MEDIUM',
      index: true
    },

    status: {
      type: String,
      enum: ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
      default: 'OPEN',
      index: true
    },

    dueDate: Date,

    orgId: { type: String, required: true, index: true },
    isDeleted: { type: Boolean, default: false, index: true },

    createdBy: {
      userId: String,
      name: String
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', TaskSchema);
