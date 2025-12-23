const Warehouse = require('../model/warehouse.model');

exports.create = async (req, res) => {
  try {
    const orgId = req.user.organization.orgId;

    const {
      name,
      code,
      location,
      managerName,
      contactNumber
    } = req.body;

    // 🔐 Validation
    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Warehouse name is required'
      });
    }

    // 🔁 Duplicate check (per org)
    const existingWarehouse = await Warehouse.findOne({
      name: name.trim(),
      orgId,
      isDeleted: false
    });

    if (existingWarehouse) {
      return res.status(409).json({
        success: false,
        message: 'Warehouse already exists'
      });
    }

    // ✅ Create warehouse
    const warehouse = await Warehouse.create({
      name: name.trim(),
      code: code ? code.trim() : undefined,
      location,
      managerName,
      contactNumber,

      orgId,

      createdBy: {
        userId: req.user.userId,
        name: req.user.name,
        email: req.user.email
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Warehouse created successfully',
      data: warehouse
    });

  } catch (error) {
    console.error('Warehouse Create Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to create warehouse',
      error: error.message
    });
  }
};


exports.list = async (req, res) => {
  try {
    const orgId = req.user.organization.orgId;

    // 🔹 Query params
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || '';
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    // 🔎 Search filter
    const filter = {
      orgId,
      isDeleted: false
    };

    if (search && search.trim() !== '') {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { managerName: { $regex: search, $options: 'i' } }
      ];
    }

    // 📦 Fetch data + count
    const [warehouses, total] = await Promise.all([
      Warehouse.find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit),

      Warehouse.countDocuments(filter)
    ]);

    return res.status(200).json({
      success: true,
      data: warehouses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Warehouse List Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch warehouses',
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
      code,
      location,
      managerName,
      contactNumber
    } = req.body;

    // 🔐 Validate id
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Warehouse id is required'
      });
    }

    // 🔐 Validate name if provided
    if (name && name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Warehouse name cannot be empty'
      });
    }

    // 🔁 Duplicate name check (same org, exclude self)
    if (name) {
      const duplicate = await Warehouse.findOne({
        _id: { $ne: id },
        name: name.trim(),
        orgId,
        isDeleted: false
      });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: 'Warehouse name already exists'
        });
      }
    }

    // 🧱 Prepare update object
    const updateData = {};

    if (name) updateData.name = name.trim();
    if (code !== undefined) updateData.code = code ? code.trim() : '';
    if (location !== undefined) updateData.location = location;
    if (managerName !== undefined) updateData.managerName = managerName;
    if (contactNumber !== undefined) updateData.contactNumber = contactNumber;

    // 🔄 Update warehouse
    const warehouse = await Warehouse.findOneAndUpdate(
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

    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: 'Warehouse not found or already deleted'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Warehouse updated successfully',
      data: warehouse
    });

  } catch (error) {
    console.error('Warehouse Update Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to update warehouse',
      error: error.message
    });
  }
};



exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const orgId = req.user.organization.orgId;

    // 🔐 Validate ID
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Warehouse id is required'
      });
    }

    // 🔁 Soft delete warehouse
    const warehouse = await Warehouse.findOneAndUpdate(
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

    // ❌ Not found / already deleted
    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: 'Warehouse not found or already deleted'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Warehouse deleted successfully'
    });

  } catch (error) {
    console.error('Warehouse Delete Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to delete warehouse',
      error: error.message
    });
  }
};
