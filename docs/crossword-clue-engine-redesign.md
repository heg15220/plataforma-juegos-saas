# Crossword Clue Engine Redesign (ES/EN)

## 1) Diagnostico del sistema anterior

Problemas observados en la logica previa de crucigramas:

1. Dependencia fuerte de plantillas casi fijas.
2. Pistas mecanicas: patrones repetidos (`termino relacionado con`, `entry associated with`).
3. Escasa separacion entre palabra, concepto y pista jugable.
4. Dificultad casi reducida a longitud.
5. Baja diversidad sintactica en una misma partida.
6. Validador limitado (detecta poco mas que presencia de respuesta).
7. Banco lexico grande pero semanticamente pobre.

## 2) Definicion operativa de pista de calidad

Una pista buena en este producto debe cumplir simultaneamente:

1. Claridad semantica: orienta al concepto correcto.
2. Naturalidad idiomatica: suena escrita por humano en cada idioma.
3. Jugabilidad: inferencia justa, sin trampa opaca.
4. Brevedad eficaz: lectura rapida, carga cognitiva contenida.
5. Elegancia verbal: redaccion limpia, sin rigidez de diccionario.
6. Variedad retorica: alterna estilos, evita monotonia.
7. No spoiler lexico: sin respuesta ni derivaciones triviales.
8. Adecuacion a nivel: facil/medio/dificil cambia por inferencia real.
9. Coherencia cultural: referencias ligeras y apropiadas por idioma.
10. Tono de crucigrama real: culto accesible, sin frialdad robotica.

### Rubrica tecnica

Puntaje total: 0-100.

1. Semantica: 0-25
2. Naturalidad: 0-20
3. Jugabilidad/inferencia justa: 0-15
4. Brevedad y ritmo: 0-10
5. Estilo editorial: 0-10
6. Diversidad y no repeticion: 0-10
7. Seguridad anti-spoiler: 0-10

Clasificacion:

1. Correcta pero mediocre: 55-69
2. Util: 70-79
3. Excelente: 80+
4. Defectuosa/injusta: <55 o hard fail

Hard fail (rechazo automatico):

1. Contiene respuesta.
2. Contiene derivaciones transparentes.
3. Patron robotico generico.
4. Sintaxis anomala fuerte.
5. Longitud extrema.

## 3) Taxonomia profesional de tipos de pista

Taxonomia implementada en `crosswordClueStrategySelector.js`:

1. `direct_definition_elegant`
2. `indirect_definition`
3. `contextual_synonym`
4. `antonym_contrast`
5. `descriptive_periphrasis`
6. `cultural_reference_light`
7. `incomplete_idiom`
8. `frequent_collocation`
9. `situational_prompt`
10. `functional_use`
11. `metaphorical_image`
12. `register_marker`
13. `distinctive_trait`
14. `encyclopedic_light`
15. `morphosyntactic_hint`
16. `elliptical_hint`
17. `subtle_humor`
18. `literary_association`
19. `controlled_ambiguity`
20. `didactic_school`
21. `lexicographic_humanized`

Reglas de uso:

1. Facil: priorizar directa, funcional, situacional, didactica.
2. Medio: indirecta, perifrasis, sinonimo contextual, rasgo distintivo.
3. Dificil: ambiguedad controlada, elipsis, metafora, literaria.

Reglas de evitacion:

1. Evitar `elliptical_hint` en facil.
2. Evitar `incomplete_idiom` para adverbios.
3. Evitar `register_marker` si no hay soporte semantico.

## 4) Modelo lexico enriquecido (JS)

Estructura objetivo por entrada:

