const STRATEGIES_BY_DIFFICULTY = {
  easy: [
    "direct_definition_elegant",
    "functional_use",
    "situational_prompt",
    "didactic_school",
    "lexicographic_humanized",
    "frequent_collocation"
  ],
  medium: [
    "indirect_definition",
    "contextual_synonym",
    "descriptive_periphrasis",
    "distinctive_trait",
    "frequent_collocation",
    "encyclopedic_light",
    "controlled_ambiguity",
    "morphosyntactic_hint"
  ],
  hard: [
    "antonym_contrast",
    "metaphorical_image",
    "register_marker",
    "elliptical_hint",
    "subtle_humor",
    "literary_association",
    "incomplete_idiom",
    "controlled_ambiguity"
  ]
};

export const CROSSWORD_LOCALE_PROFILES = Object.freeze({
  es: Object.freeze({
    locale: "es",
    title: "Espanol neutro de crucigrama",
    editorialVoice: "culto_accesible_breve",
    preferredWordRange: [5, 14],
    maxWords: 18,
    stopWords: new Set([
      "de",
      "la",
      "el",
      "los",
      "las",
      "un",
      "una",
      "y",
      "o",
      "en",
      "con",
      "por",
      "para",
      "del",
      "al",
      "que",
      "se",
      "lo",
      "le",
      "su",
      "sus"
    ]),
    genericPatterns: [
      /\btermino\s+relacionad[oa]\s+con\b/i,
      /\bpalabra\s+relacionad[oa]\s+con\b/i,
      /\bentrada\s+lexical\s+vinculad[oa]\s+a\b/i,
      /\bconcepto\s+general\b/i,
      /\bvocabulario\s+general\b/i,
      /\btema\s+indicado\b/i
    ],
    coldDictionaryPatterns: [
      /\bse\s+define\s+como\b/i,
      /\bse\s+denomina\b/i,
      /\bdefinicion\s+de\b/i,
      /\bvoz\s+que\s+significa\b/i
    ],
    awkwardSyntaxPatterns: [
      /\bque\s+que\b/i,
      /\bde\s+de\b/i,
      /\bpalabra\s+que\s+palabra\b/i
    ],
    difficultyStrategies: STRATEGIES_BY_DIFFICULTY,
    fieldLabels: Object.freeze({
      science: "ciencia",
      language: "lengua",
      culture: "cultura",
      society: "sociedad",
      technology: "tecnologia",
      education: "escuela",
      generic: "uso comun"
    }),
    registerMarkers: Object.freeze({
      formal: "registro formal",
      colloquial: "registro coloquial",
      literary: "tono literario"
    }),
    clueLeadIns: Object.freeze({
      neutral: [
        "Nombre habitual",
        "Idea clave",
        "Palabra precisa",
        "Termino usado"
      ],
      question: [
        "Como llamarias",
        "Que palabra encaja para",
        "Que termino resume"
      ]
    }),
    culturalReferences: [
      "aula",
      "hemeroteca",
      "atlas",
      "teatro",
      "museo",
      "cronica"
    ]
  }),
  en: Object.freeze({
    locale: "en",
    title: "Natural crossword English",
    editorialVoice: "smart_casual_clear",
    preferredWordRange: [4, 13],
    maxWords: 18,
    stopWords: new Set([
      "the",
      "a",
      "an",
      "of",
      "in",
      "on",
      "to",
      "for",
      "and",
      "or",
      "with",
      "from",
      "that",
      "this",
      "is",
      "are",
      "as",
      "by"
    ]),
    genericPatterns: [
      /\bword\s+related\s+to\b/i,
      /\bterm\s+related\s+to\b/i,
      /\bentry\s+associated\s+with\b/i,
      /\bgeneral\s+concept\b/i,
      /\bgeneral\s+vocabulary\b/i,
      /\bindicated\s+topic\b/i
    ],
    coldDictionaryPatterns: [
      /\bis\s+defined\s+as\b/i,
      /\bdefinition\s+of\b/i,
      /\bdenotes\b/i,
      /\blexical\s+unit\b/i
    ],
    awkwardSyntaxPatterns: [
      /\bthat\s+that\b/i,
      /\bof\s+of\b/i,
      /\bword\s+word\b/i
    ],
    difficultyStrategies: STRATEGIES_BY_DIFFICULTY,
    fieldLabels: Object.freeze({
      science: "science",
      language: "language",
      culture: "culture",
      society: "society",
      technology: "technology",
      education: "education",
      generic: "common usage"
    }),
    registerMarkers: Object.freeze({
      formal: "formal register",
      colloquial: "colloquial register",
      literary: "literary tone"
    }),
    clueLeadIns: Object.freeze({
      neutral: [
        "Common name",
        "Key notion",
        "Precise word",
        "Term often used"
      ],
      question: [
        "What would you call",
        "Which word fits",
        "What term captures"
      ]
    }),
    culturalReferences: [
      "library",
      "newspaper",
      "stage",
      "museum",
      "textbook",
      "essay"
    ]
  })
});

export const resolveCrosswordLocaleProfile = (locale) =>
  String(locale || "en").toLowerCase().startsWith("es")
    ? CROSSWORD_LOCALE_PROFILES.es
    : CROSSWORD_LOCALE_PROFILES.en;

export default CROSSWORD_LOCALE_PROFILES;
