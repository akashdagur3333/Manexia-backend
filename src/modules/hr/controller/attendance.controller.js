const Attendance = require('../model/attendance.model');

exports.mark = async (req, res) => {
  const attendance = await Attendance.create({
    ...req.body,
    orgId: req.user.organization.orgId,
    createdBy: {
      userId: req.user.userId,
      name: req.user.name
    }
  });

  res.json({ success: true, data: attendance });
};

exports.list = async (req, res) => {
  const attendance = await Attendance.find({
    orgId: req.user.organization.orgId
  }).sort({ date: -1 });

  res.json({ success: true, data: attendance });
};
