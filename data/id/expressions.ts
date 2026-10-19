import { VocabWord } from '../../types';

// Questions first, then statements: one id sequence. The French side says "tu" (app
// rule), so the questions use kamu, not Anda.
export const EXPRESSION: VocabWord[] = [
  // ─── Questions ──────────────────────────────────────────────────────────────
  { id: 'id-e001', french: 'Quoi ?',                    target: 'Apa?',                                category: 'expression', level: 'A1' },
  { id: 'id-e002', french: 'Qui ?',                     target: 'Siapa?',                              category: 'expression', level: 'A1' },
  { id: 'id-e003', french: 'Où ?',                      target: 'Di mana?',                            category: 'expression', level: 'A1' },
  { id: 'id-e004', french: 'Vers où ?',                 target: 'Ke mana?',                            category: 'expression', level: 'A1' },
  { id: 'id-e005', french: "D'où ?",                    target: 'Dari mana?',                          category: 'expression', level: 'A1' },
  { id: 'id-e006', french: 'Quand ?',                   target: 'Kapan?',                              category: 'expression', level: 'A1' },
  { id: 'id-e007', french: 'Pourquoi ?',                target: 'Kenapa?',                             category: 'expression', level: 'A1' },
  { id: 'id-e008', french: 'Comment ?',                 target: 'Bagaimana?',                          category: 'expression', level: 'A1' },
  { id: 'id-e009', french: 'Combien ?',                 target: 'Berapa?',                             category: 'expression', level: 'A1' },
  { id: 'id-e010', french: 'Lequel ?',                  target: 'Yang mana?',                          category: 'expression', level: 'A1' },
  { id: 'id-e011', french: 'Comment ça va ?',           target: 'Apa kabar?',                          category: 'expression', level: 'A1' },
  { id: 'id-e012', french: "Comment tu t'appelles ?",   target: 'Siapa nama kamu?',                    category: 'expression', level: 'A1' },
  { id: 'id-e013', french: "D'où viens-tu ?",           target: 'Dari mana asal kamu?',                category: 'expression', level: 'A1' },
  { id: 'id-e014', french: 'Où habites-tu ?',           target: 'Kamu tinggal di mana?',               category: 'expression', level: 'A1' },
  { id: 'id-e015', french: 'Quel âge as-tu ?',          target: 'Berapa umur kamu?',                   category: 'expression', level: 'A1' },
  { id: 'id-e016', french: 'Combien ça coûte ?',        target: 'Berapa harganya?',                    category: 'expression', level: 'A1' },
  { id: 'id-e017', french: 'Parles-tu anglais ?',       target: 'Kamu bisa berbicara bahasa Inggris?', category: 'expression', level: 'A1' },
  { id: 'id-e018', french: 'Où sont les toilettes ?',   target: 'Di mana toilet?',                     category: 'expression', level: 'A1' },

  // ─── Statements ─────────────────────────────────────────────────────────────
  { id: 'id-e019', french: "Je m'appelle…",                  target: 'Nama saya…',                                    category: 'expression', level: 'A1' },
  { id: 'id-e020', french: 'Je viens de France',             target: 'Saya dari Prancis',                             category: 'expression', level: 'A1' },
  { id: 'id-e021', french: "J'habite à…",                    target: 'Saya tinggal di…',                              category: 'expression', level: 'A1' },
  { id: 'id-e022', french: 'Je suis français(e)',            target: 'Saya orang Prancis',                            category: 'expression', level: 'A1' },
  { id: 'id-e023', french: "J'ai … ans",                     target: 'Umur saya … tahun',                             category: 'expression', level: 'A1' },
  { id: 'id-e024', french: 'Je travaille comme…',            target: 'Saya bekerja sebagai…',                         category: 'expression', level: 'A1' },
  { id: 'id-e025', french: 'Je ne comprends pas',            target: 'Saya tidak mengerti',                           category: 'expression', level: 'A1' },
  { id: 'id-e026', french: "J'apprends l'indonésien",        target: 'Saya belajar bahasa Indonesia',                 category: 'expression', level: 'A1' },
  { id: 'id-e027', french: 'Je parle un petit peu indonésien', target: 'Saya bisa berbicara sedikit bahasa Indonesia', category: 'expression', level: 'A1' },
  { id: 'id-e028', french: 'Je ne parle pas indonésien',     target: 'Saya tidak bisa berbicara bahasa Indonesia',    category: 'expression', level: 'A1' },
  { id: 'id-e029', french: 'Ça va bien',                     target: 'Kabar baik',                                    category: 'expression', level: 'A1' },
  { id: 'id-e030', french: 'Oui',                            target: 'Ya',                                            category: 'expression', level: 'A1' },
  { id: 'id-e031', french: 'Non',                            target: 'Tidak',                                         category: 'expression', level: 'A1' },
  { id: 'id-e032', french: 'Merci',                          target: 'Terima kasih',                                  category: 'expression', level: 'A1' },
  { id: 'id-e033', french: 'De rien',                        target: 'Sama-sama',                                     category: 'expression', level: 'A1' },
  { id: 'id-e034', french: 'Pardon',                         target: 'Maaf',                                          category: 'expression', level: 'A1' },
  { id: 'id-e035', french: 'Excuse-moi',                     target: 'Permisi',                                       category: 'expression', level: 'A1' },
  { id: 'id-e036', french: "S'il te plaît (pour demander)",  target: 'Tolong',                                        category: 'expression', level: 'A1' },
  { id: 'id-e037', french: 'Bonjour (le matin)',             target: 'Selamat pagi',                                  category: 'expression', level: 'A1' },
  { id: 'id-e038', french: 'Bonjour (la journée)',           target: 'Selamat siang',                                 category: 'expression', level: 'A1' },
  { id: 'id-e039', french: 'Bonsoir',                        target: 'Selamat malam',                                 category: 'expression', level: 'A1' },
  { id: 'id-e040', french: 'Au revoir',                      target: 'Sampai jumpa',                                  category: 'expression', level: 'A1' },
  { id: 'id-e041', french: 'Enchanté(e)',                    target: 'Senang bertemu denganmu',                       category: 'expression', level: 'A1' },

  // ─── Time of day ────────────────────────────────────────────────────────────
  // setengah empat = "half towards four" = 3:30, not 4:30.
  { id: 'id-e042', french: 'Quelle heure est-il ?',          target: 'Jam berapa sekarang?',                          category: 'expression', level: 'A1' },
  { id: 'id-e043', french: 'Trois heures',                   target: 'Jam tiga',                                      category: 'expression', level: 'A1' },
  { id: 'id-e044', french: 'Trois heures et demie',          target: 'Jam setengah empat',                            category: 'expression', level: 'A1' },
  { id: 'id-e045', french: 'Trois heures et quart',          target: 'Jam tiga lewat seperempat',                     category: 'expression', level: 'A1' },
  { id: 'id-e046', french: 'Quatre heures moins le quart',   target: 'Jam empat kurang seperempat',                   category: 'expression', level: 'A1' },
  { id: 'id-e047', french: 'Combien de temps ?',             target: 'Berapa lama?',                                  category: 'expression', level: 'A1' },
  { id: 'id-e048', french: 'Un instant',                     target: 'Sebentar',                                      category: 'expression', level: 'A1' },

  // ─── At the warung ──────────────────────────────────────────────────────────
  { id: 'id-e049', french: 'Je voudrais commander…',         target: 'Saya mau pesan…',                               category: 'expression', level: 'A1' },
  { id: 'id-e050', french: "La carte, s'il te plaît",        target: 'Minta menu',                                    category: 'expression', level: 'A1' },
  { id: 'id-e051', french: "L'addition, s'il te plaît",      target: 'Minta bon',                                     category: 'expression', level: 'A1' },
  { id: 'id-e052', french: 'Pas épicé',                      target: 'Tidak pedas',                                   category: 'expression', level: 'A1' },
  { id: 'id-e053', french: 'Un peu épicé',                   target: 'Pedas sedikit',                                 category: 'expression', level: 'A1' },
  { id: 'id-e054', french: "C'est délicieux !",              target: 'Enak sekali!',                                  category: 'expression', level: 'A1' },
  { id: 'id-e055', french: 'Bon appétit',                    target: 'Selamat makan',                                 category: 'expression', level: 'A1' },
  { id: 'id-e056', french: 'Sans sucre',                     target: 'Tanpa gula',                                    category: 'expression', level: 'A1' },
  { id: 'id-e057', french: 'À emporter',                     target: 'Bungkus',                                       category: 'expression', level: 'A1' },
];

export default EXPRESSION;
