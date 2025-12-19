const User = require('./user.model');
exports.list = (orgId) => User.find({ orgId });
