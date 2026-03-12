# Banco de refranes

Generado el 2026-03-12 con `scripts/generate-proverb-bank.mjs`.

## Conteo final

- Espanol: 500 refranes
- Ingles: 500 proverbs

## Fuentes

- Espanol: paginas alfabeticas de Wikiquote ES bajo `Refranes en espanol (...)`.
  - Base: https://es.wikiquote.org/wiki/Refranes_en_espa%C3%B1ol
- Ingles: categoria publica `Category:English proverbs` de Wiktionary.
  - Base: https://en.wiktionary.org/wiki/Category:English_proverbs
- Ingles (apoyo para cobertura): pagina alfabetica de Wikiquote EN.
  - Base: https://en.wikiquote.org/wiki/English_proverbs_(alphabetically_by_proverb)

## Criterios de filtrado

- Deduplicacion por normalizacion sin tildes, puntuacion ni mayusculas.
- Exclusiones basicas de entradas demasiado cortas/largas o con lenguaje explicitamente ofensivo.
- Particionado automatico en `prompt` + `answer` para la mecanica de completar refranes.
