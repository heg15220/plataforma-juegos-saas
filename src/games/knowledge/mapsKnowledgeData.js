import { MAP_COUNTRY_GROUPS } from "./mapsCountryGroupsData.js";
import { MAP_COUNTRY_PROVINCE_CATALOG } from "./mapsCountryProvincesData.js";
import { MAP_CITY_COUNTRY_MAPS } from "./mapsCitiesData.js";

const normalizeMapId = (value) =>
  String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

const createTarget = ({
  id,
  labelEs,
  labelEn = labelEs,
  x,
  y,
  kind,
  aliases = []
}) => ({
  id,
  label: { es: labelEs, en: labelEn },
  x,
  y,
  kind,
  aliases
});

const continent = (id, labelEs, x, y, options = {}) =>
  createTarget({
    id,
    labelEs,
    labelEn: options.labelEn ?? labelEs,
    x,
    y,
    kind: "continent",
    aliases: options.aliases ?? []
  });

const ocean = (id, labelEs, x, y, options = {}) =>
  createTarget({
    id,
    labelEs,
    labelEn: options.labelEn ?? labelEs,
    x,
    y,
    kind: "ocean",
    aliases: options.aliases ?? []
  });

const country = (id, labelEs, x, y, options = {}) =>
  createTarget({
    id,
    labelEs,
    labelEn: options.labelEn ?? labelEs,
    x,
    y,
    kind: "country",
    aliases: options.aliases ?? []
  });

const province = (id, labelEs, x, y, options = {}) =>
  createTarget({
    id,
    labelEs,
    labelEn: options.labelEn ?? labelEs,
    x,
    y,
    kind: "province",
    aliases: options.aliases ?? []
  });

const city = (id, labelEs, x, y, options = {}) =>
  createTarget({
    id,
    labelEs,
    labelEn: options.labelEn ?? labelEs,
    x,
    y,
    kind: "city",
    aliases: options.aliases ?? []
  });

const countryGroupTarget = (entry) =>
  country(entry.id, entry.labelEs, 50, 50, {
    labelEn: entry.labelEn ?? entry.labelEs,
    aliases: entry.aliases ?? []
  });

const provinceGroupTarget = (entry) =>
  province(entry.id, entry.labelEs, 50, 50, {
    labelEn: entry.labelEn ?? entry.labelEs,
    aliases: entry.aliases ?? []
  });

const cityGroupTarget = (entry) =>
  city(entry.id, entry.labelEs, entry.x, entry.y, {
    labelEn: entry.labelEn ?? entry.labelEs,
    aliases: entry.aliases ?? []
  });

const EUROPE_COUNTRIES_TARGETS = (MAP_COUNTRY_GROUPS.europe ?? []).map(countryGroupTarget);
const AFRICA_COUNTRIES_TARGETS = (MAP_COUNTRY_GROUPS.africa ?? []).map(countryGroupTarget);
const AMERICA_COUNTRIES_TARGETS = (MAP_COUNTRY_GROUPS.america ?? []).map(countryGroupTarget);
const ASIA_COUNTRIES_TARGETS = (MAP_COUNTRY_GROUPS.asia ?? []).map(countryGroupTarget);
const OCEANIA_COUNTRIES_TARGETS = (MAP_COUNTRY_GROUPS.oceania ?? []).map(countryGroupTarget);

const COUNTRY_PROVINCE_MAPS = (MAP_COUNTRY_PROVINCE_CATALOG ?? [])
  .map((catalogEntry) => ({
    id: catalogEntry.id,
    name: catalogEntry.name,
    subtitle: catalogEntry.subtitle,
    theme: catalogEntry.id,
    targets: (catalogEntry.targets ?? []).map(provinceGroupTarget)
  }))
  .filter((entry) => entry.id !== "spain");

