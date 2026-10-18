// ========== ajustementFTPMRoutes.js - SÉCURISÉ ==========
const express = require('express');
const router = express.Router();
const controller = require('../controllers/ajustementFTPMController');
const { authenticate, requirePermission } = require('../middleware/authMiddleware');

router.use(authenticate);

// IMPORTANT: Les routes spécifiques doivent être avant les routes avec paramètres
router.get('/types', requirePermission('ajustements.read'), controller.getTypes);
router.get('/client/:id', requirePermission('ajustements.read'), controller.getByClient);
router.get('/client/:id/totaux', requirePermission('ajustements.read'), controller.getTotauxClient);
router.get('/transporteur/:id', requirePermission('ajustements.read'), controller.getByTransporteur);
router.get('/transporteur/:id/totaux', requirePermission('ajustements.read'), controller.getTotauxTransporteur);

// CRUD de base (filtres possibles : ?id_client=&id_transporteur=&type=)
router.get('/', requirePermission('ajustements.read'), controller.getAll);
router.get('/:id', requirePermission('ajustements.read'), controller.getById);
router.post('/', requirePermission('ajustements.create'), controller.create);
router.put('/:id', requirePermission('ajustements.update'), controller.update);
router.delete('/:id', requirePermission('ajustements.delete'), controller.delete);

module.exports = router;
