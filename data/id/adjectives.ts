import { VocabWord } from '../../types';

// Adjectives mostly come in pairs of opposites (oppositeId). ganteng and bagus point to
// jelek, which points back to cantik only; the food adjectives have no opposite.
// tinggi / rendah is left out: "pendek" would then be both "court" and "petit".
export const ADJECTIVE: VocabWord[] = [
  { id: 'id-a001', french: 'grand',             target: 'besar',   category: 'adjective', level: 'A1', oppositeId: 'id-a002' },
  { id: 'id-a002', french: 'petit',             target: 'kecil',   category: 'adjective', level: 'A1', oppositeId: 'id-a001' },
  { id: 'id-a003', french: 'long',              target: 'panjang', category: 'adjective', level: 'A1', oppositeId: 'id-a004' },
  { id: 'id-a004', french: 'court',             target: 'pendek',  category: 'adjective', level: 'A1', oppositeId: 'id-a003' },
  { id: 'id-a005', french: 'nouveau',           target: 'baru',    category: 'adjective', level: 'A1', oppositeId: 'id-a006' },
  { id: 'id-a006', french: 'ancien',            target: 'lama',    category: 'adjective', level: 'A1', oppositeId: 'id-a005' },
  { id: 'id-a007', french: 'bon',               target: 'baik',    category: 'adjective', level: 'A1', oppositeId: 'id-a008' },
  { id: 'id-a008', french: 'mauvais',           target: 'buruk',   category: 'adjective', level: 'A1', oppositeId: 'id-a007' },
  { id: 'id-a009', french: 'chaud',             target: 'panas',   category: 'adjective', level: 'A1', oppositeId: 'id-a010' },
  { id: 'id-a010', french: 'froid',             target: 'dingin',  category: 'adjective', level: 'A1', oppositeId: 'id-a009' },
  { id: 'id-a011', french: 'cher',              target: 'mahal',   category: 'adjective', level: 'A1', oppositeId: 'id-a012' },
  { id: 'id-a012', french: 'bon marché',        target: 'murah',   category: 'adjective', level: 'A1', oppositeId: 'id-a011' },
  { id: 'id-a013', french: 'rapide',            target: 'cepat',   category: 'adjective', level: 'A1', oppositeId: 'id-a014' },
  { id: 'id-a014', french: 'lent',              target: 'lambat',  category: 'adjective', level: 'A1', oppositeId: 'id-a013' },
  { id: 'id-a015', french: 'content',           target: 'senang',  category: 'adjective', level: 'A1', oppositeId: 'id-a016' },
  { id: 'id-a016', french: 'triste',            target: 'sedih',   category: 'adjective', level: 'A1', oppositeId: 'id-a015' },
  { id: 'id-a017', french: 'facile',            target: 'mudah',   category: 'adjective', level: 'A1', oppositeId: 'id-a018' },
  { id: 'id-a018', french: 'difficile',         target: 'sulit',   category: 'adjective', level: 'A1', oppositeId: 'id-a017' },
  { id: 'id-a019', french: 'propre',            target: 'bersih',  category: 'adjective', level: 'A1', oppositeId: 'id-a020' },
  { id: 'id-a020', french: 'sale',              target: 'kotor',   category: 'adjective', level: 'A1', oppositeId: 'id-a019' },
  { id: 'id-a021', french: 'jeune',             target: 'muda',    category: 'adjective', level: 'A1', oppositeId: 'id-a022' },
  { id: 'id-a022', french: 'vieux',             target: 'tua',     category: 'adjective', level: 'A1', oppositeId: 'id-a021' },
  { id: 'id-a023', french: 'beau (femme)',      target: 'cantik',  category: 'adjective', level: 'A1', oppositeId: 'id-a024' },
  { id: 'id-a024', french: 'laid',              target: 'jelek',   category: 'adjective', level: 'A1', oppositeId: 'id-a023' },
  { id: 'id-a025', french: 'beau (homme)',      target: 'ganteng', category: 'adjective', level: 'A1', oppositeId: 'id-a024' },
  { id: 'id-a026', french: 'bien (de qualité)', target: 'bagus',   category: 'adjective', level: 'A1', oppositeId: 'id-a024' },
  { id: 'id-a027', french: 'loin',              target: 'jauh',    category: 'adjective', level: 'A1', oppositeId: 'id-a028' },
  { id: 'id-a028', french: 'proche',            target: 'dekat',   category: 'adjective', level: 'A1', oppositeId: 'id-a027' },
  { id: 'id-a029', french: 'lourd',             target: 'berat',   category: 'adjective', level: 'A1', oppositeId: 'id-a030' },
  { id: 'id-a030', french: 'léger',             target: 'ringan',  category: 'adjective', level: 'A1', oppositeId: 'id-a029' },

  // ─── Food, no opposite ──────────────────────────────────────────────────────
  { id: 'id-a031', french: 'épicé',             target: 'pedas',   category: 'adjective', level: 'A1' },
  { id: 'id-a032', french: 'délicieux',         target: 'enak',    category: 'adjective', level: 'A1' },
  { id: 'id-a033', french: 'sucré',             target: 'manis',   category: 'adjective', level: 'A1' },
];

export default ADJECTIVE;
