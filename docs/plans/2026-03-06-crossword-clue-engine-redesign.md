# 2026-03-06 - Rediseno integral del motor de pistas de crucigrama (ES/EN)

## 0) Diagnostico del enfoque actual
El generador actual en `src/games/knowledge/crosswordGenerator.js` ya mejoro respecto a versiones anteriores, pero todavia tiene limites estructurales:

- El modelo lexico es minimo: `word`, `pos` inferido por sufijos, `definition`, `synonyms`, `difficulty` por longitud.
- La dificultad se estima casi solo por numero de letras.
- Hay pocos estilos de pista y varias frases siguen sonando a plantilla fija.
- No existe separacion formal entre palabra, sentido, concepto y realizacion textual.
- El control antispoiler solo bloquea coincidencia literal (`clueContainsWord`), no familia derivativa ni transparencia morfologica.
- No hay scoring robusto de naturalidad, jugabilidad, ambiguedad justa o riqueza retorica.
- No hay memoria editorial fuerte para evitar repeticion entre partidas de un usuario o globalmente.
- ES y EN comparten la misma logica base con variaciones superficiales; falta estrategia nativa por idioma.

Conclusion: no basta con "retocar templates". Hace falta una arquitectura de pista por capas, con datos lexicos enriquecidos, seleccion estrategica y validacion automatica fuerte.

## 1) Definicion operativa de "pista de calidad"
Una pista de calidad en crucigrama casual-inteligente debe cumplir a la vez:

- Claridad semantica: apunta a un concepto identificable, sin vaguedad hueca.
- Naturalidad idiomatica: suena escrita por una persona nativa.
- Jugabilidad: permite inferir la respuesta con esfuerzo razonable.
- Brevedad eficaz: pocas palabras, alta densidad informativa.
- Elegancia verbal: frase limpia, ritmo natural, sin tecnicismo innecesario.
- Variedad retorica real: no reciclar siempre el mismo molde sintactico.
- Cero spoiler lexico: no incluir solucion ni derivados triviales.
- Ajuste de dificultad: la inferencia requerida coincide con nivel asignado.
- Coherencia cultural: referencias esperables para el nivel y locale.
- Tono de crucigrama real: ingenio ligero, no definicion fria de diccionario.

### Rubrica tecnica (0-100)
Puntuar cada pista con componentes ponderados:

| Dimension | Peso | Criterio de aprobacion |
|---|---:|---|
| Precision semantica | 20 | Remite al sentido correcto, no a uno lateral |
| Naturalidad idiomatica | 15 | Flujo natural en ES/EN, sin traduccion literal |
| Jugabilidad/fairness | 15 | Inferencia justa sin adivinanza ciega |
| Concision | 10 | 5-14 palabras recomendadas |
| Elegancia y tono editorial | 10 | Sonido de crucigrama humano |
| No spoiler (exacto + derivativo) | 15 | 0 fugas lexicas |
| Ajuste a dificultad | 10 | Complejidad acorde a easy/medium/hard |
| Pertinencia cultural | 5 | Referencia accesible para el nivel |

### Clasificacion final
- `Correcta pero mediocre` (55-69): semanticamente valida, pero generica o robotica.
- `Util` (70-84): jugable y clara, con estilo correcto.
- `Excelente` (85-100): precisa, natural, elegante, memorable y justa.
- `Injusta o defectuosa` (<55 o hard-fail): ambigua de forma injusta, vacia o con spoiler.

## 2) Taxonomia profesional de tipos de pista
Taxonomia propuesta (20 tipos) con uso recomendado, limites y ejemplos.

### 1. Definicion directa elegante
- Usar: terminos muy conocidos o nucleares.
- Mejor para: sustantivos concretos, escolares, cientificos basicos.
- Evitar: palabras ultra frecuentes en nivel dificil.
- ES bueno: "Instrumento para medir el tiempo."
- ES malo: "Termino relacionado con reloj."
- EN bueno: "Device used to tell time."
- EN malo: "Word connected with clock."

