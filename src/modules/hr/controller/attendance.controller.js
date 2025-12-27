const Attendance = require('../model/attendance.model');

exports.mark = async (req, res) => {
  try {
    const orgId = req.user.organization.orgId;

    const {
      employeeId,
      date,
      checkIn,
      checkOut,
      status
    } = req.body;

    /* =====================
       BASIC VALIDATION
    ===================== */
    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: 'Employee is required'
      });
    }

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required'
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Attendance status is required'
      });
    }

    /* =====================
       PREVENT DUPLICATE ENTRY
    ===================== */
    const exists = await Attendance.findOne({
      orgId,
      employeeId,
      date: new Date(date),
      isDeleted: false
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: 'Attendance already marked for this date'
      });
    }

    /* =====================
       CREATE ATTENDANCE
    ===================== */
    const attendance = await Attendance.create({
      employeeId,
      date: new Date(date),
      checkIn,
      checkOut,
      status,
      orgId,
      createdBy: {
        userId: req.user.userId,
        name: req.user.name
      }
    });

    return res.json({
      success: true,
      message: 'Attendance marked successfully',
      data: attendance
    });

  } catch (error) {
    console.error('Attendance Mark Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to mark attendance',
      error: error.message
    });
  }
};

exports.list = async (req, res) => {
  try {
    const orgId = req.user.organization.orgId;

    const {
      page = 1,
      limit = 20,
      employeeId,
      fromDate,
      toDate,
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

    if (employeeId) {
      filter.employeeId = employeeId;
    }

    if (status) {
      filter.status = status; // PRESENT | ABSENT | HALF_DAY
    }

    if (fromDate && toDate) {
      filter.date = {
        $gte: new Date(fromDate),
        $lte: new Date(toDate)
      };
    }

    /* =====================
       FETCH DATA + COUNT
    ===================== */
    const [attendance, total] = await Promise.all([
      Attendance.find(filter)
        .sort({ date: -1 })
        .skip(skip)
        .limit(Number(limit)),

      Attendance.countDocuments(filter)
    ]);

    return res.json({
      success: true,
      data: attendance,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });

  } catch (error) {
    console.error('Attendance List Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance'
    });
  }
};

