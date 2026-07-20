// Controller lignes facture - PostgreSQL LL
const LigneFacture = require('../models/LigneFacture');

// Envoie une réponse JSON de façon sûre : si l'objet contient quoi que ce soit
// de non sérialisable (ex: une erreur pg brute avec une référence de socket),
// on retombe sur un message texte simple au lieu de faire planter la requête.
function safeJson(res, status, payload) {
    try {
        res.status(status).json(payload);
    } catch (e) {
        res.status(status).json({
            success: false,
            error: typeof payload?.error === 'string' ? payload.error : 'Erreur serveur (réponse non sérialisable)',
        });
    }
}

function safeErrorMessage(error) {
    if (!error) return 'Erreur inconnue';
    if (typeof error.message === 'string') return error.message;
    try {
        return String(error);
    } catch {
        return 'Erreur inconnue';
    }
}

exports.getAll = async (req, res) => {
    try {
        const lignes = await LigneFacture.getAll();
        safeJson(res, 200, { success: true, data: lignes });
    } catch (error) {
        safeJson(res, 500, { success: false, error: safeErrorMessage(error) });
    }
};

exports.getById = async (req, res) => {
    try {
        const ligne = await LigneFacture.getById(req.params.id);
        if (!ligne) {
            return safeJson(res, 404, { success: false, error: 'Ligne non trouvée' });
        }
        safeJson(res, 200, { success: true, data: ligne });
    } catch (error) {
        safeJson(res, 500, { success: false, error: safeErrorMessage(error) });
    }
};

exports.getByFacture = async (req, res) => {
    try {
        const lignes = await LigneFacture.getByFacture(req.params.id_facture);
        safeJson(res, 200, { success: true, data: lignes });
    } catch (error) {
        safeJson(res, 500, { success: false, error: safeErrorMessage(error) });
    }
};

exports.create = async (req, res) => {
    try {
        const ligne = await LigneFacture.create(req.body);
        safeJson(res, 201, { success: true, data: ligne });
    } catch (error) {
        safeJson(res, 400, { success: false, error: safeErrorMessage(error) });
    }
};

exports.update = async (req, res) => {
    try {
        const ligne = await LigneFacture.update(req.params.id, req.body);
        safeJson(res, 200, { success: true, data: ligne });
    } catch (error) {
        console.error('Erreur update ligne facture:', safeErrorMessage(error));
        safeJson(res, 400, { success: false, error: safeErrorMessage(error) });
    }
};

exports.delete = async (req, res) => {
    try {
        await LigneFacture.delete(req.params.id);
        safeJson(res, 200, { success: true, message: 'Ligne supprimée' });
    } catch (error) {
        safeJson(res, 400, { success: false, error: safeErrorMessage(error) });
    }
};

exports.calculerTotaux = async (req, res) => {
    try {
        const totaux = await LigneFacture.calculerTotaux(req.params.id);
        safeJson(res, 200, { success: true, data: totaux });
    } catch (error) {
        safeJson(res, 500, { success: false, error: safeErrorMessage(error) });
    }
};

exports.verifierStock = async (req, res) => {
    try {
        const { id_produit, quantite } = req.body;
        const verification = await LigneFacture.verifierStock(id_produit, quantite);
        safeJson(res, 200, { success: true, data: verification });
    } catch (error) {
        safeJson(res, 400, { success: false, error: safeErrorMessage(error) });
    }
};