const WORLD_TARGETS = [
  continent("north-america", "America del Norte", 18, 30, {
    labelEn: "North America",
    aliases: ["Norteamerica"]
  }),
  continent("south-america", "America del Sur", 30, 62, {
    labelEn: "South America",
    aliases: ["Sudamerica"]
  }),
  continent("europe", "Europa", 50, 28, {
    labelEn: "Europe"
  }),
  continent("africa", "Africa", 53, 50, {
    labelEn: "Africa"
  }),
  continent("asia", "Asia", 71, 36, {
    labelEn: "Asia"
  }),
  continent("oceania", "Oceania", 84, 64, {
    labelEn: "Oceania",
    aliases: ["Australia"]
  }),
  continent("antarctica", "Antartida", 52, 88, {
    labelEn: "Antarctica"
  }),
  ocean("pacific", "Oceano Pacifico", 8, 50, {
    labelEn: "Pacific Ocean",
    aliases: ["Pacifico", "Pacific"]
  }),
  ocean("atlantic", "Oceano Atlantico", 41, 47, {
    labelEn: "Atlantic Ocean",
    aliases: ["Atlantico", "Atlantic"]
  }),
  ocean("indian", "Oceano Indico", 66, 58, {
    labelEn: "Indian Ocean",
    aliases: ["Indico", "Indian"]
  }),
  ocean("arctic", "Oceano Artico", 53, 10, {
    labelEn: "Arctic Ocean",
    aliases: ["Artico", "Arctic"]
  }),
  ocean("southern", "Oceano Antartico", 53, 78, {
    labelEn: "Southern Ocean",
    aliases: ["Oceano Austral", "Southern"]
  })
];

const EUROPE_TARGETS = [
  country("iceland", "Islandia", 13, 11, { labelEn: "Iceland" }),
  country("ireland", "Irlanda", 18, 28, { labelEn: "Ireland" }),
  country("united-kingdom", "Inglaterra", 25, 24, {
    labelEn: "England",
    aliases: ["UK", "United Kingdom", "Reino Unido", "Gran Bretana"]
  }),
  country("portugal", "Portugal", 23, 56, { labelEn: "Portugal" }),
  country("spain", "Espana", 29, 58, {
    labelEn: "Spain",
    aliases: ["Espana"]
  }),
  country("andorra", "Andorra", 31, 51, { labelEn: "Andorra" }),
  country("france", "Francia", 34, 44, { labelEn: "France" }),
  country("belgium", "Belgica", 37, 35, { labelEn: "Belgium" }),
  country("netherlands", "Paises Bajos", 40, 31, {
    labelEn: "Netherlands",
    aliases: ["Holanda"]
  }),
  country("luxembourg", "Luxemburgo", 40, 38, { labelEn: "Luxembourg" }),
  country("germany", "Alemania", 45, 37, { labelEn: "Germany" }),
  country("switzerland", "Suiza", 44, 45, { labelEn: "Switzerland" }),
  country("liechtenstein", "Liechtenstein", 46, 44, { labelEn: "Liechtenstein" }),
  country("austria", "Austria", 50, 44, { labelEn: "Austria" }),
  country("italy", "Italia", 52, 56, { labelEn: "Italy" }),
  country("san-marino", "San Marino", 50, 53, { labelEn: "San Marino" }),
  country("vatican-city", "Ciudad del Vaticano", 50, 56, {
    labelEn: "Vatican City",
    aliases: ["Vaticano", "Holy See"]
  }),
  country("malta", "Malta", 56, 73, { labelEn: "Malta" }),
  country("denmark", "Dinamarca", 45, 27, { labelEn: "Denmark" }),
  country("norway", "Noruega", 44, 12, { labelEn: "Norway" }),
  country("sweden", "Suecia", 50, 15, { labelEn: "Sweden" }),
  country("finland", "Finlandia", 57, 12, { labelEn: "Finland" }),
  country("estonia", "Estonia", 61, 20, { labelEn: "Estonia" }),
  country("latvia", "Letonia", 62, 24, { labelEn: "Latvia" }),
  country("lithuania", "Lituania", 60, 28, { labelEn: "Lithuania" }),
  country("poland", "Polonia", 55, 33, { labelEn: "Poland" }),
  country("czechia", "Republica Checa", 50, 38, {
    labelEn: "Czechia",
    aliases: ["Czech Republic"]
  }),
  country("slovakia", "Eslovaquia", 54, 41, { labelEn: "Slovakia" }),
  country("hungary", "Hungria", 56, 45, { labelEn: "Hungary" }),
  country("slovenia", "Eslovenia", 50, 49, { labelEn: "Slovenia" }),
  country("croatia", "Croacia", 53, 52, { labelEn: "Croatia" }),
  country("bosnia-herzegovina", "Bosnia y Herzegovina", 56, 53, {
    labelEn: "Bosnia and Herzegovina",
    aliases: ["Bosnia"]
  }),
  country("serbia", "Serbia", 60, 51, { labelEn: "Serbia" }),
  country("montenegro", "Montenegro", 58, 56, { labelEn: "Montenegro" }),
  country("kosovo", "Kosovo", 61, 53, { labelEn: "Kosovo" }),
  country("albania", "Albania", 61, 58, { labelEn: "Albania" }),
  country("north-macedonia", "Macedonia del Norte", 63, 56, {
    labelEn: "North Macedonia"
  }),
  country("greece", "Grecia", 66, 63, { labelEn: "Greece" }),
  country("bulgaria", "Bulgaria", 66, 52, { labelEn: "Bulgaria" }),
  country("romania", "Rumania", 65, 45, {
    labelEn: "Romania",
    aliases: ["Rumania", "Romania"]
  }),
  country("moldova", "Moldavia", 68, 42, {
    labelEn: "Moldova",
    aliases: ["Republica de Moldavia"]
  }),
  country("ukraine", "Ucrania", 73, 38, { labelEn: "Ukraine" }),
  country("belarus", "Bielorrusia", 66, 31, {
    labelEn: "Belarus"
  }),
  country("russia", "Rusia", 84, 24, { labelEn: "Russia" }),
  country("turkey", "Turquia", 76, 57, {
    labelEn: "Turkey"
  }),
  country("cyprus", "Chipre", 78, 73, { labelEn: "Cyprus" }),
  country("georgia", "Georgia", 86, 52, { labelEn: "Georgia" }),
  country("armenia", "Armenia", 89, 56, { labelEn: "Armenia" }),
  country("azerbaijan", "Azerbaiyan", 93, 55, {
    labelEn: "Azerbaijan"
  }),
  country("monaco", "Monaco", 39, 52, { labelEn: "Monaco" })
];