### 2. Definicion indirecta
- Usar: cuando interesa un paso de inferencia adicional.
- Mejor para: abstractos de frecuencia media.
- Evitar: conceptos ya abstractos y raros en nivel dificil alto.
- ES bueno: "Idea clave al hablar de normas morales."
- ES malo: "Concepto general."
- EN bueno: "Core idea in moral discussions."
- EN malo: "General concept."

### 3. Sinonimo contextual
- Usar: sinonimo parcial dentro de una escena.
- Mejor para: verbos y adjetivos.
- Evitar: sinonimo exacto demasiado obvio en easy/medium.
- ES bueno: "En una reunion, intentar llegar a un acuerdo."
- ES malo: "Sinonimo de negociar."
- EN bueno: "In a meeting, trying to reach an agreement."
- EN malo: "Synonym of negotiate."

### 4. Antonimo o contraste conceptual
- Usar: cuando el contraste sea estable y conocido.
- Mejor para: adjetivos, adverbios, pares conceptuales.
- Evitar: contrastes debatibles o culturales.
- ES bueno: "Lo opuesto a temporal, en filosofia."
- ES malo: "Contrario de algo."
- EN bueno: "Opposite of temporary, in philosophy."
- EN malo: "Opposite of something."

### 5. Perifrasis descriptiva
- Usar: para evitar definicion de manual.
- Mejor para: sustantivos concretos y acciones.
- Evitar: perifrases demasiado largas.
- ES bueno: "Pieza fina que cose tela y puede pinchar."
- ES malo: "Objeto utilizado para diferentes tareas."
- EN bueno: "Thin piece used to sew cloth."
- EN malo: "Object used for many things."

### 6. Referencia cultural general
- Usar: cultura escolar/general compartida.
- Mejor para: historia, literatura, geografia, arte.
- Evitar: guiños locales oscuros en easy/medium.
- ES bueno: "Caballero de La Mancha."
- ES malo: "Personaje de un libro que algunos conocen."
- EN bueno: "Author of Hamlet."
- EN malo: "Writer linked to a famous play."

### 7. Frase hecha incompleta
- Usar: expresiones fijas muy frecuentes.
- Mejor para: verbos frecuentes y sustantivos comunes.
- Evitar: locuciones regionales o arcaicas.
- ES bueno: "A quien madruga, Dios le ___."
- ES malo: "Frase comun con hueco."
- EN bueno: "Better late than ___."
- EN malo: "Common phrase with a blank."

### 8. Colocacion frecuente
- Usar: parejas lexicales estables.
- Mejor para: sustantivos y verbos de uso alto.
- Evitar: colocaciones tecnicas no conocidas por nivel.
- ES bueno: "Tomar una __ importante."
- ES malo: "Palabra que combina con otra."
- EN bueno: "Make a final ___."
- EN malo: "Word that pairs with another."

### 9. Pista situacional
- Usar: mini escena concreta.
- Mejor para: verbos/adverbios.
- Evitar: escenas demasiado abiertas.
- ES bueno: "Lo haces antes de firmar un contrato."
- ES malo: "Accion de una situacion."
- EN bueno: "You do this before signing a contract."
- EN malo: "Action in a situation."

### 10. Funcion o uso
- Usar: objetos, herramientas, instituciones.
- Mejor para: sustantivos concretos.
- Evitar: funciones demasiado genericas.
- ES bueno: "Sirve para ampliar una imagen lejana."
- ES malo: "Tiene una funcion."
- EN bueno: "Used to magnify distant objects."
- EN malo: "It has a function."

### 11. Metaforica controlada
- Usar: nivel medio/dificil con control de ambiguedad.
- Mejor para: abstractos y terminos literarios.
- Evitar: easy o terminos tecnicos exactos.
- ES bueno: "Brujula moral en tiempos confusos."
- ES malo: "Palabra poetica."
- EN bueno: "Moral compass in uncertain times."
- EN malo: "Poetic word."

### 12. Registro linguistico
- Usar: diferencias formal/coloquial.
- Mejor para: sinonimos de uso diferencial.
- Evitar: registros demasiado marcados por region.
- ES bueno: "Version formal de 'curro'."
- ES malo: "Palabra de un registro."
- EN bueno: "Formal equivalent of 'kid'."
- EN malo: "Word from a register."

