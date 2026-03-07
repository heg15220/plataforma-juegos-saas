# Map Silhouette Sources

Generated on 2026-03-07.

## Country boundaries
- Source: https://github.com/datasets/geo-countries
- Raw file used: `data/countries.geojson`
- License: Open Data Commons Public Domain Dedication and License (PDDL)

## Spain provinces boundaries
- Source: https://github.com/codeforgermany/click_that_hood
- Raw file used: `public/data/spain-provinces.geojson`
- License: MIT (`LICENSE` in upstream repository)

## Additional country subdivisions
- Source: https://github.com/codeforgermany/click_that_hood
- Raw files used:
  - `public/data/france-departments.geojson`
  - `public/data/australia.geojson`
  - `public/data/brazil-states.geojson`
- License: MIT (`LICENSE` in upstream repository)

## Country metadata (region + translations)
- Source: https://github.com/mledoze/countries
- Raw file used: `countries.json`
- License: Open Database License (ODbL)

## Global cities dataset
- Source: https://github.com/nvkelso/natural-earth-vector
- Raw file used: `geojson/ne_10m_populated_places.geojson`
- License: Public domain (Natural Earth)

## Local generation
- Script: `scripts/generate-maps-silhouettes.mjs`
- Output: `src/games/knowledge/mapsSilhouettesData.js`
- Notes:
  - Geometry is simplified for runtime performance.
  - Labels still use game targets from `mapsKnowledgeData.js`.

## Local country groups
- Script: `scripts/generate-maps-country-groups.mjs`
- Output: `src/games/knowledge/mapsCountryGroupsData.js`
- Notes:
  - Generates country pools for Europe, America, Asia and Oceania.
  - Includes ES/EN labels and aliases used by the map guess validator.

## Local country provinces
- Script: `scripts/generate-maps-country-provinces.mjs`
- Output: `src/games/knowledge/mapsCountryProvincesData.js`
- Notes:
  - Builds an expanded multi-country subdivision catalog from Click That Hood metadata + GeoJSON.
  - Writes normalized source files under `tmp-click-country-subdivisions/`.

## Local city maps
- Script: `scripts/generate-maps-cities.mjs`
- Output: `src/games/knowledge/mapsCitiesData.js`
- Notes:
  - Generates major-city targets per country map using Natural Earth populated places.
