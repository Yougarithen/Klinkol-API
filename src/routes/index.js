// src/routes/index.js - Fichier principal des routes - VERSION SÉCURISÉE
const express = require('express');
const router = express.Router();
const { auditMiddleware } = require('../middleware/securityMiddleware');

// Importer toutes les routes
const matierePremiereRoutes = require('./matierePremiereRoutes');
const produitRoutes = require('./produitRoutes');
const clientRoutes = require('./clientRoutes');
const devisRoutes = require('./devisRoutes');
const factureRoutes = require('./factureRoutes');
const paiementRoutes = require('./paiementRoutes');
const inventaireRoutes = require('./inventaireRoutes');
const productionRoutes = require('./productionRoutes');
const ajustementStockRoutes = require('./ajustementStockRoutes');
const recetteProductionRoutes = require('./recetteProductionRoutes');
const ligneDevisRoutes = require('./ligneDevisRoutes');
const ligneFactureRoutes = require('./ligneFactureRoutes');
const inventaireMatiereRoutes = require('./inventaireMatiereRoutes');
const inventaireProduitRoutes = require('./inventaireProduitRoutes');
const ravitaillementRoutes = require('./ravitaillementRoutes');
const regionRoutes = require('./regionRoutes');
const transporteurRoutes = require('./transporteurRoutes');
const ajustementRoutes = require('./ajustementRoutes');
const transporteurBLRoutes = require('./transporteurBLRoutes');
const transporteurRavitaillementRoutes = require('./transporteurRavitaillementRoutes');
// Importer les routes d'authentification et de sécurité
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const securityRoutes = require('./securityRoutes');
const dechargeRoutes = require('./dechargeRoutes');
// ============================================================
// ROUTES PUBLIQUES (authentification)
// ============================================================
router.use('/auth', authRoutes);

// ============================================================
// ROUTES DE SÉCURITÉ (admin uniquement)
// ============================================================
router.use('/security', securityRoutes);

// ============================================================
// ROUTES PROTÉGÉES (toutes nécessitent authentification)
// ============================================================

router.use('/users', userRoutes);
router.use('/matieres', matierePremiereRoutes);
router.use('/produits', produitRoutes);
router.use('/clients', clientRoutes);
router.use('/devis', devisRoutes);
router.use('/factures', factureRoutes);
router.use('/paiements', paiementRoutes);
router.use('/regions', regionRoutes);
router.use('/production', productionRoutes);
router.use('/inventaires', inventaireRoutes);
router.use('/recettes', recetteProductionRoutes);
router.use('/lignes-devis', ligneDevisRoutes);
router.use('/lignes-facture', ligneFactureRoutes);
router.use('/inventaire-matieres', inventaireMatiereRoutes);
router.use('/inventaire-produits', inventaireProduitRoutes);
router.use('/ravitaillements', ravitaillementRoutes);
router.use('/transporteurs', transporteurRoutes);
router.use('/transporteur-bl', transporteurBLRoutes);
router.use('/transporteur-ravitaillement', transporteurRavitaillementRoutes);
// ✅ Ajustements financiers (remises, avoirs, compensations...)
router.use('/ajustements', ajustementRoutes);

// ✅ Ajustements de stock sur une route distincte
router.use('/ajustements-stock', ajustementStockRoutes);
router.use('/decharges', dechargeRoutes);
// ============================================================
// ROUTE DE DOCUMENTATION
// ============================================================
router.get('/', (req, res) => {
    res.json({
        message: '🚀 API ERP Gestion de Stock - Sécurisée',
        version: '2.0.0',
        security: '🔒 Authentification JWT + Permissions',
        endpoints: {
            auth: {
                register: 'POST /api/auth/register',
                login: 'POST /api/auth/login',
                logout: 'POST /api/auth/logout (protected)',
                profile: 'GET /api/auth/profile (protected)',
                changePassword: 'POST /api/auth/change-password (protected)',
                verify: 'GET /api/auth/verify (protected)',
                loginHistory: 'GET /api/auth/login-history (protected)',
                sessions: 'GET /api/auth/sessions (protected)'
            },
            users: {
                list: 'GET /api/users (protected - users.read)',
                get: 'GET /api/users/:id (protected - users.read)',
                create: 'POST /api/users (protected - users.create)',
                update: 'PUT /api/users/:id (protected - users.update)',
                delete: 'DELETE /api/users/:id (protected - users.delete)',
                permissions: 'GET /api/users/:id/permissions (protected - users.read)'
            },
            security: {
                config: 'GET/PUT /api/security/config (admin)',
                audit: 'GET /api/security/audit (admin)',
                loginAttempts: 'GET /api/security/login-attempts (admin)',
                activeSessions: 'GET /api/security/active-sessions (admin)',
                statistics: 'GET /api/security/statistics (admin)'
            },
            matieres: 'GET /api/matieres (protected - matieres.read)',
            produits: 'GET /api/produits (protected - produits.read)',
            clients: 'GET /api/clients (protected - clients.read)',
            devis: 'GET /api/devis (protected - devis.read)',
            factures: 'GET /api/factures (protected - factures.read)',
            paiements: 'GET /api/paiements (protected - paiements.read)',
            inventaires: 'GET /api/inventaires (protected - inventaires.read)',
            production: 'GET /api/production (protected - production.read)',
            ajustements: 'GET /api/ajustements (protected - ajustements.read)',
            ajustementsStock: 'GET /api/ajustements-stock (protected - inventaires.read)',
            recettes: 'GET /api/recettes (protected - production.read)',
            lignesDevis: 'GET /api/lignes-devis (protected - devis.read)',
            lignesFacture: 'GET /api/lignes-facture (protected - factures.read)',
            inventaireMatieres: 'GET /api/inventaire-matieres (protected - inventaires.read)',
            inventaireProduits: 'GET /api/inventaire-produits (protected - inventaires.read)'
        },
        permissions: {
            description: 'Système de permissions granulaire par module',
            modules: [
                'users (create, read, update, delete)',
                'clients (create, read, update, delete)',
                'produits (create, read, update, delete)',
                'matieres (create, read, update, delete)',
                'devis (create, read, update, delete, validate)',
                'factures (create, read, update, delete, validate)',
                'paiements (create, read, delete)',
                'production (create, read, delete)',
                'inventaires (create, read, update, validate)',
                'ajustements (create, read, delete)',
                'rapports (view, export)',
                'settings (read, update)'
            ]
        },
        roles: {
            ADMIN: 'Toutes les permissions',
            GESTIONNAIRE: 'Toutes sauf users/settings',
            VENDEUR: 'Clients, devis, factures, paiements',
            MAGASINIER: 'Stock, production, inventaires',
            LECTEUR: 'Lecture seule'
        }
    });
});

module.exports = router;