### 13. Rasgo distintivo
- Usar: una propiedad unica del concepto.
- Mejor para: ciencia, geografia, objetos.
- Evitar: rasgos no exclusivos.
- ES bueno: "Gas noble con simbolo Ne."
- ES malo: "Elemento quimico."
- EN bueno: "Planet known for its rings."
- EN malo: "A planet."

### 14. Enciclopedica ligera
- Usar: dato factual de cultura general.
- Mejor para: nombres propios muy conocidos.
- Evitar: trivia de nicho.
- ES bueno: "Rio que pasa por Paris."
- ES malo: "Rio famoso."
- EN bueno: "Capital city of Japan."
- EN malo: "Famous Asian city."

### 15. Morfosintactica
- Usar: cuando la categoria gramatical aporta juego.
- Mejor para: adverbios, tiempos verbales, pronombres.
- Evitar: dar la respuesta por morfologia obvia en easy.
- ES bueno: "Adverbio de cantidad minima."
- ES malo: "Adverbio terminado en -mente."
- EN bueno: "Past tense of 'seek'."
- EN malo: "Verb ending in -ed."

### 16. Elipsis
- Usar: pistas cortas de alto ritmo.
- Mejor para: palabras frecuentes.
- Evitar: palabras raras con poca informacion.
- ES bueno: "Sin luz, sin __."
- ES malo: "Frase cortada."
- EN bueno: "Now or ___."
- EN malo: "Cut phrase."

### 17. Humoristica sutil
- Usar: baja frecuencia para aliviar fatiga.
- Mejor para: palabras comunes, no tecnicas.
- Evitar: chiste interno o sarcasmo oscuro.
- ES bueno: "Si no estudias, en el examen te visita."
- ES malo: "Pista graciosa."
- EN bueno: "What visits you before an exam if you never studied."
- EN malo: "Funny clue."

### 18. Asociacion literaria
- Usar: autores/obras canonicas.
- Mejor para: cultura media/alta.
- Evitar: referencias de nicho.
- ES bueno: "Creador de 'Cien anos de soledad'."
- ES malo: "Escritor latino famoso."
- EN bueno: "Poet behind 'The Raven'."
- EN malo: "Famous old poet."

### 19. Ambiguedad controlada
- Usar: nivel dificil, con cruces suficientes.
- Mejor para: polisemicos comunes.
- Evitar: cuando varias soluciones compiten igual.
- ES bueno: "Puede ser banco o entidad."
- ES malo: "Palabra ambigua."
- EN bueno: "Can mean a river edge or a financial institution."
- EN malo: "Ambiguous word."

### 20. Definidor tipo diccionario humanizado
- Usar: como fallback editorial limpio.
- Mejor para: cobertura completa de banco.
- Evitar: tono frio de glosario.
- ES bueno: "Norma aceptada por una comunidad."
- ES malo: "Regla: precepto obligatorio."
- EN bueno: "Rule accepted by a community."
- EN malo: "Rule: mandatory precept."

## 3) Teoria linguistica aplicada al banco lexico
Cada entrada debe modelar no solo "palabra+clue", sino sentidos y contexto de pista.

### Modelo de datos enriquecido (JavaScript)
```js
export const lexiconEntryExample = {
  id: "es:algoritmo:noun:1",
  lemma: "algoritmo",
  locale: "es",
  orthography: {
    display: "ALGORITMO",
    normalized: "ALGORITMO",
    ascii: "ALGORITMO"
  },
  pos: "noun",
  morphology: {
    gender: "m",
    number: "singular",
    root: "algoritm",
    derivationalFamily: ["algoritmico", "algoritmica"]
  },
  frequency: {
    zipf: 4.2,
    band: "medium"
  },
  baseDifficulty: 58,
  polysemy: {
    senseCount: 1,
    ambiguityRisk: 0.18
  },
  senses: [
    {
      senseId: "1",
      gloss: "conjunto finito de pasos para resolver un problema",
      semanticFeatures: ["procedimiento", "orden", "resolucion"],
      domains: ["informatica", "matematicas"],
      register: "neutral",
      culturalScope: "global",
      synonyms: ["procedimiento"],
      antonyms: [],
      collocations: ["disenar algoritmo", "algoritmo eficiente"],
      usageExamples: [
        "El algoritmo ordena los datos en segundos."
      ],
      culturalAssociations: ["programacion", "logica"],
      clueTypesRecommended: [
        "definicion_directa_elegante",
        "perifrasis_descriptiva",
        "funcion_o_uso"
      ],
      clueTypesForbidden: [
        "frase_hecha_incompleta",
        "humoristica_sutil"
      ],
      styleRestrictions: {
        avoidOverTechnical: true,
        maxTokens: 14
      },
      invalidTraps: [
        "no usar 'algoritmico' en pista",
        "no mencionar 'algo-'"
      ]
    }
  ],
  qaHints: {
    bannedFragments: ["algoritm", "algo ritm"],
    approvedGoldClues: {
      easy: ["Secuencia de pasos para resolver un problema."],
      medium: ["Receta logica que guia un programa."],
      hard: ["Metodo finito que transforma entrada en salida."]
    }
  },
  provenance: {
    source: "curated+lexical_resources",
    lastUpdatedAt: "2026-03-06"
  }
};
```

