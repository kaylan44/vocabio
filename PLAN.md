# Plan — Indonesian in Vocabio

Status: **planned**, not started. Backend side: `vocabio-backend/PLAN.md`, step 9.

Goal: a second language to learn, Indonesian, next to Spanish. The user picks the
language on a dedicated screen after signing in (or choosing guest mode), then lands
on the home screen of that language. Indonesian starts with the essentials only:
basic vocabulary, basic questions, basic statements (my name is, I come from, I live
in…), numbers, basic adjectives with their opposites, simple pronouns, basic verbs.
The Indonesian side has no articles.

## Decisions

| Topic | Choice | Why / rejected alternatives |
|---|---|---|
| Word type | Rename `VocabWord.spanish` → `target` | One type and one quiz engine for every language. Rejected: an `indonesian?` field next to `spanish` (both optional, an `if` on the language everywhere), one type per language (union types and a `getTarget()` everywhere), `translations: { es, id }` on a shared French entry (the two word lists are different) |
| Language of a word | Given by its folder (`data/es/`, `data/id/`) and its id prefix, **no `language` field** | A third copy of the same information could contradict the other two. No code needs to guess the language of an isolated word: screens receive the vocabulary of the current language |
| Word ids | Prefixed: `es-n001`, `id-n001` | Unique across languages. The Spanish ids are renamed together with a backend data migration; the app is not deployed, so no old install can send `n001` |
| Categories | New `number` category (ids `c###`); questions and statements are `expression` | Numbers in `noun` would skew the statistics by category. `number` is added to the backend first |
| Current language | Carried by the URL (`/es/...`, `/id/...`), **not remembered** | The language screen is shown at each app start; a "change language" button on the home screen leads back to it. No device storage (see CLAUDE.md) |
| Articles | Spanish only, through a `hasArticles` flag in the language config | There is no Indonesian source |
| Messaging | Shared by both languages, generic texts | Replaces "écris-lui en espagnol" |
| Statistics | `GET /quiz-sessions/stats?lang=` for the current language | The backend derives the language from the mode. The word progress is still loaded once at sign-in, all languages together |

## Pull requests, in order

0. **Backend `feat/indonesian-modes`**, merged and deployed first (new modes, `number`,
   `lang` filter, migration of the Spanish ids). Otherwise an Indonesian quiz result is
   refused with 400 and lost.
1. **`chore/vocab-target-field`**: no change of behaviour.
2. **`feat/indonesian`**: the feature itself.

### PR 1 — `chore/vocab-target-field`

- `types/index.ts`: `spanish` → `target`.
- `data/*.ts` moved to `data/es/`, ids prefixed (`n001` → `es-n001`), mechanical
  replacement. `data/vocabulary.ts` exposes `getVocabulary(lang)`; the Spanish list is
  the only one for now.
- Usages: `quizEngine.ts`, `TileGrid.tsx`, `vocab.tsx`, `StatsCard.tsx`.
- New test: every id of `data/es/` starts with `es-`, no id appears twice.
- Existing tests to adapt (`quizEngine.test.ts`, `StatsCard.test.tsx`, and those using
  `n001`): **the old and new assertions are shown to the developer before editing**.
- Rule "do not change the word ID format" in `CLAUDE.md`, and the "Vocabulary dataset"
  table of `AGENTS.md`, updated to the prefixed format.

### PR 2 — `feat/indonesian`

Order of the changes, as recommended in CLAUDE.md:

1. **Types** (`types/index.ts`): `Language = 'es' | 'id'`; `QuizMode` gets
   `'fr-id' | 'id-fr'`; `GrammarCategory` gets `'number'`; optional `oppositeId` on
   `VocabWord` (adjective pairs).
2. **Language config** (`constants/languages.ts`, behaviour constants, not theme):
   ```ts
   es: { label: 'Espagnol',   flag: 'es', modes: ['fr-es', 'es-fr'], hasArticles: true  }
   id: { label: 'Indonésien', flag: 'id', modes: ['fr-id', 'id-fr'], hasArticles: false }
   ```
   Home, `ModeCard`, `vocab.tsx`, `WordCard`, `result.tsx` and `StatsCard` read this
   config instead of testing `'fr-es'` in the code.
