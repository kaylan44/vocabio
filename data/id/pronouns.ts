import { VocabWord } from '../../types';

// The French translations are unique within the category: two entries with the same
// French text would give two correct answers in the quiz.
export const PRONOUN: VocabWord[] = [
  { id: 'id-p001', french: 'je (poli)',         target: 'saya',   category: 'pronoun', level: 'A1' },
  { id: 'id-p002', french: 'je (familier)',     target: 'aku',    category: 'pronoun', level: 'A1' },
  { id: 'id-p003', french: 'tu',                target: 'kamu',   category: 'pronoun', level: 'A1' },
  { id: 'id-p004', french: 'vous (poli)',       target: 'Anda',   category: 'pronoun', level: 'A1' },
  { id: 'id-p005', french: 'il / elle',         target: 'dia',    category: 'pronoun', level: 'A1' },
  { id: 'id-p006', french: 'nous (sans toi)',   target: 'kami',   category: 'pronoun', level: 'A1' },
  { id: 'id-p007', french: 'nous (avec toi)',   target: 'kita',   category: 'pronoun', level: 'A1' },
  { id: 'id-p008', french: 'vous (pluriel)',    target: 'kalian', category: 'pronoun', level: 'A1' },
  { id: 'id-p009', french: 'ils / elles',       target: 'mereka', category: 'pronoun', level: 'A1' },
];

export default PRONOUN;
