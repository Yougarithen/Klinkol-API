// Model pour le suivi des transports de ravitaillements - PostgreSQL
const pool = require('../database/connection');

const TRANSPORTEUR_RAVITAILLEMENT_FIELDS = `
  tr.id_transport_ravitaillement,
  tr.id_transporteur,
  tr.id_ravitaillement,
  tr.montant,
  tr.commentaire,
  tr.date_creation,
  t.nom              AS transporteur_nom,
  r.date_ravitaillement,
  m.nom              AS nom_matiere
`;

class TransporteurRavitaillement {

    static async getAll() {
        const result = await pool.query(`
      SELECT ${TRANSPORTEUR_RAVITAILLEMENT_FIELDS}
      FROM TransporteurRavitaillement tr
      JOIN Transporteur    t ON tr.id_transporteur   = t.id_transporteur
      JOIN Ravitaillement  r ON tr.id_ravitaillement  = r.id_ravitaillement
      JOIN MatierePremiere m ON r.id_matiere          = m.id_matiere
      ORDER BY tr.date_creation DESC
    `);
        return result.rows;
    }

    static async getById(id) {
        const result = await pool.query(`
      SELECT ${TRANSPORTEUR_RAVITAILLEMENT_FIELDS}
      FROM TransporteurRavitaillement tr
      JOIN Transporteur    t ON tr.id_transporteur   = t.id_transporteur
      JOIN Ravitaillement  r ON tr.id_ravitaillement  = r.id_ravitaillement
      JOIN MatierePremiere m ON r.id_matiere          = m.id_matiere
      WHERE tr.id_transport_ravitaillement = $1
    `, [id]);
        return result.rows[0];
    }

    // Tous les transports d'un transporteur donné
    static async getByTransporteur(id_transporteur) {
        const result = await pool.query(`
      SELECT ${TRANSPORTEUR_RAVITAILLEMENT_FIELDS}
      FROM TransporteurRavitaillement tr
      JOIN Transporteur    t ON tr.id_transporteur   = t.id_transporteur
      JOIN Ravitaillement  r ON tr.id_ravitaillement  = r.id_ravitaillement
      JOIN MatierePremiere m ON r.id_matiere          = m.id_matiere
      WHERE tr.id_transporteur = $1
      ORDER BY tr.date_creation DESC
    `, [id_transporteur]);
        return result.rows;
    }

    // Tous les transports liés à un ravitaillement donné
    static async getByRavitaillement(id_ravitaillement) {
        const result = await pool.query(`
      SELECT ${TRANSPORTEUR_RAVITAILLEMENT_FIELDS}
      FROM TransporteurRavitaillement tr
      JOIN Transporteur    t ON tr.id_transporteur   = t.id_transporteur
      JOIN Ravitaillement  r ON tr.id_ravitaillement  = r.id_ravitaillement
      JOIN MatierePremiere m ON r.id_matiere          = m.id_matiere
      WHERE tr.id_ravitaillement = $1
      ORDER BY tr.date_creation DESC
    `, [id_ravitaillement]);
        return result.rows;
    }

    static async create(data) {
        const result = await pool.query(`
      INSERT INTO TransporteurRavitaillement (
        id_transporteur,
        id_ravitaillement,
        montant,
        commentaire
      )
      VALUES ($1, $2, $3, $4)
      RETURNING id_transport_ravitaillement
    `, [
            data.id_transporteur,
            data.id_ravitaillement,
            data.montant     ?? null,
            data.commentaire || null,
        ]);

        return this.getById(result.rows[0].id_transport_ravitaillement);
    }

    static async update(id, data) {
        const result = await pool.query(`
      UPDATE TransporteurRavitaillement
      SET id_transporteur   = $1,
          id_ravitaillement = $2,
          montant           = $3,
          commentaire       = $4
      WHERE id_transport_ravitaillement = $5
      RETURNING id_transport_ravitaillement
    `, [
            data.id_transporteur,
            data.id_ravitaillement,
            data.montant     ?? null,
            data.commentaire || null,
            id,
        ]);

        if (!result.rows[0]) return null;
        return this.getById(result.rows[0].id_transport_ravitaillement);
    }

    static async delete(id) {
        const result = await pool.query(
            'DELETE FROM TransporteurRavitaillement WHERE id_transport_ravitaillement = $1',
            [id]
        );
        return result.rowCount;
    }
}

module.exports = TransporteurRavitaillement;
