const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: String,
  description: String,

  assignedTo: String, // employeeId
  priority: String,   // LOW | MEDIUM | HIGH
  status: { type: String, default: 'OPEN' },

  dueDate: Date,

  orgId: { type: String, required: true },

  createdBy: {
    userId: String,
    name: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);
