const Organization = require('./organization.model');
exports.getOrg = (id) => Organization.findById(id);
