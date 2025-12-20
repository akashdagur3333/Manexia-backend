module.exports = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const permissions = req.user.permissions || [];
    console.log(permissions,'permission')
    /**
     * ✅ SUPER ADMIN BYPASS
     */
    if (permissions.includes('SUPER_ADMIN')) {
      return next();
    }

    /**
     * 🔐 NORMAL USER PERMISSION CHECK
     */
    if (!permissions.includes(requiredPermission)) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied'
      });
    }

    next();
  };
};
