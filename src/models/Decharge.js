// Model pour les décharges - PostgreSQL
const pool = require('../database/connection');

class Decharge {

    static async getAll() {
        const result = await pool.query(`
      SELECT *
      FROM Vue_Decharges
      ORDER BY date_decharge DESC
    `);
        return result.rows;
    }

    static async getById(id) {
        const result = await pool.query(`
      SELECT *
      FROM Vue_Decharges
      WHERE id_decharge = $1
    `, [id]);
        return result.rows[0];
    }

    static async getByTransporteur(id_transporteur) {
        const result = await pool.query(`
      SELECT *
      FROM Vue_Decharges
      WHERE id_transporteur = $1
      ORDER BY date_decharge DESC
    `, [id_transporteur]);
        return result.rows;
    }

    static async getByClient(id_client) {
        const result = await pool.query(`
      SELECT *
      FROM Vue_Decharges
      WHERE id_client = $1
      ORDER BY date_decharge DESC
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
            data.id_client || null,
            data.montant,
            data.date_decharge || new Date().toISOString(),
            data.mode_paiement || null,
            data.reference || null,
            data.responsable || null,
            data.commentaire || null,
        ]);

        // On retourne la ligne enrichie depuis la vue
        const enrichi = await pool.query(`
      SELECT * FROM Vue_Decharges WHERE id_decharge = $1
    `, [result.rows[0].id_decharge]);

        return enrichi.rows[0];
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