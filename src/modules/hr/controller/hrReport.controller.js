const Employee = require('../model/employee.model');
const Attendance = require('../model/attendance.model');
const Task = require('../model/task.model');

exports.summary = async (req, res) => {
  const orgId = req.user.organization.orgId;

  const totalEmployees = await Employee.countDocuments({ orgId, isDeleted: false });
  const presentToday = await Attendance.countDocuments({
    orgId,
    date: new Date().toISOString().slice(0, 10)
  });

  const openTasks = await Task.countDocuments({
    orgId,
    status: { $ne: 'COMPLETED' }
  });

  res.json({
    success: true,
    data: {
      totalEmployees,
      presentToday,
      openTasks
    }
  });
};
