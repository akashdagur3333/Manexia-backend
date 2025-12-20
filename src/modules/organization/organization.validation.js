const Joi = require('joi');

exports.createOrgSchema = Joi.object({
  name: Joi.string().min(3).required(),
  email: Joi.string().required(),
  phone: Joi.number().required(),
  address: Joi.string().required(),
  description:Joi.string().required(),
  status:Joi.string().required(),
});

exports.updateOrgSchema = Joi.object({
  name: Joi.string().min(3).optional(),
  email: Joi.string().optional(),
  phone: Joi.number().optional(),
  address: Joi.string().optional(),
  description:Joi.string().optional(),
  status:Joi.string().optional(),
});
