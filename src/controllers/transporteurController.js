// Controller pour les transporteurs - PostgreSQL
const Transporteur = require('../models/Transporteur');

exports.getAll = async (req, res) => {
    try {
        const transporteurs = await Transporteur.getAll();
        res.json({ success: true, data: transporteurs });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const transporteur = await Transporteur.getById(req.params.id);
        if (!transporteur) {
            return res.status(404).json({ success: false, error: 'Transporteur non trouvé' });
        }
        res.json({ success: true, data: transporteur });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const transporteur = await Transporteur.create(req.body);
        res.status(201).json({ success: true, data: transporteur });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const transporteur = await Transporteur.update(req.params.id, req.body);
        if (!transporteur) {
            return res.status(404).json({ success: false, error: 'Transporteur non trouvé' });
        }
        res.json({ success: true, data: transporteur });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        await Transporteur.delete(req.params.id);
        res.json({ success: true, message: 'Transporteur supprimé' });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// POST /transporteurs/:id/chauffeurs  { "nom": "Ali Benali" }
exports.ajouterChauffeur = async (req, res) => {
    try {
        const { nom } = req.body;
        if (!nom) {
            return res.status(400).json({ success: false, error: 'Le nom du chauffeur est requis' });
        }
        const transporteur = await Transporteur.ajouterChauffeur(req.params.id, nom);
        if (!transporteur) {
            return res.status(404).json({ success: false, error: 'Transporteur non trouvé' });
        }
        res.json({ success: true, data: transporteur });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// DELETE /transporteurs/:id/chauffeurs  { "nom": "Ali Benali" }
exports.retirerChauffeur = async (req, res) => {
    try {
        const { nom } = req.body;
        if (!nom) {
            return res.status(400).json({ success: false, error: 'Le nom du chauffeur est requis' });
        }
        const transporteur = await Transporteur.retirerChauffeur(req.params.id, nom);
        if (!transporteur) {
            return res.status(404).json({ success: false, error: 'Transporteur non trouvé' });
        }
        res.json({ success: true, data: transporteur });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// POST /transporteurs/:id/camions  { "immatriculation": "16 TAH 123" }
exports.ajouterCamion = async (req, res) => {
    try {
        const { immatriculation } = req.body;
        if (!immatriculation) {
            return res.status(400).json({ success: false, error: "L'immatriculation est requise" });
        }
        const transporteur = await Transporteur.ajouterCamion(req.params.id, immatriculation);
        if (!transporteur) {
            return res.status(404).json({ success: false, error: 'Transporteur non trouvé' });
        }
        res.json({ success: true, data: transporteur });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// DELETE /transporteurs/:id/camions  { "immatriculation": "16 TAH 123" }
exports.retirerCamion = async (req, res) => {
    try {
        const { immatriculation } = req.body;
        if (!immatriculation) {
            return res.status(400).json({ success: false, error: "L'immatriculation est requise" });
        }
        const transporteur = await Transporteur.retirerCamion(req.params.id, immatriculation);
        if (!transporteur) {
            return res.status(404).json({ success: false, error: 'Transporteur non trouvé' });
        }
        res.json({ success: true, data: transporteur });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