Campos minimos obligatorios por entrada:
- `lemma`, `locale`, `pos`, `senses[].gloss`, `frequency`, `baseDifficulty`, `collocations`, `clueTypesRecommended`, `clueTypesForbidden`, `qaHints.bannedFragments`.

## 4) Separar palabra, concepto y pista (pipeline semantico)
Pipeline formal:

1. `palabra` -> normalizacion ortografica y morfologica.
2. `sentido` -> seleccion de sense segun contexto de partida, dominio y dificultad.
3. `representacion semantica` -> features + relaciones (sinonimia parcial, contraste, uso).
4. `estrategias candidatas` -> top-N tipos de pista compatibles.
5. `realizacion textual` -> generar varias pistas candidatas.
6. `validacion` -> hard-fail + score.
7. `seleccion final` -> mejor candidata bajo diversidad y fairness.

### Reglas antiespoiler y anticircularidad
- Bloqueo exacto: no contener la solucion.
- Bloqueo derivativo: no contener raiz/stem comun (`snowball`/reglas manuales ES/EN).
- Bloqueo de distancia: rechazar si `levenshtein <= 2` en palabras de 5-7 letras o ratio trigram > 0.62.
- Bloqueo de familia: rechazar si aparece cualquier `derivationalFamily`.
- Bloqueo circular: si pista depende de un sinonimo tautologico unico o de la misma glosa casi literal.

### Control de obviedad
- `easy`: alta transparencia conceptual, baja ambiguedad.
- `medium`: una capa de inferencia.
- `hard`: dos capas de inferencia o ambiguedad controlada con cruces suficientes.

## 5) Rediseno de dificultad (no solo longitud)
Score compuesto (0-100):

```txt
D = 100 * (
  0.22 * rarity +
  0.14 * abstraction +
  0.10 * culturalDistance +
  0.08 * lengthFactor +
  0.10 * morphologyOpacity +
  0.16 * clueStrategyComplexity +
  0.12 * inferenceSteps +
  0.08 * controlledAmbiguity
)
```

Niveles:
- `easy`: 0-39
- `medium`: 40-69
- `hard`: 70-100

### Ejemplo misma solucion, 3 niveles (ES)
Palabra: `ALGORITMO`

- Facil: "Secuencia de pasos para resolver un problema."
- Media: "Receta logica que sigue un programa."
- Dificil: "Metodo finito que convierte entrada en salida."

Justificacion:
- Facil usa definicion directa muy reconocible.
- Media exige transferir "receta" a logica computacional.
- Dificil pide abstraccion formal sin palabra escolar obvia.

### Ejemplo misma solucion, 3 niveles (EN)
Word: `SATELLITE`

- Easy: "Object that orbits a planet."
- Medium: "Companion body moving around Earth or another world."
- Hard: "Orbital traveler bound to a larger gravitational host."

## 6) Generador hibrido mas humano (menos plantillero)
Arquitectura de generacion por capas:

