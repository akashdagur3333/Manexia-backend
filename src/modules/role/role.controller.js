const Role = require('./role.model');
exports.list = async (req, res) => {
  try {
    const roles = await Role.find({isDeleted:false});
    res.json(roles);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching roles' });
  }
};

exports.add = async (req, res) => {
  try {
    const { name, permissions,description,status } = req.body;

    const role = await Role.create({
      name: name.trim(),
      permissions: permissions || [],
      orgId: req.user.organization.orgId,
      description:description,
      status:status,
      createdBy: {
        userId: req.user.userId,
        name: req.user.name,
        email: req.user.email
      }
    });

    res.status(201).json({
      success: true,
      message: 'Role created successfully',
      data: role
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating role' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, permissions ,description,status} = req.body;

    const role = await Role.findOne({
      _id: id,
      orgId: req.user.organization.orgId,
      isDeleted: { $ne: true }
    });

    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    if (name) role.name = name.trim();
    if (description) role.description = description;
    if (status) role.status = status;
    if (Array.isArray(permissions)) role.permissions = permissions;
    role.updatedBy = {
      userId: req.user.userId,
      name: req.user.name,
      email: req.user.email
    };

    role.updatedAt = new Date();

    await role.save();

    res.json({
      success: true,
      message: 'Role updated successfully',
      data: role
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating role' });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id,req.user.organization.orgId)

    const role = await Role.findOne({
      _id: id,
      orgId: req.user.organization.orgId,
      isDeleted: { $ne: true }
    });

    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    role.isDeleted = true;
    role.deletedBy = {
      userId: req.user.userId,
      name: req.user.name,
      email: req.user.email
    };

    await role.save();

    res.json({
      success: true,
      message: 'Role deleted successfully'
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting role' });
  }
};
