const service = require('./user.service');
exports.list = async (req, res) => {
  const users = await service.list(req.user.orgId);
  res.json(users);
};
