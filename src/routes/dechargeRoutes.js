// ========== dechargeRoutes.js - SÉCURISÉ ==========
const express = require('express');
const router = express.Router();
const controller = require('../controllers/dechargeController');
const { authenticate, requirePermission } = require('../middleware/authMiddleware');

router.use(authenticate);

// IMPORTANT: Les routes spécifiques doivent être avant les routes avec paramètres
router.get('/transporteur/:id_transporteur', requirePermission('decharges.read'), controller.getByTransporteur);
router.get('/client/:id_client',             requirePermission('decharges.read'), controller.getByClient);
router.get('/',                              requirePermission('decharges.read'), controller.getAll);
router.get('/:id',                           requirePermission('decharges.read'), controller.getById);
router.post('/',                             requirePermission('decharges.create'), controller.create);
router.delete('/:id',                        requirePermission('decharges.delete'), controller.delete);

module.exports = router;
