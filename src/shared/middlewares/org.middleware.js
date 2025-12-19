module.exports = (req, _, next) => {
    if (!req.user?.orgId) throw new Error('Org missing');
    next();
  };
  