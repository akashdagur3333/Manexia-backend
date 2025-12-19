exports.getMyOrg = async (req, res, next) => {
    try {
      const org = await require('./organization.service').getOrg(req.user.orgId);
      res.json(org);
    } catch (e) { next(e); }
  };
  