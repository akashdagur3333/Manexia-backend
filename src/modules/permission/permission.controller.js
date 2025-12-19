const Permission = require('./permission.model');

/**
 * CREATE PERMISSION
 */
exports.create = async (req, res) => {
  try {
    const { name, key, description, module } = req.body;
    const permission = await Permission.create({
      name: name.trim(),
      key: key.trim(),
      description,
      module,
      orgId: req.user.organization.orgId,
      createdBy: {
        userId: req.user.userId,
        name: req.user.name,
        email: req.user.email
      }
    });

    res.status(201).json({
      success: true,
      message: 'Permission created',
      data: permission
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Permission already exists'
      });
    }

    console.error(err);
    res.status(500).json({ message: 'Failed to create permission' });
  }
};

/**
 * LIST PERMISSIONS (with search)
 */
exports.list = async (req, res) => {
  const { search = '' } = req.query;

  const query = {
    orgId: req.user.organization.orgId,
    isActive: true,
    ...(search && {
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { key: { $regex: search, $options: 'i' } }
      ]
    })
  };

  const permissions = await Permission.find(query)
    .sort({ createdAt: -1 })
    .lean();

  res.json({
    success: true,
    data: permissions
  });
};

/**
 * UPDATE PERMISSION
 */
exports.update = async (req, res) => {
  const { id } = req.params;
  const { name, description, isActive } = req.body;

  const permission = await Permission.findOneAndUpdate(
    { _id: id, orgId: req.user.organization.orgId },
    { name, description, isActive },
    { new: true }
  );

  if (!permission) {
    return res.status(404).json({ message: 'Permission not found' });
  }

  res.json({
    success: true,
    message: 'Permission updated',
    data: permission
  });
};

/**
 * DELETE PERMISSION (SOFT)
 */
exports.remove = async (req, res) => {
  const { id } = req.params;

  const permission = await Permission.findOneAndUpdate(
    { _id: id, orgId: req.user.organization.orgId },
    { isActive: false },
    { new: true }
  );

  if (!permission) {
    return res.status(404).json({ message: 'Permission not found' });
  }

  res.json({
    success: true,
    message: 'Permission disabled'
  });
};
