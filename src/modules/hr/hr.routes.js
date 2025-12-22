const router = require('express').Router();

const employee = require('./controller/employee.controller');
const attendance = require('./controller/attendance.controller');
const task = require('./controller/task.controller');
const report = require('./controller/hrReport.controller');

// Employee
router.post('/employee', employee.create);
router.get('/employee', employee.list);
router.delete('/employee/:id', employee.remove);

// Attendance
router.post('/attendance', attendance.mark);
router.get('/attendance', attendance.list);

// Task
router.post('/task', task.create);
router.get('/task', task.list);

// Report
router.get('/report', report.summary);

module.exports = router;
