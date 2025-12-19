const Role = require('./role.model');

exports.list = async (req, res) => {
  try {
    const roles = await Role.find({});
    res.json(roles);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching roles' });
  }
};

exports.add = async (req, res) => {
  try {
    const { name, permissions } = req.body;

    const role = await Role.create({
      name: name.trim(),
      permissions: permissions || [],
      orgId: req.user.organization.orgId,
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