```js
{
  id: "es:ALGORITMO",
  source: "crossword_term_bank",
  language: "es",
  word: "ALGORITMO",
  lemma: "algoritmo",
  length: 9,
  pos: "noun",
  definition: "secuencia ordenada de pasos para resolver un problema",
  synonyms: ["procedimiento"],
  example: "En clase se estudio algoritmo con ejemplos.",
  difficulty: "hard",
  lexical: {
    frequencyBand: "medium_low",
    difficultyModel: { score: 68, band: "hard", factors: { ... } },
    polysemyHint: "possible_polysemy",
    rawClue: "..."
  },
  semantic: {
    coreConcept: "...",
    field: "technology",
    traits: ["noun", "technology"],
    culturalTags: ["school_knowledge"],
    anchor: "..."
  },
  morphology: {
    length: 9,
    prefix: "alg",
    suffix: "itmo",
    transparentVerbEnding: false,
    transparentAdverbEnding: false,
    transparentNounEnding: false
  },
  lexicalRelations: {
    synonyms: [...],
    antonyms: [],
    collocations: [...],
    examples: [...]
  },
  styleConstraints: {
    recommendedStrategies: [...],
    forbiddenStrategies: [...]
  },
  traps: {
    invalidFragments: [...],
    forbiddenStrategies: [...]
  }
}
```

## 5) Separacion palabra -> concepto -> estrategia -> pista

Pipeline aplicado:

1. `normalizeLegacyLexiconEntry`: limpia forma lexical.
2. `enrichNormalizedLexiconEntry`: construye representacion conceptual.
3. `selectClueStrategies`: decide tipo de pista segun dificultad + POS + contexto.
4. `generateTemplateCandidates`: produce borradores por estrategia.
5. `expandClueVariations`: crea reformulaciones y firmas sintacticas.
6. `evaluateClueQuality`: valida anti-spoiler + naturalidad + jugabilidad.
7. `generateClueForEntry`: escoge mejor candidata y regenera si falla.

## 6) Dificultad real (no solo longitud)

Variables usadas:

1. Frecuencia aproximada.
2. Abstraccion semantica.
3. Familiaridad cultural.
4. Transparencia morfologica.
5. Complejidad de estrategia.
6. Carga inferencial.
7. Ambiguedad controlada.

Bandas:

1. `easy` (<38)
2. `medium` (38-66)
3. `hard` (67+)

## 7) Generador mas humano (arquitectura hibrida)

Componentes implementados:

1. `crosswordLocaleProfiles`
2. `crosswordEditorialRules`
3. `crosswordLexiconNormalizer`
4. `crosswordLexiconEnricher`
5. `crosswordDifficultyScorer`
6. `crosswordClueStrategySelector`
7. `crosswordClueTemplateEngine`
8. `crosswordClueVariationEngine`
9. `crosswordClueQualityValidator`
10. `crosswordClueRegenerator`

Integracion:

1. `crosswordGenerator.js` mantiene API de tablero.
2. La generacion de pistas pasa por `generateClueForEntry`.
3. Se conserva determinismo por `seedKey`.

## 8) Linea editorial

Objetivo:

1. Culto accesible.
2. Ingenio ligero.
3. Frase corta.
4. Sin localismos opacos.
5. Sin tecnicismo innecesario.

Evitar:

1. Frialdad de diccionario literal.
2. Chiste excesivo.
3. Formula burocratica.
4. Traduccion literal entre idiomas.

## 9) Validadores automaticos

Detecta:

1. `contains_answer`
2. `contains_derivative_fragment:*`
3. `generic_pattern`
4. `awkward_syntax`
5. `extreme_length`
6. `semantic_vacuum`
7. `cold_dictionary_tone`
8. `low_diversity`
9. `high_repetition`

Umbrales:

1. Aceptada directa: score >= 74 y sin hard fail.
2. Regenerar: score < 74 o con hard fail.

## 10) Heuristicas nativas ES vs EN

Espanol:

1. Mejor tolerancia a perifrasis corta.
2. Frase hecha y registro pesan mas.
3. Morfologia aporta mucho (verbos -ar/-er/-ir, adverbios -mente).

Ingles:

1. Definicion breve suele sonar mas natural.
2. Colocaciones compactas tienen alto rendimiento.
3. Humor verbal mas seco y eliptico.

## 11) Limpieza total del banco (estrategia operativa)

Fase 1 (auditoria):

1. Ejecutar `scripts/audit_crossword_clues.mjs`.
2. Obtener razones de fallo y score por idioma/longitud.

Fase 2 (normalizacion):

1. Corregir mojibake.
2. Normalizar mayusculas y caracteres.
3. Deduplicar entradas.

Fase 3 (enriquecimiento):

