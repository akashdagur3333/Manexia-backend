const Vendor = require('../model/vendor.model');

exports.create = async (req, res) => {
  try {
    const { name, email, phone, gstNumber } = req.body;
    const orgId = req.user.organization.orgId;

    // 🔹 Basic validation
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Vendor name is required'
      });
    }

    // 🔹 Prevent duplicate vendor name (per org)
    const exists = await Vendor.findOne({
      name: name.trim(),
      orgId,
      isDeleted: false
    });

    if (exists) {
      return res.status(409).json({
        success: false,
        message: 'Vendor already exists'
      });
    }

    const vendor = await Vendor.create({
      ...req.body,
      name: name.trim(),
      email: email ? email.toLowerCase() : email,
      orgId,
      createdBy: {
        userId: req.user.userId,
        name: req.user.name,
        email: req.user.email
      }
    });

    return res.json({
      success: true,
      message: 'Vendor created successfully',
      data: vendor
    });

  } catch (error) {
    console.error('Vendor Create Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create vendor',
      error: error.message
    });
  }
};

exports.list = async (req, res) => {
  try {
    const orgId = req.user.organization.orgId;

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const search = req.query.search?.trim();

    const match = {
      orgId,
      isDeleted: false
    };

    // 🔍 Search by name / email / phone / GST
    if (search) {
      match.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { gstNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const [vendors, total] = await Promise.all([
      Vendor.find(match)
        .sort({ createdAt: sortOrder })
        .skip(skip)
        .limit(limit),

      Vendor.countDocuments(match)
    ]);

    return res.json({
      success: true,
      data: vendors,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Vendor List Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch vendors',
      error: error.message
    });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const orgId = req.user.organization.orgId;

    const vendor = await Vendor.findOneAndUpdate(
      {
        _id: id,
        orgId,
        isDeleted: false
      },
      {
        isDeleted: true,
        deletedBy: {
          userId: req.user.userId,
          name: req.user.name,
          email: req.user.email,
          deletedAt: new Date()
        }
      },
      { new: true }
    );

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found or already deleted'
      });
    }

    return res.json({
      success: true,
      message: 'Vendor deleted successfully'
    });

  } catch (error) {
    console.error('Vendor Remove Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete vendor',
      error: error.message
    });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const orgId = req.user.organization.orgId;

    const {
      name,
      email,
      phone,
      address,
      gstNumber
    } = req.body;

    // 🔹 Basic validation
    if (name !== undefined && !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Vendor name cannot be empty'
      });
    }

    // 🔹 Prevent duplicate name within same org (except self)
    if (name) {
      const exists = await Vendor.findOne({
        _id: { $ne: id },
        name: name.trim(),
        orgId,
        isDeleted: false
      });

      if (exists) {
        return res.status(409).json({
          success: false,
          message: 'Vendor name already exists'
        });
      }
    }

    const updateData = {
      ...(name !== undefined && { name: name.trim() }),
      ...(email !== undefined && { email: email.toLowerCase() }),
      ...(phone !== undefined && { phone }),
      ...(address !== undefined && { address }),
      ...(gstNumber !== undefined && { gstNumber: gstNumber.toUpperCase() })
    };

    const vendor = await Vendor.findOneAndUpdate(
      {
        _id: id,
        orgId,
        isDeleted: false
      },
      {
        $set: updateData
      },
      { new: true }
    );

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found or already deleted'
      });
    }

    return res.json({
      success: true,
      message: 'Vendor updated successfully',
      data: vendor
    });

  } catch (error) {
    console.error('Vendor Update Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update vendor',
      error: error.message
    });
  }
};

