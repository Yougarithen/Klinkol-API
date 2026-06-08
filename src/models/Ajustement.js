// Model pour les ajustements (remises, compensations, avoirs, escomptes...) - PostgreSQL
const pool = require('../database/connection');

class Ajustement {

    static async getAll() {
        const result = await pool.query(`
      SELECT a.*, f.numero_facture, c.nom as client
      FROM Ajustement a
      LEFT JOIN Facture f ON a.id_facture = f.id_facture
      LEFT JOIN Client c ON a.id_client = c.id_client
      ORDER BY a.date_ajustement DESC
    `);
        return result.rows;
    }

    static async getById(id) {
        const result = await pool.query('SELECT * FROM Ajustement WHERE id_ajustement = $1', [id]);
        return result.rows[0];
    }

    static async getByFacture(id_facture) {
        const result = await pool.query(
            'SELECT * FROM Ajustement WHERE id_facture = $1 ORDER BY date_ajustement DESC',
            [id_facture]
        );
        return result.rows;
    }

    static async getByClient(id_client) {
        const result = await pool.query(`
      SELECT a.*, f.numero_facture, c.nom as client
      FROM Ajustement a
      LEFT JOIN Facture f ON a.id_facture = f.id_facture
      LEFT JOIN Client c ON (a.id_client = c.id_client OR f.id_client = c.id_client)
      WHERE a.id_client = $1 OR f.id_client = $1
      ORDER BY a.date_ajustement DESC
    `, [id_client]);
        return result.rows;
    }

    static async create(data) {
        const result = await pool.query(`
      INSERT INTO Ajustement (
        id_facture, id_client, type_ajustement, montant, date_ajustement,
        motif, reference, responsable, commentaire
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [
            data.id_facture     || null,
            data.id_client      || null,
            data.type_ajustement,               // 'remise' | 'compensation' | 'avoir' | 'escompte' | 'autre'
            data.montant,
            data.date_ajustement || new Date().toISOString(),
            data.motif          || null,
            data.reference      || null,
            data.responsable    || null,
            data.commentaire    || null
        ]);

        return result.rows[0];
    }

    static async delete(id) {
        const result = await pool.query('DELETE FROM Ajustement WHERE id_ajustement = $1', [id]);
        return result.rowCount;
    }
}

module.exports = Ajustement;
