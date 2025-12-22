const Task = require('../model/task.model');

exports.create = async (req, res) => {
  const task = await Task.create({
    ...req.body,
    orgId: req.user.organization.orgId,
    createdBy: {
      userId: req.user.userId,
      name: req.user.name
    }
  });

  res.json({ success: true, data: task });
};

exports.list = async (req, res) => {
  const tasks = await Task.find({
    orgId: req.user.organization.orgId
  }).sort({ createdAt: -1 });

  res.json({ success: true, data: tasks });
};
