// ========== transporteurRavitaillementRoutes.js - SÉCURISÉ ==========
const express = require('express');
const router  = express.Router();
const controller = require('../controllers/transporteurRavitaillementController');
const { authenticate, requirePermission } = require('../middleware/authMiddleware');

router.use(authenticate);

// ⚠️ Routes spécifiques AVANT routes avec paramètres dynamiques

// GET - Par transporteur
router.get('/transporteur/:id_transporteur', requirePermission('matieres.read'), controller.getByTransporteur);

// GET - Par ravitaillement
router.get('/ravitaillement/:id_ravitaillement', requirePermission('matieres.read'), controller.getByRavitaillement);

// GET - Liste tous
router.get('/', requirePermission('matieres.read'), controller.getAll);

// GET - Par ID
router.get('/:id', requirePermission('matieres.read'), controller.getById);

// POST - Créer
router.post('/', requirePermission('matieres.create'), controller.create);

// PUT - Modifier
router.put('/:id', requirePermission('matieres.update'), controller.update);

// DELETE - Supprimer
router.delete('/:id', requirePermission('matieres.delete'), controller.delete);

module.exports = router;
