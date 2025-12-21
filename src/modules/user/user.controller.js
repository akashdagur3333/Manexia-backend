const User = require('../user/user.model');
exports.list = async (req, res) => {
  const users = await User.find({
    'organization.orgId': req.user.organization.orgId,
    isDeleted: false
  })
  .select('-password')
  .sort({ createdAt: -1 })
  .lean();

  res.json({
    success: true,
    data: users
  });
};

exports.getById = async (req, res) => {
  const user = await User.findOne({
    _id: req.params.id,
    isDeleted: { $ne: true }
  }).select('-password');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.json({
    success: true,
    data: user
  });
};

exports.update = async (req, res) => {
  try {
    const { password, confirmPassword, ...updateData } = req.body;

    const user = await User.findOneAndUpdate(
      {
        _id: req.params.id,
        isDeleted: { $ne: true }
      },
      {
        $set: updateData
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found or already deleted'
      });
    }

    res.json({
      success: true,
      message: 'User updated successfully'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateName = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Name is required'
      });
    }

    const user = await User.findOneAndUpdate(
      {
        _id: req.params.id,
        isDeleted: { $ne: true }
      },
      {
        $set: { name }
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found or already deleted'
      });
    }

    res.json({
      success: true,
      message: 'Name updated successfully'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


exports.remove = async (req, res) => {
  const user = await User.findOneAndUpdate(
    {
      _id: req.params.id,
      isDeleted: { $ne: true }
    },
    {
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy: {
        userId: req.user.userId,
        email: req.user.email
      }
    },
    { new: true }
  );

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found or already deleted'
    });
  }

  res.json({
    success: true,
    message: 'User deleted successfully'
  });
};