- Reglas linguisticas fuertes para seguridad semantica y antispoiler.
- Templates ricos con slots semanticos, no cadenas fijas repetitivas.
- Motor de variacion sintactica controlada (orden, voz, foco).
- Selector de estilo condicionado por `locale + pos + sense + difficulty`.
- Penalizacion activa de repeticion estructural.
- Memoria corta por partida y memoria larga por usuario.
- Opcion IA asistida solo como rewriter final con guardrails (no generador ciego).

### Como sonar "humano multiple" con linea editorial unica
- Definir 3 voces internas de redaccion: `sobria`, `ingeniosa`, `didactica-ligera`.
- Cada voz tiene patrones permitidos, longitud y densidad metaforica.
- El selector de voz rota segun historial para evitar monotonia.
- Todas las voces comparten restricciones de claridad y fairness.

## 7) Linea editorial de pistas
Linea editorial recomendada:

- Tono: culto accesible.
- Ritmo: breve, directo, sin frialdad de diccionario.
- Ingenio: ligero y funcional, no chiste protagonista.
- Cobertura cultural: general, sin localismos excesivos.
- Precision: primero verdad semantica, luego brillo literario.

Tonos a evitar:
- Escolar excesivo ("definase...", "se denomina...").
- Plantillero robotico ("termino relacionado con...").
- Humor forzado constante.
- Traduccion literal EN<->ES.

## 8) Pipeline de validacion automatica de calidad
Validacion en dos capas: `hard-fail` y `score`.

### Hard-fail (rechazo inmediato)
- Contiene solucion exacta.
- Contiene raiz o derivado prohibido.
- Longitud fuera de limite editorial (ej. > 95 chars o > 16 tokens).
- Vacio semantico ("concepto general", "palabra de conocimiento").
- Sintaxis rota.
- Ambiguedad injusta detectada (varias respuestas de alta probabilidad sin cruces suficientes).

### Soft scoring (0-100)
- Naturalidad (LM/perplexity + reglas locales).
- Densidad semantica (tokens utiles / tokens totales).
- Originalidad estructural (distancia a pistas recientes).
- Ajuste de dificultad.
- Pertinencia cultural.
- Estilo editorial.

Umbrales:
- `>= 85`: aceptar directo.
- `75-84`: aceptar si no hay mejor candidata.
- `< 75`: regenerar.
- Maximo 5 rondas de regeneracion por palabra.

## 9) Heuristicas especificas para espanol e ingles
No traducir un sistema; crear dos perfiles hermanos.

### Espanol (nativo)
- Mayor variacion morfologica: controlar genero/numero y derivados transparentes.
- Buen rendimiento de perifrasis y definicion elegante breve.
- Frase hecha tiene alto valor ludico si es panhispanica.
- Humor verbal funciona mejor por contraste semantico suave.
- Riesgo: caer en "entrada lexical vinculada a..." (prohibido).

### Ingles (nativo)
- Mejor tolerancia a pistas cortas nominales.
- Mayor productividad de compuestos y phrasal behavior.
- Colocations y idioms cortos son muy efectivos.
- Humor suele ser mas seco e ironico: usar minimo en easy.
- Riesgo: "dictionary voice" demasiado fria; humanizar con contexto.

### Diferencias clave de diseno
- ES: mas cuidado en derivacion visible (`-cion`, `-mente`, `-dad`).
- EN: mas cuidado en prefijos/sufijos transparentes (`un-`, `-ness`, `-ly`) y compuestos.
- ES favorece microescena; EN favorece enunciado nominal compacto.

## 10) Estrategia de limpieza total del banco actual
Proceso en 5 fases.

### Fase 1: auditoria
- Detectar repeticion de patrones por firma sintactica.
- Detectar pistas vacias/genericas.
- Detectar fugas de solucion y casi-spoilers derivativos.
- Detectar incoherencias de idioma/registro.
- Salida: informe de deuda por severidad.

### Fase 2: normalizacion lexica
- Corregir mojibake/acentos/case.
- Canonizar POS.
- Resolver duplicados por lemma+locale+sense.
- Limpiar glosas heredadas pobres.

### Fase 3: enriquecimiento semantico
- Anadir dominios, frecuencia, dificultad base, asociaciones culturales.
- Curar colocaciones y ejemplos.
- Etiquetar tipos de pista recomendados/prohibidos.

