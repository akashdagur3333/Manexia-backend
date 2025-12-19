const service = require('./auth.service');

exports.register = async (req, res, next) => {
  try {
    const data = await service.register(req.body);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const data = await service.login(req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
};
