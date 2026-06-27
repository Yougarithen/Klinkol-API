// Controller pour les décharges - PostgreSQL
const Decharge = require('../models/Decharge');

exports.getAll = async (req, res) => {
    try {
        const decharges = await Decharge.getAll();
        res.json({ success: true, data: decharges });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const decharge = await Decharge.getById(req.params.id);
        if (!decharge) {
            return res.status(404).json({ success: false, error: 'Décharge non trouvée' });
        }
        res.json({ success: true, data: decharge });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getByTransporteur = async (req, res) => {
    try {
        const decharges = await Decharge.getByTransporteur(req.params.id_transporteur);
        res.json({ success: true, data: decharges });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getByClient = async (req, res) => {
    try {
        const decharges = await Decharge.getByClient(req.params.id_client);
        res.json({ success: true, data: decharges });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const decharge = await Decharge.create(req.body);
        res.status(201).json({ success: true, data: decharge, message: 'Décharge enregistrée' });
    } catch (error) {
        // Erreur de validation métier (transporteur ET client fournis, ou aucun)
        const statusCode = error.message.includes('doit être liée') ||
                           error.message.includes('ne peut être liée')
            ? 422
            : 400;
        res.status(statusCode).json({ success: false, error: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        await Decharge.delete(req.params.id);
        res.json({ success: true, message: 'Décharge supprimée' });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
