const Customer = require('../model/customer.model');

exports.create = async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    // 🔴 Basic validation
    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Customer name is required'
      });
    }

    // 🔍 Prevent duplicate customer (email OR phone within org)
    const existingCustomer = await Customer.findOne({
      orgId: req.user.organization.orgId,
      isDeleted: false,
      $or: [
        email ? { email } : null,
        phone ? { phone } : null
      ].filter(Boolean)
    });

    if (existingCustomer) {
      return res.status(409).json({
        success: false,
        message: 'Customer already exists'
      });
    }

    // ✅ Create customer
    const customer = await Customer.create({
      ...req.body,
      orgId: req.user.organization.orgId,
      createdBy: {
        userId: req.user.userId,
        name: req.user.name,
        email: req.user.email
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: customer
    });

  } catch (err) {
    console.error('Create Customer Error:', err);

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};


exports.list = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = ''
    } = req.query;

    const orgId = req.user.organization.orgId;

    // 🔎 Search condition
    const match = {
      orgId,
      isDeleted: false
    };

    if (search && search.trim() !== '') {
      match.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { gstNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    // 🔹 Data + Count
    const [customers, total] = await Promise.all([
      Customer.find(match)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),

      Customer.countDocuments(match)
    ]);

    res.json({
      success: true,
      data: customers,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });

  } catch (err) {
    console.error('List Customers Error:', err);

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const mongoose = require('mongoose');

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const orgId = req.user.organization.orgId;

    // 🔴 Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid customer id'
      });
    }

    const customer = await Customer.findOneAndUpdate(
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

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found or already deleted'
      });
    }

    return res.json({
      success: true,
      message: 'Customer deleted successfully'
    });

  } catch (err) {
    console.error('Delete Customer Error:', err);

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const orgId = req.user.organization.orgId;

    // 🔴 Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid customer id'
      });
    }

    // 🔴 Prevent empty name update
    if (req.body.name !== undefined && req.body.name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Customer name cannot be empty'
      });
    }

    // 🔍 Duplicate check (email / phone)
    const { email, phone } = req.body;

    if (email || phone) {
      const duplicate = await Customer.findOne({
        _id: { $ne: id },
        orgId,
        isDeleted: false,
        $or: [
          email ? { email } : null,
          phone ? { phone } : null
        ].filter(Boolean)
      });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: 'Another customer with same email or phone already exists'
        });
      }
    }

    // 🔹 Allowed fields only (security)
    const allowedFields = [
      'name',
      'email',
      'phone',
      'address',
      'gstNumber'
    ];

    const updateData = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    // 🔴 Nothing to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields provided for update'
      });
    }

    const customer = await Customer.findOneAndUpdate(
      {
        _id: id,
        orgId,
        isDeleted: false
      },
      { $set: updateData },
      { new: true }
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    return res.json({
      success: true,
      message: 'Customer updated successfully',
      data: customer
    });

  } catch (err) {
    console.error('Update Customer Error:', err);

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

