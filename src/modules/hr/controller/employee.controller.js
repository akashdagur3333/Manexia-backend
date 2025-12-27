const mongoose = require('mongoose');
const Employee = require('../model/employee.model');
exports.create = async (req, res) => {
  try {
    const orgId = req.user.organization.orgId;

    const {
      employeeCode,
      name,
      email,
      phone,
      department,
      designation,
      joiningDate,
      salary,
      status
    } = req.body;

    /* =====================
       BASIC VALIDATION
    ===================== */
    if (!employeeCode) {
      return res.status(400).json({
        success: false,
        message: 'Employee code is required'
      });
    }

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Employee name is required'
      });
    }

    /* =====================
       DUPLICATE CHECK
    ===================== */
    const exists = await Employee.findOne({
      employeeCode,
      orgId,
      isDeleted: false
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: 'Employee code already exists'
      });
    }

    /* =====================
       CREATE EMPLOYEE
    ===================== */
    const employee = await Employee.create({
      employeeCode,
      name,
      email,
      phone,
      department,
      designation,
      joiningDate,
      salary,
      status,
      orgId,
      createdBy: {
        userId: req.user.userId,
        name: req.user.name,
        email: req.user.email
      }
    });

    return res.json({
      success: true,
      message: 'Employee created successfully',
      data: employee
    });

  } catch (error) {
    console.error('Employee Create Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to create employee',
      error: error.message
    });
  }
};

const Employee = require('../model/employee.model');

exports.list = async (req, res) => {
  try {
    const orgId = req.user.organization.orgId;

    const {
      page = 1,
      limit = 20,
      search,
      status
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    /* =====================
       BASE FILTER
    ===================== */
    const filter = {
      orgId,
      isDeleted: false
    };

    if (status) {
      filter.status = status; // ACTIVE | INACTIVE
    }

    if (search) {
      filter.$or = [
        { employeeCode: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    /* =====================
       FETCH DATA + COUNT
    ===================== */
    const [employees, total] = await Promise.all([
      Employee.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),

      Employee.countDocuments(filter)
    ]);

    return res.json({
      success: true,
      data: employees,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });

  } catch (error) {
    console.error('Employee List Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch employees'
    });
  }
};


exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const orgId = req.user.organization.orgId;

    /* =====================
       VALIDATE ID
    ===================== */
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid employee id'
      });
    }

    /* =====================
       SOFT DELETE
    ===================== */
    const employee = await Employee.findOneAndUpdate(
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

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found or already removed'
      });
    }

    return res.json({
      success: true,
      message: 'Employee removed successfully'
    });

  } catch (error) {
    console.error('Employee Remove Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to remove employee'
    });
  }
};


exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const orgId = req.user.organization.orgId;

    /* =====================
       VALIDATE ID
    ===================== */
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid employee id'
      });
    }

    /* =====================
       REMOVE UNSAFE FIELDS
    ===================== */
    const {
      orgId: _orgId,
      isDeleted,
      createdBy,
      deletedBy,
      ...updateData
    } = req.body;

    /* =====================
       UPDATE EMPLOYEE
    ===================== */
    const employee = await Employee.findOneAndUpdate(
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

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found or already removed'
      });
    }

    return res.json({
      success: true,
      message: 'Employee updated successfully',
      data: employee
    });

  } catch (error) {
    console.error('Employee Update Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update employee'
    });
  }
};
