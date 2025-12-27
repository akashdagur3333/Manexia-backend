const Employee = require('../model/employee.model');
const Attendance = require('../model/attendance.model');
const Task = require('../model/task.model');

exports.summary = async (req, res) => {
  try {
    const orgId = req.user.organization.orgId;

    /* =====================
       TODAY RANGE
    ===================== */
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    /* =====================
       PARALLEL COUNTS
    ===================== */
    const [totalEmployees, presentToday, openTasks] = await Promise.all([
      Employee.countDocuments({ orgId, isDeleted: false }),

      Attendance.countDocuments({
        orgId,
        isDeleted: false,
        date: { $gte: startOfToday, $lte: endOfToday },
        status: 'PRESENT'
      }),

      Task.countDocuments({
        orgId,
        isDeleted: false,
        status: { $ne: 'COMPLETED' }
      })
    ]);

    return res.json({
      success: true,
      data: {
        totalEmployees,
        presentToday,
        openTasks
      }
    });

  } catch (error) {
    console.error('Dashboard Summary Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch summary'
    });
  }
};
