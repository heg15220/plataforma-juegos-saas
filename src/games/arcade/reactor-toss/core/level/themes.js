import backgroundDesertUrl from "../../assets/original/background_desert_day.png";
import backgroundNeonUrl from "../../assets/original/background_neon_night.png";
import ballOrangeUrl from "../../assets/original/ball_orange_arcade.png";
import bucketTargetUrl from "../../assets/original/bucket_blue_target.png";
import bumperRoundUrl from "../../assets/original/obstacle_bumper_round.png";
import spikeStripUrl from "../../assets/original/obstacle_spike_strip.png";
import movingBarUrl from "../../assets/original/platform_moving_bar.png";

export const ART_ASSETS = {
  ballOrangeUrl,
  bucketTargetUrl,
  bumperRoundUrl,
  spikeStripUrl,
  movingBarUrl,
  backgrounds: {
    "neon-grid": backgroundNeonUrl,
    "alloy-dawn": backgroundDesertUrl,
  },
};

export const BALL_SKINS = [
  {
    id: "ember-core",
    name: { es: "Ascua", en: "Ember" },
    unlockedByStars: 0,
    colors: ["#ff9b33", "#ffcf68", "#8f3f08"],
  },
  {
    id: "cobalt-shell",
    name: { es: "Cobalto", en: "Cobalt" },
    unlockedByStars: 9,
    colors: ["#49a6ff", "#d8f4ff", "#174689"],
  },
  {
    id: "jade-pulse",
    name: { es: "Jade", en: "Jade" },
    unlockedByStars: 18,
    colors: ["#2de3a1", "#d9fff1", "#0f5e49"],
  },
  {
    id: "prism-glass",
    name: { es: "Prisma", en: "Prism" },
    unlockedByStars: 30,
    colors: ["#cf8bff", "#ffffff", "#4d2e8a"],
  },
  {
    id: "dusk-carbon",
    name: { es: "Carbono", en: "Carbon" },
    unlockedByStars: 42,
    colors: ["#8fa3c5", "#edf2ff", "#20293d"],
  },
];

export const WORLD_THEMES = {
  "neon-foundry": {
    id: "neon-foundry",
    name: { es: "Fundicion Neon", en: "Neon Foundry" },
    subtitle: {
      es: "Laboratorio arcade de orbita, rebote y precision magnetica.",
      en: "An arcade laboratory of orbit, rebound and magnetic precision.",
    },
    backgrounds: {
      "neon-grid": {
        kind: "image",
        label: { es: "Malla Neon", en: "Neon Grid" },
        accent: "#5ce7ff",
        overlayTop: "rgba(14, 10, 54, 0.42)",
        overlayBottom: "rgba(7, 12, 35, 0.74)",
      },
      "alloy-dawn": {
        kind: "image",
        label: { es: "Patio de Aleacion", en: "Alloy Yard" },
        accent: "#f6a63d",
        overlayTop: "rgba(69, 34, 17, 0.18)",
        overlayBottom: "rgba(46, 27, 18, 0.34)",
      },
      "prism-bay": {
        kind: "procedural",
        label: { es: "Bahia Prisma", en: "Prism Bay" },
        accent: "#76fbc4",
        skyTop: "#091427",
        skyBottom: "#16213f",
        grid: "#223f6a",
      },
    },
    palette: {
      uiBg: "#091325",
      uiLine: "rgba(115, 228, 255, 0.24)",
      uiText: "#eef6ff",
      accent: "#62e7ff",
      accentWarm: "#ffbd59",
      success: "#4ef0a5",
      danger: "#ff6b86",
    },
  },
};