3. **Data** (`data/id/`): `nouns.ts`, `verbs.ts`, `adjectives.ts`, `pronouns.ts`,
   `numbers.ts`, `questions.ts`, `phrases.ts`, dataset below. Ids `id-n###`, `id-v###`,
   `id-a###`, `id-p###`, `id-c###`, `id-e###` (questions then statements, one sequence).
4. **Logic**
   - `features/quiz/quizEngine.ts`: the session and its distractors are drawn from the
     vocabulary of the mode's language only (today: from all of `VOCABULARY`).
   - `store/progressStore.ts`: the fixed `frEs` / `esF` keys become one entry per mode;
     "mastered" means mastered in the two modes of the word's language. Breaks
     assertions of `progressStore.test.ts`: **shown to the developer before editing**.
   - `hooks/useQuizStats.ts` and `services/api.ts`: `getStats(lang)`.
   - `hooks/useQuizSession.ts` keeps its name and place.
5. **Components**: `Flag` gets `id` (`assets/flags/id.png`, flagcdn, like the others);
   `TileGrid` looks the word up in the current language (today: by its Spanish text).
6. **Screens** (Expo Router):
   ```
   app/
     login.tsx            after sign-in or guest mode → /language
     language.tsx         NEW: two large cards, Espagnol / Indonésien
     index.tsx            redirects to /language
     [lang]/_layout.tsx   NEW: lang must be 'es' or 'id', otherwise → /language
     [lang]/index.tsx     home of the language: its mode cards, vocabulary row,
                          articles row only if hasArticles, "Changer de langue"
     [lang]/quiz.tsx      moved from app/
     [lang]/result.tsx    moved from app/
     [lang]/vocab.tsx     moved from app/, only the words of the language
     articles/            unchanged; reached from the Spanish home only
     messages/            shared, generic texts
     account.tsx          statistics of the current language
   ```
   The current language is the `lang` segment; a small zustand store mirrors it for the
   shared screens (account, messages) and the back navigation to the right home.
7. **Texts**: generic taglines on login and home ("Apprends l'espagnol…"), generic
   empty state in messaging.
8. **Tests**: language screen and redirections, `[lang]` guard, home without the
   articles row in Indonesian, quiz engine drawing in one language only, `fr-id` /
   `id-fr` payloads, `getStats(lang)`, ids of `data/id/` prefixed and unique, every
   `oppositeId` pointing to an existing adjective, French translations unique within a
   category (see the pitfall below).
9. **Docs**: `AGENTS.md` (tree, dataset table, rules, the "More languages" row) and
   `README.md` (features).

## Indonesian dataset (draft, all A1, 177 entries)

**Pitfall**: the quiz offers distractors from the same category. Two entries with the
same French text would give two correct answers, so every French translation is unique
within its category ("je (poli)" / "je (familier)"). For the same reason, tinggi/rendah
is left out: "pendek" would be both "court" and "petit"; "père" is `ayah`, so `bapak` is
"monsieur"; `perempuan` / `wanita` are "femme (courant)" / "femme (soutenu)", and `istri`
is "épouse".

The French side uses "tu" (app rule), so the questions use `kamu`, not `Anda`.
`ganteng` and `bagus` have `jelek` as their `oppositeId` (one-way: `jelek` points back to
`cantik`).

