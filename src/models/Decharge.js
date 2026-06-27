// Model pour les décharges - PostgreSQL
const pool = require('../database/connection');

class Decharge {

    static async getAll() {
        const result = await pool.query(`
      SELECT 
        d.*,
        t.nom AS nom_transporteur,
        c.nom AS nom_fournisseur
      FROM Decharge d
      LEFT JOIN Transporteur t ON d.id_transporteur = t.id_transporteur
      LEFT JOIN Client      c ON d.id_client       = c.id_client
      ORDER BY d.date_decharge DESC
    `);
        return result.rows;
    }

    static async getById(id) {
        const result = await pool.query(`
      SELECT 
        d.*,
        t.nom AS nom_transporteur,
        c.nom AS nom_fournisseur
      FROM Decharge d
      LEFT JOIN Transporteur t ON d.id_transporteur = t.id_transporteur
      LEFT JOIN Client      c ON d.id_client       = c.id_client
      WHERE d.id_decharge = $1
    `, [id]);
        return result.rows[0];
    }

    static async getByTransporteur(id_transporteur) {
        const result = await pool.query(`
      SELECT 
        d.*,
        t.nom AS nom_transporteur
      FROM Decharge d
      LEFT JOIN Transporteur t ON d.id_transporteur = t.id_transporteur
      WHERE d.id_transporteur = $1
      ORDER BY d.date_decharge DESC
    `, [id_transporteur]);
        return result.rows;
    }

    static async getByClient(id_client) {
        const result = await pool.query(`
      SELECT 
        d.*,
        c.nom AS nom_fournisseur
      FROM Decharge d
      LEFT JOIN Client c ON d.id_client = c.id_client
      WHERE d.id_client = $1
      ORDER BY d.date_decharge DESC
    `, [id_client]);
        return result.rows;
    }

    static async create(data) {
        // Validation : une seule des deux colonnes doit être remplie
        if (data.id_transporteur && data.id_client) {
            throw new Error('Une décharge ne peut être liée qu\'à un transporteur OU à un fournisseur, pas les deux');
        }
        if (!data.id_transporteur && !data.id_client) {
            throw new Error('Une décharge doit être liée à un transporteur ou à un fournisseur');
        }

        const result = await pool.query(`
      INSERT INTO Decharge (
        id_transporteur,
        id_client,
        montant,
        date_decharge,
        mode_paiement,
        reference,
        responsable,
        commentaire
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
            data.id_transporteur || null,
            data.id_client       || null,
            data.montant,
            data.date_decharge   || new Date().toISOString(),
            data.mode_paiement   || null,
            data.reference       || null,
            data.responsable     || null,
            data.commentaire     || null,
        ]);

        return result.rows[0];
    }

    static async delete(id) {
        const result = await pool.query(
            'DELETE FROM Decharge WHERE id_decharge = $1',
            [id]
        );
        return result.rowCount;
    }
}

module.exports = Decharge;
