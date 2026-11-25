// ========== factureRoutes.js - SÉCURISÉ ==========
const express = require('express');
const router = express.Router();
const controller = require('../controllers/factureController');
const { authenticate, requirePermission } = require('../middleware/authMiddleware');

router.use(authenticate);

// ============================================================
// IMPORTANT : les routes FIXES doivent être déclarées AVANT les routes
// avec paramètre (/:id), sinon Express interprète "historique", "credit"…
// comme un id (erreur : invalid input syntax for type integer).
// ============================================================

// ---------- Routes fixes ----------
router.get('/credit', requirePermission('factures.read'), controller.getFacturesCredit);
router.get('/historique', requirePermission('factures.read'), controller.getHistoriqueGlobal);
router.get('/client/:id_client/bons-non-factures', requirePermission('factures.read'), controller.getBonsLivraisonNonFactures);
router.post('/depuis-bons', requirePermission('factures.create'), controller.creerFactureDepuisBons);

// ---------- Liste / création ----------
router.get('/', requirePermission('factures.read'), controller.getAll);
router.post('/', requirePermission('factures.create'), controller.create);

// ---------- Routes avec :id ----------
router.get('/:id', requirePermission('factures.read'), controller.getById);
router.put('/:id', requirePermission('factures.update'), controller.update);
router.delete('/:id', requirePermission('factures.delete'), controller.delete);

router.get('/:id/historique', requirePermission('factures.read'), controller.getHistorique);
router.get('/:id/bons-livraison', requirePermission('factures.read'), controller.getBonsLivraisonDeFacture);

router.put('/:id/statut', requirePermission('factures.update'), controller.changerStatut);
router.post('/:id/valider', requirePermission('factures.update'), controller.valider);

// ---------- Lignes ----------
router.post('/:id/lignes', requirePermission('factures.update'), controller.ajouterLigne);
router.put('/:id/lignes/:id_ligne', requirePermission('factures.update'), controller.updateLigne);
router.delete('/:id/lignes/:id_ligne', requirePermission('factures.update'), controller.deleteLigne);

module.exports = router;