const SOUTH_AMERICA_TARGETS = [
  country("colombia", "Colombia", 35, 20, { labelEn: "Colombia" }),
  country("venezuela", "Venezuela", 50, 20, { labelEn: "Venezuela" }),
  country("guyana", "Guyana", 59, 24, { labelEn: "Guyana" }),
  country("suriname", "Surinam", 63, 24, {
    labelEn: "Suriname",
    aliases: ["Suriname"]
  }),
  country("ecuador", "Ecuador", 33, 29, { labelEn: "Ecuador" }),
  country("peru", "Peru", 37, 41, { labelEn: "Peru" }),
  country("brazil", "Brasil", 56, 43, {
    labelEn: "Brazil",
    aliases: ["Brazil"]
  }),
  country("bolivia", "Bolivia", 45, 49, { labelEn: "Bolivia" }),
  country("paraguay", "Paraguay", 49, 57, { labelEn: "Paraguay" }),
  country("chile", "Chile", 31, 63, { labelEn: "Chile" }),
  country("argentina", "Argentina", 44, 74, { labelEn: "Argentina" }),
  country("uruguay", "Uruguay", 55, 68, { labelEn: "Uruguay" })
];

const SPAIN_PROVINCES_TARGETS = [
  province("a-coruna", "A Coruna", 18, 23, { aliases: ["La Coruna"] }),
  province("lugo", "Lugo", 27, 20),
  province("ourense", "Ourense", 24, 31),
  province("pontevedra", "Pontevedra", 17, 32),
  province("asturias", "Asturias", 28, 17),
  province("leon", "Leon", 35, 21),
  province("zamora", "Zamora", 33, 29),
  province("salamanca", "Salamanca", 36, 34),
  province("palencia", "Palencia", 42, 24),
  province("burgos", "Burgos", 48, 23),
  province("cantabria", "Cantabria", 47, 17),
  province("bizkaia", "Bizkaia", 53, 16, { aliases: ["Vizcaya"] }),
  province("gipuzkoa", "Gipuzkoa", 57, 17, { aliases: ["Guipuzcoa"] }),
  province("alava", "Alava", 52, 22, { aliases: ["Araba"] }),
  province("navarra", "Navarra", 58, 24, { labelEn: "Navarre" }),
  province("la-rioja", "La Rioja", 55, 27, { aliases: ["Rioja"] }),
  province("soria", "Soria", 56, 33),
  province("huesca", "Huesca", 64, 24),
  province("lleida", "Lleida", 70, 25, { aliases: ["Lerida"] }),
  province("girona", "Girona", 76, 23, { aliases: ["Gerona"] }),
  province("barcelona", "Barcelona", 74, 30),
  province("tarragona", "Tarragona", 69, 34),
  province("zaragoza", "Zaragoza", 62, 31),
  province("teruel", "Teruel", 62, 38),
  province("castellon", "Castellon", 68, 42, {
    aliases: ["Castellon de la Plana"]
  }),
  province("valencia", "Valencia", 68, 48),
  province("alicante", "Alicante", 67, 54, { aliases: ["Alacant"] }),
  province("murcia", "Murcia", 62, 58),
  province("albacete", "Albacete", 58, 50),
  province("cuenca", "Cuenca", 56, 43),
  province("guadalajara", "Guadalajara", 52, 39),
  province("madrid", "Madrid", 48, 41),
  province("toledo", "Toledo", 47, 47),
  province("ciudad-real", "Ciudad Real", 49, 54),
  province("jaen", "Jaen", 52, 60),
  province("cordoba", "Cordoba", 45, 60),
  province("sevilla", "Sevilla", 38, 63),
  province("huelva", "Huelva", 30, 65),
  province("cadiz", "Cadiz", 34, 71),
  province("malaga", "Malaga", 41, 70),
  province("granada", "Granada", 49, 67),
  province("almeria", "Almeria", 57, 67),
  province("badajoz", "Badajoz", 32, 47),
  province("caceres", "Caceres", 36, 41),
  province("avila", "Avila", 43, 36),
  province("segovia", "Segovia", 46, 34),
  province("valladolid", "Valladolid", 42, 30),
  province("illes-balears", "Illes Balears", 86, 45, {
    labelEn: "Balearic Islands",
    aliases: ["Baleares", "Islas Baleares"]
  }),
  province("las-palmas", "Las Palmas", 16, 87),
  province("santa-cruz-de-tenerife", "Santa Cruz de Tenerife", 8, 85)
];

