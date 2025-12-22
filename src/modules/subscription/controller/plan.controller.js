const service = require('../plan.service');

exports.create = async (req, res) => {
  try {
    const plan = await service.create(req.body, req.user);
    res.json({ success: true, data: plan });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

exports.list = async (req, res) => {
  const plans = await service.list(req.query);
  res.json({ success: true, data: plans });
};

exports.getById = async (req, res) => {
  try {
    const plan = await service.getById(req.params.id);
    res.json({ success: true, data: plan });
  } catch (e) {
    res.status(404).json({ success: false, message: e.message });
  }
};

exports.update = async (req, res) => {
  try {
    const plan = await service.update(req.params.id, req.body);
    res.json({ success: true, data: plan });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await service.remove(req.params.id, req.user);
    res.json({ success: true, message: 'Plan deleted successfully' });
  } catch (e) {
    res.status(404).json({ success: false, message: e.message });
  }
};
