import { resolveCrosswordLocaleProfile } from "./crosswordLocaleProfiles.js";
import { normalizeCrosswordAscii } from "./crosswordLexiconNormalizer.js";

const hashText = (text) => {
  const source = String(text || "");
  let hash = 2166136261;
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const seededOrder = (items, seedKey) => {
  const safe = Array.isArray(items) ? items.filter(Boolean) : [];
  return safe
    .map((item, index) => ({ item, rank: hashText(`${seedKey}:${index}:${item}`) }))
    .sort((left, right) => left.rank - right.rank)
    .map(({ item }) => item);
};

const resolveConcept = (entry, locale) => {
  const concept = normalizeCrosswordAscii(
    entry?.semantic?.anchor
      || entry?.semantic?.coreConcept
      || entry?.definition
      || ""
  ).toLowerCase();
  if (!concept) {
    return locale === "es" ? "uso habitual" : "common usage";
  }
  return concept;
};

const resolveFieldLabel = (entry, localeProfile) => {
  const field = entry?.semantic?.field || "generic";
  return localeProfile.fieldLabels[field] || localeProfile.fieldLabels.generic;
};

const resolveCollocation = (entry, locale) => {
  const first = entry?.lexicalRelations?.collocations?.[0];
  if (first) return normalizeCrosswordAscii(first).toLowerCase();
  return locale === "es" ? "uso habitual" : "common usage";
};

const renderSpanishTemplates = (strategyId, context) => {
  const { concept, fieldLabel, collocation, pos, register } = context;
  switch (strategyId) {
    case "direct_definition_elegant":
      return [
        `Nombre preciso para ${concept}`,
        `Idea clara en torno a ${concept}`,
        `Termino breve para hablar de ${concept}`
      ];
    case "indirect_definition":
      return [
        `Se usa cuando aparece ${concept} en contexto`,
        `Aparece al describir ${concept}`,
        `Encaja en pistas sobre ${concept}`
      ];
    case "contextual_synonym":
      return [
        `Cercana a ${concept}, segun el contexto`,
        `Rozando ${concept}, sin repetirlo`,
        `Vecina semantica de ${concept}`
      ];
    case "antonym_contrast":
      return [
        `Su opuesto orienta la pista; piensa en ${concept}`,
        `Por contraste con su contrario, apunta a ${concept}`,
        `Clue por antitesis: regresa a ${concept}`
      ];
    case "descriptive_periphrasis":
      return [
        `Perifrasis breve de ${concept}`,
        `Descripcion corta de ${concept} en clave ${fieldLabel}`,
        `Rodeo descriptivo para ${concept}`
      ];
    case "cultural_reference_light":
      return [
        `Aparece en cultura general cuando se trata ${concept}`,
        `Referencia comun de hemeroteca para ${concept}`,
        `Guiño cultural ligero ligado a ${concept}`
      ];
    case "incomplete_idiom":
      return [
        `Completa la expresion que remite a ${concept}`,
        `Frase hecha a medias, concepto: ${concept}`,
        `Dicho incompleto que apunta a ${concept}`
      ];
    case "frequent_collocation":
      return [
        `Suele ir con la colocacion "${collocation}"`,
        `Colocacion frecuente: ${collocation}`,
        `Se oye junto a ${collocation}`
      ];
    case "situational_prompt":
      return [
        `En esta situacion de ${fieldLabel}, encaja ${concept}`,
        `En una escena de ${fieldLabel}, apunta a ${concept}`,
        `Si el contexto es ${fieldLabel}, piensa en ${concept}`
      ];
    case "functional_use":
      return [
        `Sirve para nombrar ${concept} en uso real`,
        `Funcion principal: expresar ${concept}`,
        `Utilidad linguistica para ${concept}`
      ];
    case "metaphorical_image":
      return [
        `Imagen metaforica que desemboca en ${concept}`,
        `Metafora suave para insinuar ${concept}`,
        `Figura verbal: sombra de ${concept}`
      ];
    case "register_marker":
      return [
        `Se reconoce por su ${register}`,
        `Pista de matiz de ${register}`,
        `Termino marcado por ${register}`
      ];
    case "distinctive_trait":
      return [
        `Rasgo distintivo: ${concept}`,
        `Se distingue por su relacion con ${concept}`,
        `Marca propia del campo ${fieldLabel}: ${concept}`
      ];
    case "encyclopedic_light":
      return [
        `Dato enciclopedico basico del area ${fieldLabel}`,
        `Pincelada enciclopedica: ${concept}`,
        `Conocimiento general de ${fieldLabel} vinculado a ${concept}`
      ];
    case "morphosyntactic_hint":
      return pos === "verb"
        ? [`Verbo que se usa para ${concept}`, `Forma verbal ligada a ${concept}`]
        : pos === "adverb"
          ? [`Adverbio que matiza ${concept}`, `Forma adverbial asociada a ${concept}`]
          : [`Pista morfosintactica en torno a ${concept}`, `Categoria gramatical con foco en ${concept}`];
    case "elliptical_hint":
      return [
        `Elipsis: en ${fieldLabel}, bastaria con decir "${concept}"`,
        `Frase recortada; la idea clave es ${concept}`,
        `Pista eliptica con nucleo en ${concept}`
      ];
    case "subtle_humor":
      return [
        `Con humor leve: cuando no sabes que decir, acaba saliendo ${concept}`,
        `Sonrisa breve de crucigrama: ${concept} al rescate`,
        `Pizca de humor, objetivo serio: ${concept}`
      ];
    case "literary_association":
      return [
        `Asociacion literaria suave con ${concept}`,
        `Eco de lectura: ${concept}`,
        `Referencia de texto clasico en torno a ${concept}`
      ];
    case "controlled_ambiguity":
      return [
        `Ambigua pero justa: orbita alrededor de ${concept}`,
        `Doble lectura controlada, centro en ${concept}`,
        `Pista con margen de duda, anclada en ${concept}`
      ];
    case "didactic_school":
      return [
        `Definicion de aula para ${concept}`,
        `Version escolar y clara de ${concept}`,
        `Explicacion didactica de ${concept}`
      ];
    case "lexicographic_humanized":
    default:
      return [
        `Definicion humana de ${concept}`,
        `Forma natural de definir ${concept}`,
        `Descripcion clara de ${concept}`
      ];
  }
};

const renderEnglishTemplates = (strategyId, context) => {
  const { concept, fieldLabel, collocation, pos, register } = context;
  switch (strategyId) {
    case "direct_definition_elegant":
      return [
        `Precise name for ${concept}`,
        `Clear notion around ${concept}`,
        `Compact term used for ${concept}`
      ];
    case "indirect_definition":
      return [
        `Used when ${concept} appears in context`,
        `Shows up while describing ${concept}`,
        `Fits clues built around ${concept}`
      ];
    case "contextual_synonym":
      return [
        `Close to ${concept}, context decides`,
        `Semantically near ${concept}, not a copy`,
        `Meaning neighbor of ${concept}`
      ];
    case "antonym_contrast":
      return [
        `Think through its opposite, then return to ${concept}`,
        `Contrast clue pointing back to ${concept}`,
        `Antithesis route, target is ${concept}`
      ];
    case "descriptive_periphrasis":
      return [
        `Brief descriptive paraphrase of ${concept}`,
        `Roundabout definition for ${concept}`,
        `Descriptive hint in ${fieldLabel} for ${concept}`
      ];
    case "cultural_reference_light":
      return [
        `Light culture reference tied to ${concept}`,
        `Common reference clue when ${concept} is discussed`,
        `General-knowledge nod toward ${concept}`
      ];
    case "incomplete_idiom":
      return [
        `Finish the familiar phrase linked to ${concept}`,
        `Half an idiom, full idea: ${concept}`,
        `Incomplete expression pointing to ${concept}`
      ];
    case "frequent_collocation":
      return [
        `Often paired with "${collocation}"`,
        `Frequent collocation hint: ${collocation}`,
        `Commonly heard next to ${collocation}`
      ];
    case "situational_prompt":
      return [
        `In this ${fieldLabel} scenario, ${concept} fits`,
        `Picture a ${fieldLabel} context and think ${concept}`,
        `Situational clue leading to ${concept}`
      ];
    case "functional_use":
      return [
        `Used to name ${concept} in practice`,
        `Main function: express ${concept}`,
        `Functional clue tied to ${concept}`
      ];
    case "metaphorical_image":
      return [
        `Metaphoric image that lands on ${concept}`,
        `Soft metaphor hinting at ${concept}`,
        `Figurative clue with ${concept} at the core`
      ];
    case "register_marker":
      return [
        `Notice its ${register}`,
        `Register-driven clue: ${register}`,
        `Term marked by ${register}`
      ];
    case "distinctive_trait":
      return [
        `Distinctive trait points to ${concept}`,
        `Recognized by its link to ${concept}`,
        `Field marker in ${fieldLabel}: ${concept}`
      ];
    case "encyclopedic_light":
      return [
        `Light encyclopedic fact from ${fieldLabel}`,
        `Compact encyclopedic clue: ${concept}`,
        `General reference in ${fieldLabel} about ${concept}`
      ];
    case "morphosyntactic_hint":
      return pos === "verb"
        ? [`Verb form used for ${concept}`, `Verbal clue linked to ${concept}`]
        : pos === "adverb"
          ? [`Adverbial form shaping ${concept}`, `Adverb clue tied to ${concept}`]
          : [`Morphosyntactic hint around ${concept}`, `Grammar-aware clue for ${concept}`];
    case "elliptical_hint":
      return [
        `Ellipsis clue: in ${fieldLabel}, only ${concept} is left`,
        `Trimmed sentence, core idea is ${concept}`,
        `Elliptical wording anchored in ${concept}`
      ];
    case "subtle_humor":
      return [
        `Subtle wink: when in doubt, ${concept} appears`,
        `Light humor, fair clue: ${concept}`,
        `Quick smile clue aimed at ${concept}`
      ];
    case "literary_association":
      return [
        `Light literary association with ${concept}`,
        `Reading-room echo of ${concept}`,
        `Textual hint circling ${concept}`
      ];
    case "controlled_ambiguity":
      return [
        `Ambiguous but fair, orbiting ${concept}`,
        `Two readings, one center: ${concept}`,
        `Controlled ambiguity anchored in ${concept}`
      ];
    case "didactic_school":
      return [
        `School-style definition of ${concept}`,
        `Classroom-clear explanation of ${concept}`,
        `Didactic clue focused on ${concept}`
      ];
    case "lexicographic_humanized":
    default:
      return [
        `Humanized definition of ${concept}`,
        `Natural way to define ${concept}`,
        `Clear description of ${concept}`
      ];
  }
};

export const generateTemplateCandidates = ({
  entry,
  strategyId,
  locale,
  seedKey
}) => {
  const localeProfile = resolveCrosswordLocaleProfile(locale);
  const concept = resolveConcept(entry, localeProfile.locale);
  const fieldLabel = resolveFieldLabel(entry, localeProfile);
  const collocation = resolveCollocation(entry, localeProfile.locale);
  const register = localeProfile.registerMarkers.formal;
  const context = {
    concept,
    fieldLabel,
    collocation,
    register,
    pos: entry?.pos || "generic"
  };

  const raw = localeProfile.locale === "es"
    ? renderSpanishTemplates(strategyId, context)
    : renderEnglishTemplates(strategyId, context);

  return seededOrder(raw, `${seedKey}:${strategyId}`);
};