const WORLD_MAP = {
  id: "world",
  name: { es: "Mundo", en: "World" },
  subtitle: {
    es: "Continentes y oceanos ocultos",
    en: "Hidden continents and oceans"
  },
  theme: "world",
  targets: WORLD_TARGETS
};

export const CONTINENT_MAPS = [
  {
    id: "europe",
    name: { es: "Europa", en: "Europe" },
    subtitle: {
      es: "Todos los paises de Europa ocultos",
      en: "All European countries hidden"
    },
    theme: "europe",
    targets: EUROPE_TARGETS
  },
  {
    id: "south-america",
    name: { es: "Sudamerica", en: "South America" },
    subtitle: {
      es: "Paises de Sudamerica ocultos",
      en: "Hidden South American countries"
    },
    theme: "south-america",
    targets: SOUTH_AMERICA_TARGETS
  },
  {
    id: "africa",
    name: { es: "Africa", en: "Africa" },
    subtitle: {
      es: "Todos los paises de Africa ocultos",
      en: "All African countries hidden"
    },
    theme: "countries-africa",
    targets: AFRICA_COUNTRIES_TARGETS
  },
  {
    id: "america",
    name: { es: "America", en: "Americas" },
    subtitle: {
      es: "Todos los paises de America ocultos",
      en: "All countries in the Americas hidden"
    },
    theme: "countries-america",
    targets: AMERICA_COUNTRIES_TARGETS
  },
  {
    id: "asia",
    name: { es: "Asia", en: "Asia" },
    subtitle: {
      es: "Todos los paises de Asia ocultos",
      en: "All Asian countries hidden"
    },
    theme: "countries-asia",
    targets: ASIA_COUNTRIES_TARGETS
  },
  {
    id: "oceania",
    name: { es: "Oceania", en: "Oceania" },
    subtitle: {
      es: "Todos los paises de Oceania ocultos",
      en: "All Oceanian countries hidden"
    },
    theme: "countries-oceania",
    targets: OCEANIA_COUNTRIES_TARGETS
  }
];

