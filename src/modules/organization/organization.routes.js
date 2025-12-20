const router = require('express').Router();
const ctrl = require('./organization.controller');
const auth = require('../../shared/middlewares/auth.middleware');

/**
 * Get my organization
 */
router.get('/', auth, ctrl.getMyOrg);

/**
 * Create organization
 */
router.post('/', auth, ctrl.createOrganization);

/**
 * Update organization
 */
router.put('/:orgId', auth, ctrl.updateOrganization);

/**
 * Soft delete organization
 */
router.delete('/:orgId', auth, ctrl.deleteOrganization);

module.exports = router;
