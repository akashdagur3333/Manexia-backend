const Material = require('../models/material.model');

exports.create = async (req, res) => {
  const material = await Material.create({
    ...req.body,
    orgId: req.user.organization.orgId,
    createdBy: {
      userId: req.user.userId,
      name: req.user.name,
      email: req.user.email
    }
  });

  res.json({ success: true, data: material });
};

exports.list = async (req, res) => {
  const materials = await Material.find({
    orgId: req.user.organization.orgId,
    isDeleted: false
  }).sort({ createdAt: -1 });

  res.json({ success: true, data: materials });
};

exports.remove = async (req, res) => {
  await Material.findOneAndUpdate(
    { _id: req.params.id, orgId: req.user.organization.orgId },
    {
      isDeleted: true,
      deletedBy: {
        userId: req.user.userId,
        name: req.user.name,
        email: req.user.email,
        deletedAt: new Date()
      }
    }
  );

  res.json({ success: true, message: 'Material deleted' });
};
