const mongoose = require('mongoose');
const Task = require('../model/task.model');

exports.create = async (req, res) => {
  try {
    const orgId = req.user.organization.orgId;

    const {
      title,
      description,
      assignedTo,
      priority,
      dueDate,
      status
    } = req.body;

    /* =====================
       BASIC VALIDATION
    ===================== */
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Task title is required'
      });
    }

    /* =====================
       CREATE TASK
    ===================== */
    const task = await Task.create({
      title,
      description,
      assignedTo,
      priority,
      dueDate,
      status,
      orgId,
      createdBy: {
        userId: req.user.userId,
        name: req.user.name
      }
    });

    return res.json({
      success: true,
      message: 'Task created successfully',
      data: task
    });

  } catch (error) {
    console.error('Task Create Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create task'
    });
  }
};

exports.list = async (req, res) => {
  try {
    const orgId = req.user.organization.orgId;

    const {
      page = 1,
      limit = 20,
      status,
      priority,
      assignedTo,
      search
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
      filter.status = status; // OPEN | IN_PROGRESS | COMPLETED | CANCELLED
    }

    if (priority) {
      filter.priority = priority; // LOW | MEDIUM | HIGH
    }

    if (assignedTo) {
      filter.assignedTo = assignedTo; // employeeId
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    /* =====================
       FETCH DATA + COUNT
    ===================== */
    const [tasks, total] = await Promise.all([
      Task.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),

      Task.countDocuments(filter)
    ]);

    return res.json({
      success: true,
      data: tasks,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });

  } catch (error) {
    console.error('Task List Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch tasks'
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
        message: 'Invalid task id'
      });
    }

    /* =====================
       REMOVE UNSAFE FIELDS
    ===================== */
    const {
      orgId: _orgId,
      isDeleted,
      createdBy,
      ...updateData
    } = req.body;

    /* =====================
       UPDATE TASK
    ===================== */
    const task = await Task.findOneAndUpdate(
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

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or already removed'
      });
    }

    return res.json({
      success: true,
      message: 'Task updated successfully',
      data: task
    });

  } catch (error) {
    console.error('Task Update Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update task'
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
        message: 'Invalid task id'
      });
    }

    /* =====================
       SOFT DELETE TASK
    ===================== */
    const task = await Task.findOneAndUpdate(
      {
        _id: id,
        orgId,
        isDeleted: false
      },
      {
        isDeleted: true
      },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or already removed'
      });
    }

    return res.json({
      success: true,
      message: 'Task removed successfully'
    });

  } catch (error) {
    console.error('Task Remove Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to remove task'
    });
  }
};

