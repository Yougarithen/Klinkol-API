// Controller pour le suivi des transports de ravitaillements - PostgreSQL
const TransporteurRavitaillement = require('../models/TransporteurRavitaillement');

exports.getAll = async (req, res) => {
    try {
        const transports = await TransporteurRavitaillement.getAll();
        res.json({ success: true, data: transports });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const transport = await TransporteurRavitaillement.getById(req.params.id);
        if (!transport) {
            return res.status(404).json({ success: false, error: 'Transport ravitaillement non trouvé' });
        }
        res.json({ success: true, data: transport });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// GET /transporteur-ravitaillement/transporteur/:id_transporteur
exports.getByTransporteur = async (req, res) => {
    try {
        const transports = await TransporteurRavitaillement.getByTransporteur(req.params.id_transporteur);
        res.json({ success: true, data: transports });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// GET /transporteur-ravitaillement/ravitaillement/:id_ravitaillement
exports.getByRavitaillement = async (req, res) => {
    try {
        const transports = await TransporteurRavitaillement.getByRavitaillement(req.params.id_ravitaillement);
        res.json({ success: true, data: transports });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const { id_transporteur, id_ravitaillement } = req.body;
        if (!id_transporteur || !id_ravitaillement) {
            return res.status(400).json({
                success: false,
                error: 'Les champs id_transporteur et id_ravitaillement sont requis'
            });
        }
        const transport = await TransporteurRavitaillement.create(req.body);
        res.status(201).json({ success: true, data: transport });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const transport = await TransporteurRavitaillement.update(req.params.id, req.body);
        if (!transport) {
            return res.status(404).json({ success: false, error: 'Transport ravitaillement non trouvé' });
        }
        res.json({ success: true, data: transport });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        await TransporteurRavitaillement.delete(req.params.id);
        res.json({ success: true, message: 'Transport ravitaillement supprimé' });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
