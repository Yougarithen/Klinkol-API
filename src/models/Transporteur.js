// Model pour les transporteurs - PostgreSQL
const pool = require('../database/connection');

const TRANSPORTEUR_FIELDS = `
  id_transporteur,
  nom,
  numero_rc,
  nif,
  nis,
  n_article,
  chauffeurs,
  camions,
  date_creation
`;

class Transporteur {

    static async getAll() {
        const result = await pool.query(`
      SELECT ${TRANSPORTEUR_FIELDS}
      FROM Transporteur
      ORDER BY nom
    `);
        return result.rows;
    }

    static async getById(id) {
        const result = await pool.query(`
      SELECT ${TRANSPORTEUR_FIELDS}
      FROM Transporteur
      WHERE id_transporteur = $1
    `, [id]);
        return result.rows[0];
    }

    static async create(data) {
        // chauffeurs : tableau de noms → TEXT[]
        // camions    : tableau d'immatriculations → TEXT[]
        const chauffeurs = Array.isArray(data.chauffeurs) ? data.chauffeurs : [];
        const camions    = Array.isArray(data.camions)    ? data.camions    : [];

        const result = await pool.query(`
      INSERT INTO Transporteur (
        nom, numero_rc, nif, nis, n_article,
        chauffeurs, camions
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING ${TRANSPORTEUR_FIELDS}
    `, [
            data.nom,
            data.numero_rc  || null,
            data.nif        || null,
            data.nis        || null,
            data.n_article  || null,
            chauffeurs,
            camions,
        ]);

        return result.rows[0];
    }

    static async update(id, data) {
        const chauffeurs = Array.isArray(data.chauffeurs) ? data.chauffeurs : [];
        const camions    = Array.isArray(data.camions)    ? data.camions    : [];

        const result = await pool.query(`
      UPDATE Transporteur
      SET nom        = $1,
          numero_rc  = $2,
          nif        = $3,
          nis        = $4,
          n_article  = $5,
          chauffeurs = $6,
          camions    = $7
      WHERE id_transporteur = $8
      RETURNING ${TRANSPORTEUR_FIELDS}
    `, [
            data.nom,
            data.numero_rc || null,
            data.nif       || null,
            data.nis       || null,
            data.n_article || null,
            chauffeurs,
            camions,
            id,
        ]);

        return result.rows[0];
    }

    static async delete(id) {
        const result = await pool.query(
            'DELETE FROM Transporteur WHERE id_transporteur = $1',
            [id]
        );
        return result.rowCount;
    }

    // Ajouter un chauffeur au tableau existant
    static async ajouterChauffeur(id, nomChauffeur) {
        const result = await pool.query(`
      UPDATE Transporteur
      SET chauffeurs = array_append(chauffeurs, $1)
      WHERE id_transporteur = $2
        AND NOT ($1 = ANY(chauffeurs))
      RETURNING ${TRANSPORTEUR_FIELDS}
    `, [nomChauffeur, id]);
        return result.rows[0];
    }

    // Retirer un chauffeur du tableau
    static async retirerChauffeur(id, nomChauffeur) {
        const result = await pool.query(`
      UPDATE Transporteur
      SET chauffeurs = array_remove(chauffeurs, $1)
      WHERE id_transporteur = $2
      RETURNING ${TRANSPORTEUR_FIELDS}
    `, [nomChauffeur, id]);
        return result.rows[0];
    }

    // Ajouter une immatriculation de camion
    static async ajouterCamion(id, immatriculation) {
        const result = await pool.query(`
      UPDATE Transporteur
      SET camions = array_append(camions, $1)
      WHERE id_transporteur = $2
        AND NOT ($1 = ANY(camions))
      RETURNING ${TRANSPORTEUR_FIELDS}
    `, [immatriculation, id]);
        return result.rows[0];
    }

    // Retirer une immatriculation de camion
    static async retirerCamion(id, immatriculation) {
        const result = await pool.query(`
      UPDATE Transporteur
      SET camions = array_remove(camions, $1)
      WHERE id_transporteur = $2
      RETURNING ${TRANSPORTEUR_FIELDS}
    `, [immatriculation, id]);
        return result.rows[0];
    }
}

module.exports = Transporteur;
