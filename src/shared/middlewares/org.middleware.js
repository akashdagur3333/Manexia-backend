module.exports = (req, _, next) => {
    if (!req.user.organization.orgId) throw new Error('Org missing');
    next();
  };
  