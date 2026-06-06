// Model pour le suivi des transports de bons de livraison - PostgreSQL
const pool = require('../database/connection');

const TRANSPORTEUR_BL_FIELDS = `
  tbl.id_transport,
  tbl.id_transporteur,
  tbl.id_bon_livraison,
  tbl.montant,
  tbl.commentaire,
  tbl.date_creation,
  t.nom              AS transporteur_nom,
  f.numero_facture   AS numero_bl
`;

class TransporteurBL {

    static async getAll() {
        const result = await pool.query(`
      SELECT ${TRANSPORTEUR_BL_FIELDS}
      FROM TransporteurBL tbl
      JOIN Transporteur t ON tbl.id_transporteur    = t.id_transporteur
      JOIN Facture      f ON tbl.id_bon_livraison    = f.id_facture
      ORDER BY tbl.date_creation DESC
    `);
        return result.rows;
    }

    static async getById(id) {
        const result = await pool.query(`
      SELECT ${TRANSPORTEUR_BL_FIELDS}
      FROM TransporteurBL tbl
      JOIN Transporteur t ON tbl.id_transporteur  = t.id_transporteur
      JOIN Facture      f ON tbl.id_bon_livraison  = f.id_facture
      WHERE tbl.id_transport = $1
    `, [id]);
        return result.rows[0];
    }

    // Tous les transports d'un transporteur donné
    static async getByTransporteur(id_transporteur) {
        const result = await pool.query(`
      SELECT ${TRANSPORTEUR_BL_FIELDS}
      FROM TransporteurBL tbl
      JOIN Transporteur t ON tbl.id_transporteur  = t.id_transporteur
      JOIN Facture      f ON tbl.id_bon_livraison  = f.id_facture
      WHERE tbl.id_transporteur = $1
      ORDER BY tbl.date_creation DESC
    `, [id_transporteur]);
        return result.rows;
    }

    // Tous les transports liés à un bon de livraison donné
    static async getByBonLivraison(id_bon_livraison) {
        const result = await pool.query(`
      SELECT ${TRANSPORTEUR_BL_FIELDS}
      FROM TransporteurBL tbl
      JOIN Transporteur t ON tbl.id_transporteur  = t.id_transporteur
      JOIN Facture      f ON tbl.id_bon_livraison  = f.id_facture
      WHERE tbl.id_bon_livraison = $1
      ORDER BY tbl.date_creation DESC
    `, [id_bon_livraison]);
        return result.rows;
    }

    static async create(data) {
        const result = await pool.query(`
      INSERT INTO TransporteurBL (
        id_transporteur,
        id_bon_livraison,
        montant,
        commentaire
      )
      VALUES ($1, $2, $3, $4)
      RETURNING id_transport
    `, [
            data.id_transporteur,
            data.id_bon_livraison,
            data.montant        ?? null,
            data.commentaire    || null,
        ]);

        // Retourner l'enregistrement complet avec les jointures
        return this.getById(result.rows[0].id_transport);
    }

    static async update(id, data) {
        const result = await pool.query(`
      UPDATE TransporteurBL
      SET id_transporteur  = $1,
          id_bon_livraison = $2,
          montant          = $3,
          commentaire      = $4
      WHERE id_transport = $5
      RETURNING id_transport
    `, [
            data.id_transporteur,
            data.id_bon_livraison,
            data.montant        ?? null,
            data.commentaire    || null,
            id,
        ]);

        if (!result.rows[0]) return null;
        return this.getById(result.rows[0].id_transport);
    }

    static async delete(id) {
        const result = await pool.query(
            'DELETE FROM TransporteurBL WHERE id_transport = $1',
            [id]
        );
        return result.rowCount;
    }
}

module.exports = TransporteurBL;
