// Controller ajustements - PostgreSQL
const Ajustement = require('../models/Ajustement');

// Types autorisés pour la validation
const TYPES_VALIDES = ['remise', 'compensation', 'paiement_transport', 'credit'];

exports.getAll = async (req, res) => {
    try {
        const ajustements = await Ajustement.getAll();
        res.json({ success: true, data: ajustements });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const ajustement = await Ajustement.getById(req.params.id);
        if (!ajustement) {
            return res.status(404).json({ success: false, error: 'Ajustement non trouvé' });
        }
        res.json({ success: true, data: ajustement });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getByFacture = async (req, res) => {
    try {
        const ajustements = await Ajustement.getByFacture(req.params.id_facture);
        res.json({ success: true, data: ajustements });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getByClient = async (req, res) => {
    try {
        const ajustements = await Ajustement.getByClient(req.params.id_client);
        res.json({ success: true, data: ajustements });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const { montant, type_ajustement } = req.body;

        if (!montant || isNaN(montant) || Number(montant) <= 0) {
            return res.status(400).json({ success: false, error: 'Montant invalide ou manquant' });
        }

        if (!type_ajustement || !TYPES_VALIDES.includes(type_ajustement)) {
            return res.status(400).json({
                success: false,
                error: `Type d'ajustement invalide. Valeurs acceptées : ${TYPES_VALIDES.join(', ')}`
            });
        }

        const ajustement = await Ajustement.create(req.body);
        res.status(201).json({ success: true, data: ajustement, message: 'Ajustement enregistré' });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        await Ajustement.delete(req.params.id);
        res.json({ success: true, message: 'Ajustement supprimé' });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};