### Fase 4: regeneracion controlada
- Generar N candidatas por entrada.
- Validar y puntuar.
- Reintentar con estrategia alternativa si falla.

### Fase 5: revision humana/semi-automatica
- Muestreo estratificado por idioma, POS y dificultad.
- Correccion editorial puntual.
- Retroalimentar reglas y blacklist.

## 11) Arquitectura de software implementable
Modulos propuestos y flujo:

| Modulo | Responsabilidad | Entrada | Salida |
|---|---|---|---|
| `lexiconNormalizer` | Limpieza y canonizacion de entradas | raw bank | normalized entries |
| `lexiconEnricher` | Completar metadatos semanticos | normalized entries | enriched entries |
| `crosswordLocaleProfiles` | Reglas ES/EN y tono editorial | locale | locale profile |
| `clueDifficultyScorer` | Calcular dificultad compuesta | entry + sense | easy/medium/hard + score |
| `clueStrategySelector` | Elegir tipos de pista y voz | entry + context + history | strategy plan |
| `clueTemplateEngine` | Generar candidatas base | strategy plan + lexicon | candidate clues |
| `clueVariationEngine` | Reformulacion sintactica/retorica | candidate clues | varied candidates |
| `clueQualityValidator` | Hard-fails + score quality | candidate + answer + history | validation report |
| `clueRegenerator` | Reintento con estrategias alternativas | failed batch + report | next strategy plan |
| `crosswordEditorialRules` | Reglas de estilo globales | locale + difficulty | constraints |
| `clueMemoryStore` | Diversidad intra/entre partidas | user/grid/global ids | usage signals |

Flujo de datos:
`raw bank -> normalizer -> enricher -> strategy selector -> template engine -> variation engine -> validator -> (accept or regenerator loop) -> final clue store`.

## 12) Pseudocodigo / codigo orientativo (JavaScript)
```js
const MAX_REGEN = 5;

export function enrichLexiconEntry(raw, localeProfile) {
  const normalized = lexiconNormalizer.normalize(raw, localeProfile);
  return lexiconEnricher.enrich(normalized, localeProfile);
}

export function selectClueStrategy({ entry, sense, difficulty, context, memory, seed }) {
  return clueStrategySelector.select({
    entry,
    sense,
    difficulty,
    context,
    memory,
    seed
  });
}

export function generateCandidates({ entry, sense, strategyPlan, localeProfile, seed }) {
  const base = clueTemplateEngine.generate({
    entry,
    sense,
    strategyPlan,
    localeProfile,
    seed
  });
  return clueVariationEngine.rewriteBatch({
    candidates: base,
    localeProfile,
    strategyPlan,
    seed
  });
}

export function validateAndScore({ candidate, answer, entry, difficulty, localeProfile, memory }) {
  const report = clueQualityValidator.validate({
    candidate,
    answer,
    entry,
    difficulty,
    localeProfile,
    memory
  });

  if (report.hardFail.length) {
    return { accepted: false, score: 0, report };
  }

  const score = clueQualityValidator.score(report);
  return { accepted: score >= 75, score, report };
}

export function generateBestClue(request) {
  const {
    answer,
    locale,
    desiredDifficulty,
    seed,
    context,
    memory
  } = request;

  const localeProfile = crosswordLocaleProfiles.get(locale);
  const entry = enrichLexiconEntry(request.lexiconEntry, localeProfile);
  const sense = senseResolver.pick(entry, context, desiredDifficulty);
  const difficulty = clueDifficultyScorer.resolve(entry, sense, desiredDifficulty);

  let best = null;
  let plan = selectClueStrategy({
    entry,
    sense,
    difficulty,
    context,
    memory,
    seed
  });

  for (let attempt = 0; attempt < MAX_REGEN; attempt += 1) {
    const candidates = generateCandidates({
      entry,
      sense,
      strategyPlan: plan,
      localeProfile,
      seed: `${seed}:${attempt}`
    });

    for (const candidate of candidates) {
      const outcome = validateAndScore({
        candidate,
        answer,
        entry,
        difficulty,
        localeProfile,
        memory
      });

      if (!best || outcome.score > best.score) {
        best = { ...outcome, candidate };
      }
      if (outcome.accepted && outcome.score >= 85) {
        clueMemoryStore.register(memory, candidate, plan);
        return candidate;
      }
    }

    plan = clueRegenerator.nextPlan({
      currentPlan: plan,
      bestReport: best?.report,
      attempt,
      localeProfile
    });
  }

  if (!best) {
    throw new Error("Unable to generate clue candidate.");
  }

  clueMemoryStore.register(memory, best.candidate, plan);
  return best.candidate;
}
```

