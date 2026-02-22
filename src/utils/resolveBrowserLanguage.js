const DEFAULT_LANGUAGE = "en";

const pickNavigatorLanguage = () => {
  if (typeof navigator === "undefined") {
    return DEFAULT_LANGUAGE;
  }

  if (Array.isArray(navigator.languages) && navigator.languages.length > 0) {
    return navigator.languages[0] || DEFAULT_LANGUAGE;
  }

  return navigator.language || DEFAULT_LANGUAGE;
};

export default function resolveBrowserLanguage() {
  const language = String(pickNavigatorLanguage()).toLowerCase();
  return language.startsWith("es") ? "es" : "en";
}
