const Organization = require('./organization.model');

exports.createOrg = async (payload) => {
  return Organization.create(payload);
};

exports.getOrg = async (orgId) => {
  return Organization.find({isDeleted: false });
};

exports.updateOrg = async (orgId, payload) => {
  return Organization.findOneAndUpdate(
    { _id: orgId, isDeleted: false },
    payload,
    { new: true }
  );
};

exports.softDeleteOrg = async (orgId,deletedBy) => {
  return Organization.findOneAndUpdate(
    { _id: orgId },
    { isDeleted: true, deletedAt: new Date(),deletedBy},
    { new: true }
  );
};
