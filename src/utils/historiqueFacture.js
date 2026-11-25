// src/utils/historiqueFacture.js
// Historique des modifications de factures / bons (PostgreSQL)
// Toutes les fonctions acceptent `db` = pool OU client de transaction (null => pool)
const pool = require('../database/connection');

const TYPE_LABELS = {
  FACTURE: 'Facture',
  BON_LIVRAISON: 'Bon de livraison',
  BON_COMMANDE: 'Bon de commande',
  BON_RESTITUTION: 'Bon de restitution',
  AVOIR: 'Avoir',
  PROFORMA: 'Proforma',
};

// Champs suivis sur Facture
const FACTURE_LABELS = {
  id_client: 'Client',
  date_facture: 'Date',
  date_echeance: "Date d'échéance",
  statut: 'Statut',
  remise_globale: 'Remise globale',
  conditions_paiement: 'Conditions de paiement',
  notes: 'Notes',
  ref_bl: 'Réf. BL',
};

// Champs suivis sur LigneFacture
const LIGNE_LABELS = {
  id_produit: 'Produit',
  quantite: 'Quantité',
  unite_vente: 'Unité',
  prix_unitaire_ht: 'Prix unitaire HT',
  prix_ttc: 'Prix TTC',
  taux_tva: 'TVA (%)',
  remise_ligne: 'Remise ligne (%)',
  description: 'Description',
};

const NUMERIC = new Set(['remise_globale', 'quantite', 'prix_unitaire_ht', 'prix_ttc', 'taux_tva', 'remise_ligne']);
const DATE_FIELDS = new Set(['date_facture', 'date_echeance']);

const pad = (n) => String(n).padStart(2, '0');
// Un bon de restitution = BON_LIVRAISON dont le numéro commence par « R »
const typeLabel = (t, numero) =>
  t === 'BON_LIVRAISON' && String(numero || '').toUpperCase().startsWith('R')
    ? 'Bon de restitution'
    : TYPE_LABELS[t] || t || 'Document';
const num = (v) => (v === null || v === undefined ? '—' : String(Number(v)));

// Normalise une valeur pour la comparaison (évite les faux positifs: "5.00" vs 5, '' vs null, Date vs string)
function norm(champ, v) {
  if (v === null || v === undefined) return null;
  if (v instanceof Date) return `${v.getFullYear()}-${pad(v.getMonth() + 1)}-${pad(v.getDate())}`;
  if (typeof v === 'string') {
    v = v.trim();
    if (v === '') return null;
  }
  if (NUMERIC.has(champ)) {
    const n = Number(v);
    if (!Number.isNaN(n)) return String(n);
  }
  return String(v);
}

// Valeur lisible pour la description
function affiche(champ, v) {
  if (v === null) return '—';
  let s = v;
  if (DATE_FIELDS.has(champ) && /^\d{4}-\d{2}-\d{2}/.test(s)) {
    const [y, m, d] = s.slice(0, 10).split('-');
    s = `${d}/${m}/${y}`;
  }
  return s.length > 100 ? s.slice(0, 100) + '…' : s;
}

function diff(avant, apres, champs) {
  const out = [];
  for (const champ of champs) {
    if (!(champ in avant) || !(champ in apres)) continue;
    const a = norm(champ, avant[champ]);
    const b = norm(champ, apres[champ]);
    if (a !== b) out.push({ champ, ancienne: a, nouvelle: b });
  }
  return out;
}

async function insert(db, f, { action, champ = null, ancienne = null, nouvelle = null, description, auteur = null }) {
  await (db || pool).query(`
    INSERT INTO HistoriqueFacture
      (id_facture, numero_facture, type_facture, action, champ, ancienne_valeur, nouvelle_valeur, description, auteur)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
  `, [f.id_facture, f.numero_facture, f.type_facture, action, champ, ancienne, nouvelle, description, auteur]);
}

async function getFactureInfo(db, id_facture) {
  const r = await (db || pool).query(
    'SELECT id_facture, numero_facture, type_facture FROM Facture WHERE id_facture = $1', [id_facture]);
  return r.rows[0];
}

async function nomsClients(db, ids) {
  const clean = ids.filter(Boolean).map(Number);
  if (!clean.length) return {};
  const r = await (db || pool).query('SELECT id_client, nom FROM Client WHERE id_client = ANY($1)', [clean]);
  const map = {};
  r.rows.forEach((c) => { map[String(c.id_client)] = c.nom; });
  return map;
}

async function produitNom(db, id_produit) {
  if (!id_produit) return '—';
  const r = await (db || pool).query('SELECT nom FROM Produit WHERE id_produit = $1', [id_produit]);
  return r.rows[0]?.nom || `Produit #${id_produit}`;
}

// ============================================================
// DOCUMENT
// ============================================================

// facture = ligne de la table Facture (id_facture, numero_facture, type_facture)
async function logCreation(db, facture, auteur, detail = '') {
  await insert(db, facture, {
    action: 'CREATION',
    description: `Création : ${typeLabel(facture.type_facture, facture.numero_facture)} N° ${facture.numero_facture}${detail ? ` (${detail})` : ''}`,
    auteur,
  });
}

async function logSuppression(db, facture, auteur) {
  await insert(db, facture, {
    action: 'SUPPRESSION',
    description: `Suppression : ${typeLabel(facture.type_facture, facture.numero_facture)} N° ${facture.numero_facture}`,
    auteur,
  });
}

async function logStatut(db, facture, ancien, nouveau, auteur) {
  await insert(db, facture, {
    action: 'STATUT',
    champ: 'statut',
    ancienne: ancien,
    nouvelle: nouveau,
    description: `Statut : « ${ancien ?? '—'} » → « ${nouveau ?? '—'} »`,
    auteur,
  });
}