1. POS, campo semantico, colocationes.
2. Dificultad lexical.
3. Recomendaciones/prohibiciones de estrategia.

Fase 4 (regeneracion):

1. Generar lote.
2. Validar scoring.
3. Regenerar malas.

Fase 5 (revision humana):

1. Muestreo por lotes.
2. Correccion editorial.
3. Reentrenar reglas heuristicas.

## 12) Pseudocodigo implementable

```js
for entry in CROSSWORD_TERM_BANK[locale]:
  normalized = normalizeLegacyLexiconEntry(entry, locale)
  enriched = enrichNormalizedLexiconEntry(normalized)
  strategyPool = selectClueStrategies({
    entry: enriched,
    locale,
    targetDifficulty: enriched.difficulty,
    seedKey,
    context
  })
  candidates = []
  for strategy in strategyPool:
    base = generateTemplateCandidates({ entry: enriched, strategyId: strategy.id, locale, seedKey })
    variants = expandClueVariations({ candidates: base, locale, seedKey })
    candidates.push(...variants.map(c => ({ clue: c, strategy })))
  scored = candidates.map(c => evaluateClueQuality({ clue: c.clue, answer: enriched.word, locale, difficulty }))
  best = chooseAcceptedOrBest(scored, context)
  if fails(best): regenerateFallback()
```

## 13) Politica de diversidad

Implementada con memoria en `createClueDiversityContext`:

1. Penaliza repetir estrategia en la misma partida.
2. Penaliza repetir firma sintactica.
3. Penaliza saturar la misma familia tematica.
4. Penaliza reutilizar misma pista para misma palabra (cache local de recientes).

## 14) Ejemplos comparativos (antes/despues)

1. Palabra: `ALGORITMO`
   - Mediocre: "Termino relacionado con programacion."
   - Facil: "Metodo ordenado para resolver un problema."
   - Media: "Secuencia de pasos que convierte reglas en resultado."
   - Dificil: "Receta logica que no se come, pero ejecuta."

2. Palabra: `DEMOCRACY`
   - Mediocre: "Word related to politics."
   - Facil: "System where citizens choose representation."
   - Media: "Rule legitimated by ballots, not inheritance."
   - Dificil: "Power spread across many hands, at least in theory."

3. Palabra: `RAPIDO`
   - Mediocre: "Palabra relacionada con velocidad."
   - Facil: "Que se mueve a gran velocidad."
   - Media: "Tarda poco en llegar o terminar."
   - Dificil: "Sin pausa ni rodeos, casi instantaneo."

4. Palabra: `NUTRITION`
   - Mediocre: "Term related to health."
   - Facil: "Process of taking and using nutrients."
   - Media: "What turns food into usable body fuel."
   - Dificil: "Biology between appetite and metabolism."

5. Palabra: `METAFORA`
   - Mediocre: "Termino relacionado con literatura."
   - Facil: "Figura que nombra una cosa con otra imagen."
   - Media: "Comparacion implicita sin usar 'como'."
   - Dificil: "Puente verbal entre dos mundos semanticos."

## 15) Jugabilidad real

Reglas aplicadas:

1. Clues cortas para lectura rapida.
2. Mezcla de pistas faciles y desafiantes en una misma rejilla.
3. Inferencia justa antes que oscuridad gratuita.
4. Progreso visible por feedback de palabra/celda.
5. Rechazo automatico de pistas opacas para su nivel.

## 16) Restricciones y prohibiciones ya codificadas

1. No definiciones roboticas de plantilla generica.
2. No respuesta incrustada.
3. No derivaciones triviales de la respuesta.
4. No pistas semanticamente vacias.
5. No longitud extrema.

## 17) Plan de migracion recomendado

Prioridad P0:

1. Ejecutar auditoria masiva y extraer baseline de calidad.
2. Regenerar pistas de longitudes mas usadas (5-8).
3. Validar con tests + muestreo manual.

Prioridad P1:

1. Enriquecer con sinonimos/colocaciones curadas por lotes.
2. Ajustar pesos de dificultad por telemetria real.

Prioridad P2:

1. Persistir historial por usuario para diversidad inter-partida.
2. Introducir asistencia IA opcional con guardrails del validador.