## 13) Politica de diversidad y no repeticion
Diversidad en 3 niveles.

### A) Dentro de una partida
- No repetir mismo tipo de pista en mas del 35% de entradas.
- No repetir misma firma sintactica en pistas consecutivas.
- Limitar familias tematicas dominantes por rejilla (ej. no 70% ciencia).

### B) Entre partidas de un usuario
- Historial por usuario de ultimas 200 pistas (hash de estructura + concepto).
- Penalizar repetir misma pista para misma palabra durante ventana de 30 dias.
- Rotar voz editorial y tipo de pista por historial personal.

### C) Global banco
- Indice global de uso por pista y por plantilla.
- Decaimiento temporal para permitir reuso controlado.
- Al detectar "popularidad excesiva", subir coste de seleccion en ranking.

## 14) Ejemplos comparativos (antes/despues)

### Caso 1 - Sustantivo concreto (ES) - `AGUJA`
- Pista mediocre actual: "Entrada lexical vinculada a alfiler."
- Por que es mediocre: formula robotica y sinonimia plana.
- Nueva facil: "Pieza fina que sirve para coser."
- Nueva media: "Pequena punzante que atraviesa tela."
- Nueva dificil: "Aliada minima de costura y precision."
- Explicacion: pasa de etiqueta metalinguistica a funcion concreta + imagen mental.

### Caso 2 - Sustantivo abstracto (ES) - `ETICA`
- Pista mediocre actual: "Termino asociado a moral."
- Por que es mediocre: demasiado directo y frio.
- Nueva facil: "Rama que estudia lo correcto y lo incorrecto."
- Nueva media: "Marco de principios para decidir bien."
- Nueva dificil: "Brujula normativa de la conducta."
- Explicacion: escala de abstraccion controlada por nivel.

### Caso 3 - Verbo (ES) - `NEGOCIAR`
- Pista mediocre actual: "Palabra emparentada semanticamente con acordar."
- Por que es mediocre: plantilla mecanica.
- Nueva facil: "Intentar llegar a un acuerdo."
- Nueva media: "Buscar puntos en comun entre partes."
- Nueva dificil: "Ceder y pedir hasta cerrar trato."
- Explicacion: escena pragmatica real mejora jugabilidad.

### Caso 4 - Adjetivo (ES) - `FRAGIL`
- Pista mediocre actual: "Adjetivo relacionado con debil."
- Por que es mediocre: sinonimo escolar plano.
- Nueva facil: "Que se rompe con facilidad."
- Nueva media: "Delicado ante golpes o presion."
- Nueva dificil: "Fuerte en apariencia, breve en resistencia."
- Explicacion: precision fisica + giro retorico en dificil.

### Caso 5 - Adverbio (ES) - `APENAS`
- Pista mediocre actual: "Adverbio de cantidad."
- Por que es mediocre: gramatical pero poco jugable.
- Nueva facil: "Casi nada."
- Nueva media: "En grado minimo."
- Nueva dificil: "Presencia al borde de desaparecer."
- Explicacion: compresion extrema en facil, abstraccion en dificil.

### Caso 6 - Cultural (ES) - `QUIJOTE`
- Pista mediocre actual: "Personaje de novela."
- Por que es mediocre: demasiado abierta.
- Nueva facil: "Caballero de La Mancha."
- Nueva media: "Hidalgo creado por Cervantes."
- Nueva dificil: "Idealista que pelea con gigantes imaginados."
- Explicacion: referencia canonica con distintos grados de indirecta.

### Caso 7 - Escolar (ES) - `ECUACION`
- Pista mediocre actual: "Termino de matematicas."
- Por que es mediocre: categoria demasiado amplia.
- Nueva facil: "Igualdad con una o mas incognitas."
- Nueva media: "Balance simbolico que se resuelve."
- Nueva dificil: "Donde lo desconocido pide despeje."
- Explicacion: eleva inferencia sin perder justicia.

