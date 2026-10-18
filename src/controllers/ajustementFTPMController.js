// Controller pour les ajustements FTPM - PostgreSQL
// (distinct du controller « ajustement » existant)
const Ajustement = require('../models/AjustementFTPM');

// Valide le body : exactement un des deux ids, type connu, montant > 0
function validate(body) {
    const { id_client, id_transporteur, type, montant } = body;

    if (!!id_client === !!id_transporteur) {
        return 'Renseigner soit id_client, soit id_transporteur (un seul des deux)';
    }
    if (!type || !Ajustement.TYPES.includes(type)) {
        return `Type invalide. Valeurs acceptées : ${Ajustement.TYPES.join(', ')}`;
    }
    const m = Number(montant);
    if (!Number.isFinite(m) || m <= 0) {
        return 'Le montant doit être un nombre supérieur à 0';
    }
    return null;
}

// 23503 = foreign_key_violation (client/transporteur inexistant)
function errorMessage(error) {
    if (error.code === '23503') return 'Client ou transporteur introuvable';
    return error.message;
}

exports.getAll = async (req, res) => {
    try {
        const { id_client, id_transporteur, type } = req.query;
        const data = await Ajustement.getAll({ id_client, id_transporteur, type });
        res.json({ success: true, data });
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

exports.getByClient = async (req, res) => {
    try {
        const data = await Ajustement.getByClient(req.params.id);
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getByTransporteur = async (req, res) => {
    try {
        const data = await Ajustement.getByTransporteur(req.params.id);
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getTotauxClient = async (req, res) => {
    try {
        const data = await Ajustement.getTotaux({ id_client: req.params.id });
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getTotauxTransporteur = async (req, res) => {
    try {
        const data = await Ajustement.getTotaux({ id_transporteur: req.params.id });
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getTypes = async (req, res) => {
    res.json({ success: true, data: Ajustement.TYPES.map(type => ({ type })) });
};

exports.create = async (req, res) => {
    try {
        const err = validate(req.body);
        if (err) return res.status(400).json({ success: false, error: err });

        const ajustement = await Ajustement.create(req.body);
        res.status(201).json({ success: true, data: ajustement });
    } catch (error) {
        res.status(400).json({ success: false, error: errorMessage(error) });
    }
};

exports.update = async (req, res) => {
    try {
        const err = validate(req.body);
        if (err) return res.status(400).json({ success: false, error: err });

        const ajustement = await Ajustement.update(req.params.id, req.body);
        if (!ajustement) {
            return res.status(404).json({ success: false, error: 'Ajustement non trouvé' });
        }
        res.json({ success: true, data: ajustement });
    } catch (error) {
        res.status(400).json({ success: false, error: errorMessage(error) });
    }
};

exports.delete = async (req, res) => {
    try {
        const count = await Ajustement.delete(req.params.id);
        if (!count) {
            return res.status(404).json({ success: false, error: 'Ajustement non trouvé' });
        }
        res.json({ success: true, message: 'Ajustement supprimé' });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
