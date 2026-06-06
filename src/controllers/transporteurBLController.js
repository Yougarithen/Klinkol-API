// Controller pour le suivi des transports de bons de livraison - PostgreSQL
const TransporteurBL = require('../models/TransporteurBL');

exports.getAll = async (req, res) => {
    try {
        const transports = await TransporteurBL.getAll();
        res.json({ success: true, data: transports });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const transport = await TransporteurBL.getById(req.params.id);
        if (!transport) {
            return res.status(404).json({ success: false, error: 'Transport non trouvé' });
        }
        res.json({ success: true, data: transport });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// GET /transporteur-bl/transporteur/:id_transporteur
exports.getByTransporteur = async (req, res) => {
    try {
        const transports = await TransporteurBL.getByTransporteur(req.params.id_transporteur);
        res.json({ success: true, data: transports });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// GET /transporteur-bl/bon-livraison/:id_bon_livraison
exports.getByBonLivraison = async (req, res) => {
    try {
        const transports = await TransporteurBL.getByBonLivraison(req.params.id_bon_livraison);
        res.json({ success: true, data: transports });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const transport = await TransporteurBL.create(req.body);
        res.status(201).json({ success: true, data: transport });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const transport = await TransporteurBL.update(req.params.id, req.body);
        if (!transport) {
            return res.status(404).json({ success: false, error: 'Transport non trouvé' });
        }
        res.json({ success: true, data: transport });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        await TransporteurBL.delete(req.params.id);
        res.json({ success: true, message: 'Transport supprimé' });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