// avant / apres = lignes brutes de la table Facture
async function logModification(db, { avant, apres, auteur }) {
  const changes = diff(avant, apres, Object.keys(FACTURE_LABELS));
  if (!changes.length) return;

  const clientChange = changes.find((c) => c.champ === 'id_client');
  if (clientChange) {
    const noms = await nomsClients(db, [clientChange.ancienne, clientChange.nouvelle]);
    clientChange.ancienne = noms[clientChange.ancienne] ?? clientChange.ancienne;
    clientChange.nouvelle = noms[clientChange.nouvelle] ?? clientChange.nouvelle;
  }

  for (const c of changes) {
    await insert(db, avant, {
      action: c.champ === 'statut' ? 'STATUT' : 'MODIFICATION',
      champ: c.champ,
      ancienne: c.ancienne,
      nouvelle: c.nouvelle,
      description: `${FACTURE_LABELS[c.champ]} : « ${affiche(c.champ, c.ancienne)} » → « ${affiche(c.champ, c.nouvelle)} »`,
      auteur,
    });
  }
}

// ============================================================
// LIGNES
// ============================================================

async function logLigneAjoutee(db, id_facture, ligne, auteur) {
  const f = await getFactureInfo(db, id_facture);
  if (!f) return;
  const nom = await produitNom(db, ligne.id_produit);
  await insert(db, f, {
    action: 'LIGNE_AJOUTEE',
    description: `Ligne « ${nom} » ajoutée (qté ${num(ligne.quantite)}, prix TTC ${num(ligne.prix_ttc)})`,
    auteur,
  });
}

async function logLigneSupprimee(db, id_facture, ligne, auteur) {
  const f = await getFactureInfo(db, id_facture);
  if (!f) return;
  const nom = await produitNom(db, ligne.id_produit);
  await insert(db, f, {
    action: 'LIGNE_SUPPRIMEE',
    description: `Ligne « ${nom} » supprimée (qté ${num(ligne.quantite)}, prix TTC ${num(ligne.prix_ttc)})`,
    auteur,
  });
}

// avant / apres = lignes brutes de la table LigneFacture
async function logLigneModifiee(db, id_facture, avant, apres, auteur) {
  const changes = diff(avant, apres, Object.keys(LIGNE_LABELS));
  if (!changes.length) return;
  const f = await getFactureInfo(db, id_facture);
  if (!f) return;

  const nomAvant = await produitNom(db, avant.id_produit);

  for (const c of changes) {
    if (c.champ === 'id_produit') {
      c.ancienne = await produitNom(db, avant.id_produit);
      c.nouvelle = await produitNom(db, apres.id_produit);
    }
    await insert(db, f, {
      action: 'LIGNE_MODIFIEE',
      champ: c.champ,
      ancienne: c.ancienne,
      nouvelle: c.nouvelle,
      description: `Ligne « ${nomAvant} » – ${LIGNE_LABELS[c.champ]} : ${affiche(c.champ, c.ancienne)} → ${affiche(c.champ, c.nouvelle)}`,
      auteur,
    });
  }
}

// ============================================================
// LECTURE
// ============================================================

async function getByFacture(id_facture) {
  const r = await pool.query(`
    SELECT id_historique, id_facture, numero_facture, type_facture, action,
           champ, ancienne_valeur, nouvelle_valeur, description, auteur, date_modification
    FROM HistoriqueFacture
    WHERE id_facture = $1
    ORDER BY date_modification DESC, id_historique DESC
  `, [id_facture]);
  return r.rows;
}

// Historique global (tous documents) avec filtres + pagination
// type : FACTURE | BON_LIVRAISON | BON_RESTITUTION | BON_COMMANDE | AVOIR | PROFORMA
async function getAll({ q, type, action, date_debut, date_fin, limit = 50, offset = 0 } = {}) {
  const where = [];
  const params = [];
  const add = (v) => { params.push(v); return `$${params.length}`; };

  if (q) {
    const p = add(`%${q.replace(/[\\%_]/g, '\\$&')}%`);
    where.push(`(numero_facture ILIKE ${p} OR description ILIKE ${p} OR auteur ILIKE ${p})`);
  }
  if (type === 'BON_RESTITUTION') {
    where.push(`(type_facture = 'BON_LIVRAISON' AND numero_facture ILIKE 'R%')`);
  } else if (type === 'BON_LIVRAISON') {
    where.push(`(type_facture = 'BON_LIVRAISON' AND COALESCE(numero_facture, '') NOT ILIKE 'R%')`);
  } else if (type) {
    where.push(`type_facture = ${add(type)}`);
  }
  if (action) where.push(`action = ${add(action)}`);
  if (date_debut) where.push(`date_modification >= ${add(date_debut)}::date`);
  if (date_fin) where.push(`date_modification < (${add(date_fin)}::date + 1)`);

  const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const totalResult = await pool.query(`SELECT COUNT(*)::int AS total FROM HistoriqueFacture ${clause}`, params);

  const rowsResult = await pool.query(`
    SELECT id_historique, id_facture, numero_facture, type_facture, action,
           champ, ancienne_valeur, nouvelle_valeur, description, auteur, date_modification
    FROM HistoriqueFacture
    ${clause}
    ORDER BY date_modification DESC, id_historique DESC
    LIMIT ${add(limit)} OFFSET ${add(offset)}
  `, params);

  return { rows: rowsResult.rows, total: totalResult.rows[0].total };
}

module.exports = {
  diff,
  logCreation,
  logSuppression,
  logStatut,
  logModification,
  logLigneAjoutee,
  logLigneModifiee,
  logLigneSupprimee,
  getByFacture,
  getAll,
};
