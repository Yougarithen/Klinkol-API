// Model pour les clients - PostgreSQL
const pool = require('../database/connection');

const CLIENT_FIELDS = `
  id_client,
  nom,
  numero_rc,
  nif,
  nis,
  n_article,
  adresse,
  region,
  contact,
  telephone,
  email,
  assujetti_tva,
  typec AS "TypeC",
  statut,
  prete_nom,
  logo_url,
  date_creation
`;

class Client {

    static async getAll() {
        const result = await pool.query(`
      SELECT ${CLIENT_FIELDS}
      FROM Client 
      ORDER BY nom
    `);
        return result.rows;
    }

    static async getById(id) {
        const result = await pool.query(`
      SELECT ${CLIENT_FIELDS}
      FROM Client 
      WHERE id_client = $1
    `, [id]);
        return result.rows[0];
    }

    static async create(data) {
        const result = await pool.query(`
      INSERT INTO Client (
        nom, numero_rc, nif, nis, n_article,
        adresse, region, contact, telephone, email,
        assujetti_tva, typec, statut,
        prete_nom, logo_url
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING ${CLIENT_FIELDS}
    `, [
            data.nom,
            data.numero_rc || null,
            data.nif || null,
            data.nis || null,
            data.n_article || null,
            data.adresse || null,
            data.region || null,
            data.contact || null,
            data.telephone || null,
            data.email || null,
            data.assujetti_tva !== undefined ? data.assujetti_tva : true,
            data.TypeC || 'Entreprise',
            data.statut || 'OK',
            data.prete_nom || null,
            data.logo_url || null,
        ]);

        return result.rows[0];
    }

    static async update(id, data) {
        const result = await pool.query(`
      UPDATE Client 
      SET nom           = $1,
          numero_rc     = $2,
          nif           = $3,
          nis           = $4,
          n_article     = $5,
          adresse       = $6,
          region        = $7,
          contact       = $8,
          telephone     = $9,
          email         = $10,
          assujetti_tva = $11,
          typec         = $12,
          statut        = $13,
          prete_nom     = $14,
          logo_url      = $15
      WHERE id_client = $16
      RETURNING ${CLIENT_FIELDS}
    `, [
            data.nom,
            data.numero_rc,
            data.nif,
            data.nis,
            data.n_article,
            data.adresse,
            data.region,
            data.contact,
            data.telephone,
            data.email,
            data.assujetti_tva,
            data.TypeC || 'Entreprise',
            data.statut || 'OK',
            data.prete_nom || null,
            data.logo_url || null,
            id
        ]);

        return result.rows[0];
    }

    static async delete(id) {
        const result = await pool.query('DELETE FROM Client WHERE id_client = $1', [id]);
        return result.rowCount;
    }

    // Récupérer les crédits d'un client
    static async getCredits(id) {
        const result = await pool.query(`
      SELECT * FROM Vue_CreditsClients WHERE id_client = $1
    `, [id]);
        return result.rows[0];
    }

    // Récupérer tous les types de clients distincts
    static async getTypes() {
        const result = await pool.query(`
      SELECT DISTINCT typec AS "TypeC" 
      FROM Client 
      WHERE typec IS NOT NULL
      ORDER BY typec
    `);
        return result.rows;
    }

    // Récupérer tous les statuts disponibles
    static async getStatuts() {
        return [
            { statut: 'OK' },
            { statut: 'LITIGE' },
            { statut: 'INACTIF' }
        ];
    }

    // Filtrer les clients par statut
    static async getByStatut(statut) {
        const result = await pool.query(`
      SELECT ${CLIENT_FIELDS}
      FROM Client 
      WHERE statut = $1
      ORDER BY nom
    `, [statut]);
        return result.rows;
    }
}

module.exports = Client;