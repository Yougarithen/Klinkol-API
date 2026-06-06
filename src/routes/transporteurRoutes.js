// ========== transporteurRoutes.js - SÉCURISÉ ==========
const express = require('express');
const router = express.Router();
const controller = require('../controllers/transporteurController');
const { authenticate, requirePermission } = require('../middleware/authMiddleware');

router.use(authenticate);

// CRUD de base
router.get('/',    requirePermission('transporteurs.read'),   controller.getAll);
router.get('/:id', requirePermission('transporteurs.read'),   controller.getById);
router.post('/',   requirePermission('transporteurs.create'), controller.create);
router.put('/:id', requirePermission('transporteurs.update'), controller.update);
router.delete('/:id', requirePermission('transporteurs.delete'), controller.delete);

// Gestion des chauffeurs
router.post('/:id/chauffeurs',   requirePermission('transporteurs.update'), controller.ajouterChauffeur);
router.delete('/:id/chauffeurs', requirePermission('transporteurs.update'), controller.retirerChauffeur);

// Gestion des camions
router.post('/:id/camions',   requirePermission('transporteurs.update'), controller.ajouterCamion);
router.delete('/:id/camions', requirePermission('transporteurs.update'), controller.retirerCamion);

module.exports = router;
