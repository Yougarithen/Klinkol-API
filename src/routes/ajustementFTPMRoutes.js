// ========== ajustementFTPMRoutes.js - SÉCURISÉ ==========
const express = require('express');
const router = express.Router();
const controller = require('../controllers/ajustementFTPMController');
const { authenticate, requirePermission } = require('../middleware/authMiddleware');

router.use(authenticate);

// IMPORTANT: Les routes spécifiques doivent être avant les routes avec paramètres
router.get('/types', requirePermission('ajustements_ftpm.read'), controller.getTypes);
router.get('/client/:id', requirePermission('ajustements_ftpm.read'), controller.getByClient);
router.get('/client/:id/totaux', requirePermission('ajustements_ftpm.read'), controller.getTotauxClient);
router.get('/transporteur/:id', requirePermission('ajustements_ftpm.read'), controller.getByTransporteur);
router.get('/transporteur/:id/totaux', requirePermission('ajustements_ftpm.read'), controller.getTotauxTransporteur);

// CRUD de base (filtres possibles : ?id_client=&id_transporteur=&type=)
router.get('/', requirePermission('ajustements_ftpm.read'), controller.getAll);
router.get('/:id', requirePermission('ajustements_ftpm.read'), controller.getById);
router.post('/', requirePermission('ajustements_ftpm.create'), controller.create);
router.put('/:id', requirePermission('ajustements_ftpm.update'), controller.update);
router.delete('/:id', requirePermission('ajustements_ftpm.delete'), controller.delete);

module.exports = router;
