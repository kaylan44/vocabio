import { VocabWord } from '../../types';

// "père" is ayah, so bapak is "monsieur"; "femme" is split between perempuan (courant)
// and wanita (soutenu), and istri is "épouse": one French text per entry.
export const NOUN: VocabWord[] = [
  { id: 'id-n001', french: 'maison',                 target: 'rumah',           category: 'noun', level: 'A1' },
  { id: 'id-n002', french: 'eau',                    target: 'air',             category: 'noun', level: 'A1' },
  { id: 'id-n003', french: 'nourriture',             target: 'makanan',         category: 'noun', level: 'A1' },
  { id: 'id-n004', french: 'riz',                    target: 'nasi',            category: 'noun', level: 'A1' },
  { id: 'id-n005', french: 'café',                   target: 'kopi',            category: 'noun', level: 'A1' },
  { id: 'id-n006', french: 'thé',                    target: 'teh',             category: 'noun', level: 'A1' },
  { id: 'id-n007', french: 'ami',                    target: 'teman',           category: 'noun', level: 'A1' },
  { id: 'id-n008', french: 'famille',                target: 'keluarga',        category: 'noun', level: 'A1' },
  { id: 'id-n009', french: 'personne',               target: 'orang',           category: 'noun', level: 'A1' },
  { id: 'id-n010', french: 'homme',                  target: 'laki-laki',       category: 'noun', level: 'A1' },
  { id: 'id-n011', french: 'femme (courant)',        target: 'perempuan',       category: 'noun', level: 'A1' },
  { id: 'id-n012', french: 'femme (soutenu)',        target: 'wanita',          category: 'noun', level: 'A1' },
  { id: 'id-n013', french: 'enfant',                 target: 'anak',            category: 'noun', level: 'A1' },
  { id: 'id-n014', french: 'monsieur',               target: 'bapak',           category: 'noun', level: 'A1' },
  { id: 'id-n015', french: 'ville',                  target: 'kota',            category: 'noun', level: 'A1' },
  { id: 'id-n016', french: 'pays',                   target: 'negara',          category: 'noun', level: 'A1' },
  { id: 'id-n017', french: 'rue',                    target: 'jalan',           category: 'noun', level: 'A1' },
  { id: 'id-n018', french: 'magasin',                target: 'toko',            category: 'noun', level: 'A1' },
  { id: 'id-n019', french: 'marché',                 target: 'pasar',           category: 'noun', level: 'A1' },
  { id: 'id-n020', french: 'argent',                 target: 'uang',            category: 'noun', level: 'A1' },
  { id: 'id-n021', french: 'jour',                   target: 'hari',            category: 'noun', level: 'A1' },
  { id: 'id-n022', french: 'nuit',                   target: 'malam',           category: 'noun', level: 'A1' },
  { id: 'id-n023', french: 'matin',                  target: 'pagi',            category: 'noun', level: 'A1' },
  { id: 'id-n024', french: 'semaine',                target: 'minggu',          category: 'noun', level: 'A1' },
  { id: 'id-n025', french: 'année',                  target: 'tahun',           category: 'noun', level: 'A1' },
  { id: 'id-n026', french: 'nom',                    target: 'nama',            category: 'noun', level: 'A1' },
  { id: 'id-n027', french: 'travail',                target: 'pekerjaan',       category: 'noun', level: 'A1' },
  { id: 'id-n028', french: 'école',                  target: 'sekolah',         category: 'noun', level: 'A1' },
  { id: 'id-n029', french: 'voiture',                target: 'mobil',           category: 'noun', level: 'A1' },
  { id: 'id-n030', french: 'moto',                   target: 'motor',           category: 'noun', level: 'A1' },

  // ─── Family ─────────────────────────────────────────────────────────────────
  { id: 'id-n031', french: 'père',                   target: 'ayah',            category: 'noun', level: 'A1' },
  { id: 'id-n032', french: 'mère',                   target: 'ibu',             category: 'noun', level: 'A1' },
  { id: 'id-n033', french: 'parents',                target: 'orang tua',       category: 'noun', level: 'A1' },
  { id: 'id-n034', french: 'mari',                   target: 'suami',           category: 'noun', level: 'A1' },
  { id: 'id-n035', french: 'épouse',                 target: 'istri',           category: 'noun', level: 'A1' },
  { id: 'id-n036', french: 'fils',                   target: 'anak laki-laki',  category: 'noun', level: 'A1' },
  { id: 'id-n037', french: 'fille',                  target: 'anak perempuan',  category: 'noun', level: 'A1' },
  { id: 'id-n038', french: 'frère / sœur aîné(e)',   target: 'kakak',           category: 'noun', level: 'A1' },
  { id: 'id-n039', french: 'frère / sœur cadet(te)', target: 'adik',            category: 'noun', level: 'A1' },
  { id: 'id-n040', french: 'grand-père',             target: 'kakek',           category: 'noun', level: 'A1' },
  { id: 'id-n041', french: 'grand-mère',             target: 'nenek',           category: 'noun', level: 'A1' },
  { id: 'id-n042', french: 'petit-enfant',           target: 'cucu',            category: 'noun', level: 'A1' },
  { id: 'id-n043', french: 'oncle',                  target: 'paman',           category: 'noun', level: 'A1' },
  { id: 'id-n044', french: 'tante',                  target: 'bibi',            category: 'noun', level: 'A1' },
  { id: 'id-n045', french: 'cousin(e)',              target: 'sepupu',          category: 'noun', level: 'A1' },
  { id: 'id-n046', french: 'neveu / nièce',          target: 'keponakan',       category: 'noun', level: 'A1' },

  // ─── Durations ──────────────────────────────────────────────────────────────
  // jour, semaine and année are above (hari, minggu, tahun).
  { id: 'id-n047', french: 'seconde',                target: 'detik',           category: 'noun', level: 'A1' },
  { id: 'id-n048', french: 'minute',                 target: 'menit',           category: 'noun', level: 'A1' },
  { id: 'id-n049', french: 'heure',                  target: 'jam',             category: 'noun', level: 'A1' },
  { id: 'id-n050', french: 'mois',                   target: 'bulan',           category: 'noun', level: 'A1' },

  // ─── At the warung ──────────────────────────────────────────────────────────
  { id: 'id-n051', french: 'petit restaurant (warung)', target: 'warung',       category: 'noun', level: 'A1' },
  { id: 'id-n052', french: 'poulet',                 target: 'ayam',            category: 'noun', level: 'A1' },
  { id: 'id-n053', french: 'poisson',                target: 'ikan',            category: 'noun', level: 'A1' },
  { id: 'id-n054', french: 'légumes',                target: 'sayur',           category: 'noun', level: 'A1' },
  { id: 'id-n055', french: 'œuf',                    target: 'telur',           category: 'noun', level: 'A1' },
  { id: 'id-n056', french: 'nouilles',               target: 'mie',             category: 'noun', level: 'A1' },
  { id: 'id-n057', french: 'sucre',                  target: 'gula',            category: 'noun', level: 'A1' },
  { id: 'id-n058', french: 'sel',                    target: 'garam',           category: 'noun', level: 'A1' },
  { id: 'id-n059', french: 'glaçons',                target: 'es',              category: 'noun', level: 'A1' },
  { id: 'id-n060', french: 'fruit',                  target: 'buah',            category: 'noun', level: 'A1' },
];

export default NOUN;
