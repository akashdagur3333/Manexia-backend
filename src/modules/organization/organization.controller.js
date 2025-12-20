const {
  createOrgSchema,
  updateOrgSchema
} = require('./organization.validation');

const service = require('./organization.service');

exports.createOrganization = async (req, res, next) => {
  try {
    const { error } = createOrgSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    const payload = {
      ...req.body,
      createdBy: {
        userId: req.user._id,
        email: req.user.email,
        name: req.user.name
      }
    };

    const org = await service.createOrg(payload);
    res.status(201).json(org);
  } catch (e) {
    console.log(e)
    next(e);
  }
};

exports.getMyOrg = async (req, res, next) => {
  try {
    const org = await service.getOrg();
    if (!org) return res.status(404).json({ message: 'Organization not found' });

    res.json(org);
  } catch (e) {
    next(e);
  }
};

exports.updateOrganization = async (req, res, next) => {
  try {
    const { error } = updateOrgSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    const org = await service.updateOrg(req.params.orgId, req.body);
    res.json(org);
  } catch (e) {
    next(e);
  }
};

exports.deleteOrganization = async (req, res, next) => {
  try {
    const {orgId}=req.params
    const deletedBy={
      userId: req.user.userId,
      email: req.user.email,
      name: req.user.name
    }
    await service.softDeleteOrg(orgId,deletedBy);
    res.json({ message: 'Organization deleted successfully' });
  } catch (e) {
    next(e);
  }
};
