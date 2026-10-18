// Model pour les ajustements FTPM - PostgreSQL
// (distinct du module « Ajustement » : remise / compensation / paiement transport / crédit)
const pool = require('../database/connection');

const AJUSTEMENT_SELECT = `
  a.id_ajustement_ftpm,
  a.id_client,
  a.id_transporteur,
  a.type,
  a.montant,
  a.motif,
  a.date_creation,
  c.nom AS client_nom,
  t.nom AS transporteur_nom
`;

const AJUSTEMENT_FROM = `
  FROM AjustementFTPM a
  LEFT JOIN Client c       ON c.id_client = a.id_client
  LEFT JOIN Transporteur t ON t.id_transporteur = a.id_transporteur
`;

class AjustementFTPM {

    static TYPES = ['REMBOURSEMENT', 'CREDIT', 'CREANCE_ANTERIEURE', 'PRESTATION_SERVICE'];

    // Filtres optionnels : { id_client, id_transporteur, type }
    static async getAll(filters = {}) {
        const conditions = [];
        const params = [];

        if (filters.id_client) {
            params.push(filters.id_client);
            conditions.push(`a.id_client = $${params.length}`);
        }
        if (filters.id_transporteur) {
            params.push(filters.id_transporteur);
            conditions.push(`a.id_transporteur = $${params.length}`);
        }
        if (filters.type) {
            params.push(filters.type);
            conditions.push(`a.type = $${params.length}`);
        }

        const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
        const result = await pool.query(`
      SELECT ${AJUSTEMENT_SELECT}
      ${AJUSTEMENT_FROM}
      ${where}
      ORDER BY a.date_creation DESC, a.id_ajustement_ftpm DESC
    `, params);
        return result.rows;
    }

    static async getById(id) {
        const result = await pool.query(`
      SELECT ${AJUSTEMENT_SELECT}
      ${AJUSTEMENT_FROM}
      WHERE a.id_ajustement_ftpm = $1
    `, [id]);
        return result.rows[0];
    }

    static async getByClient(idClient) {
        return this.getAll({ id_client: idClient });
    }

    static async getByTransporteur(idTransporteur) {
        return this.getAll({ id_transporteur: idTransporteur });
    }

    // Un ajustement FTPM ne peut concerner qu'un client dont le TypeC est « Fournisseur »
    static async estFournisseur(idClient) {
        const result = await pool.query(`
      SELECT 1 FROM Client
      WHERE id_client = $1 AND LOWER(TRIM(typec)) = 'fournisseur'
    `, [idClient]);
        return result.rowCount > 0;
    }

    static async verifierCible(data) {
        if (data.id_client && !(await this.estFournisseur(data.id_client))) {
            throw new Error("Un ajustement FTPM ne peut concerner qu'un client de type Fournisseur");
        }
    }

    static async create(data) {
        await this.verifierCible(data);
        const result = await pool.query(`
      INSERT INTO AjustementFTPM (id_client, id_transporteur, type, montant, motif)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id_ajustement_ftpm
    `, [
            data.id_client || null,
            data.id_transporteur || null,
            data.type,
            data.montant,
            data.motif || null,
        ]);
        return this.getById(result.rows[0].id_ajustement_ftpm);
    }

    static async update(id, data) {
        await this.verifierCible(data);
        const result = await pool.query(`
      UPDATE AjustementFTPM
      SET id_client       = $1,
          id_transporteur = $2,
          type            = $3,
          montant         = $4,
          motif           = $5
      WHERE id_ajustement_ftpm = $6
      RETURNING id_ajustement_ftpm
    `, [
            data.id_client || null,
            data.id_transporteur || null,
            data.type,
            data.montant,
            data.motif || null,
            id,
        ]);
        if (!result.rows[0]) return undefined;
        return this.getById(id);
    }

    static async delete(id) {
        const result = await pool.query('DELETE FROM AjustementFTPM WHERE id_ajustement_ftpm = $1', [id]);
        return result.rowCount;
    }

    // Totaux par type pour un client ou un transporteur
    static async getTotaux({ id_client, id_transporteur }) {
        const col = id_client ? 'id_client' : 'id_transporteur';
        const result = await pool.query(`
      SELECT type, SUM(montant) AS total, COUNT(*)::int AS nombre
      FROM AjustementFTPM
      WHERE ${col} = $1
      GROUP BY type
      ORDER BY type
    `, [id_client || id_transporteur]);
        return result.rows;
    }
}

module.exports = AjustementFTPM;
