// ========== transporteurBLRoutes.js - SÉCURISÉ ==========
const express = require('express');
const router = express.Router();
const controller = require('../controllers/transporteurBLController');
const { authenticate, requirePermission } = require('../middleware/authMiddleware');

router.use(authenticate);

// IMPORTANT : routes spécifiques avant les routes avec paramètres
router.get('/transporteur/:id_transporteur',
    requirePermission('transporteur_bl.read'),
    controller.getByTransporteur
);

router.get('/bon-livraison/:id_bon_livraison',
    requirePermission('transporteur_bl.read'),
    controller.getByBonLivraison
);

router.get('/',     requirePermission('transporteur_bl.read'),   controller.getAll);
router.get('/:id',  requirePermission('transporteur_bl.read'),   controller.getById);
router.post('/',    requirePermission('transporteur_bl.create'), controller.create);
router.put('/:id',  requirePermission('transporteur_bl.update'), controller.update);
router.delete('/:id', requirePermission('transporteur_bl.delete'), controller.delete);

module.exports = router;