| Category | # | Entries (Indonesian — French) |
|---|---|---|
| pronoun | 9 | saya — je (poli) · aku — je (familier) · kamu — tu · Anda — vous (poli) · dia — il / elle · kami — nous (sans toi) · kita — nous (avec toi) · kalian — vous (pluriel) · mereka — ils / elles |
| number | 26 | nol — zéro · satu — un · dua — deux · tiga — trois · empat — quatre · lima — cinq · enam — six · tujuh — sept · delapan — huit · sembilan — neuf · sepuluh — dix · sebelas — onze · dua belas — douze · tiga belas — treize · empat belas — quatorze · lima belas — quinze · enam belas — seize · tujuh belas — dix-sept · delapan belas — dix-huit · sembilan belas — dix-neuf · dua puluh — vingt · lima puluh — cinquante · seratus — cent · seribu — mille · sejuta — un million · satu miliar — un milliard |
| verb | 25 | makan — manger · minum — boire · tidur — dormir · pergi — aller · datang — venir · pulang — rentrer · tinggal — habiter · bekerja — travailler · belajar — apprendre · berbicara — parler · membaca — lire · menulis — écrire · melihat — voir · mendengar — entendre · membeli — acheter · mau — vouloir · bisa — pouvoir · punya — avoir · tahu — savoir · mengerti — comprendre · suka — aimer · memberi — donner · mengambil — prendre · membuat — faire · ada — il y a |
| adjective (pairs) | 30 | besar / kecil — grand / petit · panjang / pendek — long / court · baru / lama — nouveau / ancien · baik / buruk — bon / mauvais · panas / dingin — chaud / froid · mahal / murah — cher / bon marché · cepat / lambat — rapide / lent · senang / sedih — content / triste · mudah / sulit — facile / difficile · bersih / kotor — propre / sale · muda / tua — jeune / vieux · cantik / jelek — beau (femme) / laid · ganteng — beau (homme) · bagus — bien (de qualité) · jauh / dekat — loin / proche · berat / ringan — lourd / léger |
| noun | 46 | rumah — maison · air — eau · makanan — nourriture · nasi — riz · kopi — café · teh — thé · teman — ami · keluarga — famille · orang — personne · laki-laki — homme · perempuan — femme (courant) · wanita — femme (soutenu) · anak — enfant · bapak — monsieur · kota — ville · negara — pays · jalan — rue · toko — magasin · pasar — marché · uang — argent · hari — jour · malam — nuit · pagi — matin · minggu — semaine · tahun — année · nama — nom · pekerjaan — travail · sekolah — école · mobil — voiture · motor — moto |
| noun (family) | — | ayah — père · ibu — mère · orang tua — parents · suami — mari · istri — épouse · anak laki-laki — fils · anak perempuan — fille · kakak — frère / sœur aîné(e) · adik — frère / sœur cadet(te) · kakek — grand-père · nenek — grand-mère · cucu — petit-enfant · paman — oncle · bibi — tante · sepupu — cousin(e) · keponakan — neveu / nièce (counted in the 46 nouns above) |
| expression (questions) | 18 | Apa? — Quoi ? · Siapa? — Qui ? · Di mana? — Où ? · Ke mana? — Vers où ? · Dari mana? — D'où ? · Kapan? — Quand ? · Kenapa? — Pourquoi ? · Bagaimana? — Comment ? · Berapa? — Combien ? · Yang mana? — Lequel ? · Apa kabar? — Comment ça va ? · Siapa nama kamu? — Comment tu t'appelles ? · Dari mana asal kamu? — D'où viens-tu ? · Kamu tinggal di mana? — Où habites-tu ? · Berapa umur kamu? — Quel âge as-tu ? · Berapa harganya? — Combien ça coûte ? · Kamu bisa berbicara bahasa Inggris? — Parles-tu anglais ? · Di mana toilet? — Où sont les toilettes ? |
| expression (statements) | 23 | Nama saya… — Je m'appelle… · Saya dari Prancis — Je viens de France · Saya tinggal di… — J'habite à… · Saya orang Prancis — Je suis français(e) · Umur saya … tahun — J'ai … ans · Saya bekerja sebagai… — Je travaille comme… · Saya tidak mengerti — Je ne comprends pas · Saya belajar bahasa Indonesia — J'apprends l'indonésien · Saya bisa berbicara sedikit bahasa Indonesia — Je parle un petit peu indonésien · Saya tidak bisa berbicara bahasa Indonesia — Je ne parle pas indonésien · Kabar baik — Ça va bien · Ya — Oui · Tidak — Non · Terima kasih — Merci · Sama-sama — De rien · Maaf — Pardon · Permisi — Excuse-moi · Tolong — S'il te plaît (pour demander) · Selamat pagi — Bonjour (le matin) · Selamat siang — Bonjour (la journée) · Selamat malam — Bonsoir · Sampai jumpa — Au revoir · Senang bertemu denganmu — Enchanté(e) |

To be reviewed by the developer before PR 2; corrections go into this table first.

## Out of scope

- Remembering the chosen language between two app starts.
- Indonesian articles (no source).
- Statistics of both languages side by side on the account screen.
- Levels above A1 for Indonesian.