### Caso 8 - Cientifico accesible (ES) - `ATOMO`
- Pista mediocre actual: "Parte de la materia."
- Por que es mediocre: frase vaga.
- Nueva facil: "Unidad basica de un elemento quimico."
- Nueva media: "Nucleo y electrones en version minima."
- Nueva dificil: "Escala donde la materia deja de verse."
- Explicacion: rasgo distintivo + imagineria.

### Caso 9 - Concrete noun (EN) - `BRIDGE`
- Poor clue: "Word related to connection."
- Why poor: generic and template-like.
- New easy: "Structure that crosses a river."
- New medium: "Link between two separated sides."
- New hard: "Span that defeats a gap."
- Linguistic note: function-first then metaphorical compression.

### Caso 10 - Abstract noun (EN) - `JUSTICE`
- Poor clue: "Concept linked to law."
- Why poor: broad and flat.
- New easy: "Fair treatment under rules."
- New medium: "Aim of a balanced court."
- New hard: "Equity pursued when power is unequal."
- Linguistic note: gradual abstraction with fairness anchor.

### Caso 11 - Verb (EN) - `COMPILE`
- Poor clue: "Word related to collect."
- Why poor: lexical relation only.
- New easy: "To gather into one set."
- New medium: "To transform source code into executable form."
- New hard: "Turn many pieces into one runnable result."
- Linguistic note: sense disambiguation by domain/difficulty.

### Caso 12 - Scientific accessible (EN) - `NEURON`
- Poor clue: "Science term."
- Why poor: no semantic precision.
- New easy: "Cell that transmits nerve signals."
- New medium: "Basic messenger of the nervous system."
- New hard: "Microscopic courier of thought and reflex."
- Linguistic note: moves from textbook to editorial voice.

## 15) Jugabilidad real del crucigrama
Metricas de experiencia recomendadas:

- Tiempo medio de lectura por pista: 1.1-2.3 s en easy/medium.
- Longitud objetivo: 5-11 palabras (max editorial 14).
- Mezcla por rejilla: 45% facil, 40% media, 15% dificil (adaptable por modo).
- Fatiga cognitiva: no encadenar 3 pistas dificiles de la misma area tematica.
- Sensacion de progreso: colocar anclas faciles en zonas de alta interseccion.
- Justicia: toda pista dificil debe ser resoluble por cruces si no por conocimiento directo.

## 16) Restricciones y prohibiciones explicitas
Bloquear siempre:

- Definiciones frias de diccionario sin humanizacion.
- Plantillas roboticas repetidas.
- Respuesta incrustada o casi incrustada.
- Formulas vacias tipo "termino relacionado con...".
- Pistas ambiguas injustas para el nivel.
- Pistas excesivamente largas.
- Localismos opacos sin etiqueta de dificultad/locale.
- Traducciones literales que suenan no nativas.

## 17) Plan de migracion priorizado (produccion)
Roadmap recomendado:

### Prioridad P0 (1-2 semanas)
- Introducir modelo lexico enriquecido minimo viable.
- Implementar `clueQualityValidator` con hard-fails fuertes.
- Sustituir templates genericos prohibidos.

### Prioridad P1 (2-4 semanas)
- Activar `clueStrategySelector` por dificultad compuesta.
- Implementar `clueVariationEngine` + `clueMemoryStore`.
- Lanzar perfiles nativos ES/EN.

### Prioridad P2 (4-6 semanas)
- Regenerar banco completo y ejecutar auditoria automatica.
- Muestreo humano por lotes y ajuste editorial.
- Congelar baseline de calidad y KPIs.

### KPIs de salida
- `hard-fail rate` post-generacion < 2%.
- `quality score >= 75` en > 95% de pistas.
- `excellent (>=85)` en > 40%.
- Repeticion exacta por usuario (30 dias) < 3%.
- Quejas de pista injusta en QA humana < 5%.

---
Este diseno permite pasar de un generador "template-driven" a un motor editorial-linguistico escalable, determinista por semilla, multilenguaje nativo y con control real de calidad para miles de palabras y partidas.
