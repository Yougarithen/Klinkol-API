// ========== ajustementRoutes.js - SÉCURISÉ ==========
const express = require('express');
const router = express.Router();
const controller = require('../controllers/ajustementController');
const { authenticate, requirePermission } = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/',                         requirePermission('ajustements.read'),   controller.getAll);
router.get('/facture/:id_facture',      requirePermission('ajustements.read'),   controller.getByFacture);
router.get('/client/:id_client',        requirePermission('ajustements.read'),   controller.getByClient);
router.get('/:id',                      requirePermission('ajustements.read'),   controller.getById);
router.post('/',                        requirePermission('ajustements.create'), controller.create);
router.delete('/:id',                   requirePermission('ajustements.delete'), controller.delete);

module.exports = router;