const SPAIN_COUNTRY_MAP = {
  id: "spain",
  name: { es: "Espana", en: "Spain" },
  subtitle: {
    es: "Todas las provincias de Espana ocultas",
    en: "All Spanish provinces hidden"
  },
  theme: "spain",
  targets: SPAIN_PROVINCES_TARGETS
};

export const COUNTRY_MAPS = [
  SPAIN_COUNTRY_MAP,
  ...COUNTRY_PROVINCE_MAPS
];

export const CITY_MAPS = (MAP_CITY_COUNTRY_MAPS ?? []).map((entry) => ({
  id: entry.id,
  name: entry.name,
  subtitle: entry.subtitle,
  theme: entry.baseSilhouette?.theme ?? entry.id,
  baseSilhouette: entry.baseSilhouette
    ? {
      theme: entry.baseSilhouette.theme,
      ids: [...(entry.baseSilhouette.ids ?? [])]
    }
    : null,
  targets: (entry.targets ?? []).map(cityGroupTarget)
}));

const CONTINENT_MAPS_BY_ID = new Map(CONTINENT_MAPS.map((entry) => [entry.id, entry]));
const COUNTRY_MAPS_BY_ID = new Map(COUNTRY_MAPS.map((entry) => [entry.id, entry]));
const CITY_MAPS_BY_ID = new Map(CITY_MAPS.map((entry) => [entry.id, entry]));

export const DEFAULT_CONTINENT_ID = CONTINENT_MAPS[0].id;
export const DEFAULT_COUNTRY_ID = COUNTRY_MAPS[0].id;
export const DEFAULT_CITY_ID = CITY_MAPS[0]?.id ?? DEFAULT_COUNTRY_ID;

export const MAP_SCOPE_OPTIONS = [
  { id: "world", label: { es: "Mundo", en: "World" } },
  { id: "continent", label: { es: "Continente", en: "Continent" } },
  { id: "country", label: { es: "Pais", en: "Country" } },
  { id: "city", label: { es: "Ciudades", en: "Cities" } }
];

const CONTINENT_VISUAL_REGION_BY_ID = {
  europe: "europe",
  "south-america": "south-america",
  africa: "africa",
  america: "america",
  asia: "asia",
  oceania: "oceania"
};

const COUNTRY_VISUAL_REGION_BY_ID = (() => {
  const byId = new Map();
  for (const [groupId, entries] of Object.entries(MAP_COUNTRY_GROUPS ?? {})) {
    const visualRegion = groupId === "america" ? "america" : groupId;
    for (const entry of entries ?? []) {
      byId.set(normalizeMapId(entry.id), visualRegion);
    }
  }
  const aliases = {
    "bosnia-herzegovina": "europe",
    "bosnia-and-herzegovina": "europe",
    "united-states": "america",
    usa: "america"
  };
  for (const [aliasId, visualRegion] of Object.entries(aliases)) {
    byId.set(normalizeMapId(aliasId), visualRegion);
  }
  return byId;
})();

const resolveCountryVisualRegion = (countryId) =>
  COUNTRY_VISUAL_REGION_BY_ID.get(normalizeMapId(countryId)) ?? "global";

export const resolveMapVisualRegion = (scopeMode, continentId, countryId, cityId) => {
  if (scopeMode === "world") return "world";
  if (scopeMode === "continent") {
    return CONTINENT_VISUAL_REGION_BY_ID[continentId] ?? "global";
  }
  if (scopeMode === "country") {
    return resolveCountryVisualRegion(countryId);
  }
  if (scopeMode === "city") {
    return resolveCountryVisualRegion(cityId);
  }
  return "global";
};

export const resolveMapDefinition = (scopeMode, continentId, countryId, cityId) => {
  if (scopeMode === "continent") {
    return CONTINENT_MAPS_BY_ID.get(continentId) ?? CONTINENT_MAPS[0];
  }
  if (scopeMode === "country") {
    return COUNTRY_MAPS_BY_ID.get(countryId) ?? COUNTRY_MAPS[0];
  }
  if (scopeMode === "city") {
    return CITY_MAPS_BY_ID.get(cityId) ?? CITY_MAPS[0] ?? COUNTRY_MAPS[0];
  }
  return WORLD_MAP;
};
