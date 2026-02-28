import { useMemo } from "react";
import resolveBrowserLanguage from "../utils/resolveBrowserLanguage";

// ─── UI string translations ────────────────────────────────────────────────
const STRINGS = {
  es: {
    // Hero
    pill: "SaaS de juegos web",
    heroTitle: "Playforge Studio",
    heroCopy:
      "Catálogo de juegos jugables y técnicamente viables. Cada categoría incorpora dirección artística de referencia para llevar la experiencia a nivel profesional en móvil, tablet y escritorio.",
    statsGames: "Juegos disponibles",
    statsThemes: "Temáticas activas",
    statsViability: "Viabilidad técnica",
    statsViabilityValue: "100% Alta",
    // Catalog
    exploreTitle: "Explorar juegos",
    allCategories: "Todas",
    // Card
    difficulty: "Dificultad",
    startGame: "Comenzar",
    // Modal
    objective: "Objetivo",
    howToPlay: "Cómo jugar",
    controls: "Controles",
    playNow: "Jugando",
    loading: "Cargando motor del juego…",
    unsupported: "Este juego todavía no tiene motor jugable asignado.",
    back: "← Volver al catálogo",
    showInfo: "? Instrucciones",
    hideInfo: "✕ Ocultar",
    sessionLabel: "Sesión",
    modeLabel: "Modo",
    // Footer
    footerNote:
      "Plataforma orientada a modelo SaaS: cada categoría puede crecer con nuevos juegos completos sin romper la arquitectura del frontend.",
  },
  en: {
    // Hero
    pill: "Web games SaaS",
    heroTitle: "Playforge Studio",
    heroCopy:
      "A catalog of playable, technically viable games. Each category includes reference art direction to deliver a professional experience across mobile, tablet and desktop.",
    statsGames: "Available games",
    statsThemes: "Active themes",
    statsViability: "Technical viability",
    statsViabilityValue: "100% High",
    // Catalog
    exploreTitle: "Explore games",
    allCategories: "All",
    // Card
    difficulty: "Difficulty",
    startGame: "Play",
    // Modal
    objective: "Objective",
    howToPlay: "How to play",
    controls: "Controls",
    playNow: "Now playing",
    loading: "Loading game engine…",
    unsupported: "This game does not have a playable engine assigned yet.",
    back: "← Back to catalog",
    showInfo: "? Instructions",
    hideInfo: "✕ Hide",
    sessionLabel: "Session",
    modeLabel: "Mode",
    // Footer
    footerNote:
      "SaaS-oriented platform: each category can grow with new complete games without breaking the frontend architecture.",
  },
};

// ─── Category display names ────────────────────────────────────────────────
const CATEGORY_NAMES = {
  Aventura:     { es: "Aventura",    en: "Adventure"  },
  Accion:       { es: "Acción",      en: "Action"     },
  Arcade:       { es: "Arcade",      en: "Arcade"     },
  Deportes:     { es: "Deportes",    en: "Sports"     },
  Carreras:     { es: "Carreras",    en: "Racing"     },
  Conocimiento: { es: "Conocimiento",en: "Knowledge"  },
  Estrategia:   { es: "Estrategia",  en: "Strategy"   },
  RPG:          { es: "RPG",         en: "RPG"        },
};

// ─── Hooks ─────────────────────────────────────────────────────────────────
export function useLocale() {
  return useMemo(resolveBrowserLanguage, []);
}

export function useTranslations() {
  const locale = useLocale();
  const strings = STRINGS[locale] ?? STRINGS.en;
  return {
    t: (key) => strings[key] ?? key,
    locale,
  };
}

// ─── Helpers ───────────────────────────────────────────────────────────────

/**
 * Localizes the display name of a category key.
 * The "all categories" sentinel value is passed through the t() function.
 */
export function localizeCategory(categoryKey, locale) {
  return CATEGORY_NAMES[categoryKey]?.[locale] ?? categoryKey;
}

/**
 * Returns a flattened game object with fields resolved to the given locale.
 * Falls back to the original Spanish field when the English version is absent.
 */
export function getLocalizedGame(game, locale) {
  const isEn = locale === "en";
  return {
    ...game,
    tagline:     isEn ? (game.tagline_en     ?? game.tagline)     : game.tagline,
    category:    isEn ? (game.category_en    ?? game.category)    : game.category,
    description: isEn ? (game.description_en ?? game.description) : game.description,
    highlights:  isEn ? (game.highlights_en  ?? game.highlights)  : game.highlights,
    difficulty:  isEn ? (game.difficulty_en  ?? game.difficulty)  : game.difficulty,
    multiplayer: isEn ? (game.multiplayer_en ?? game.multiplayer) : game.multiplayer,
    objective:   isEn ? game.objective_en    : game.objective_es,
    howToPlay:   isEn ? game.howToPlay_en    : game.howToPlay_es,
  };
}
