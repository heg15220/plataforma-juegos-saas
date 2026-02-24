import React, { useCallback, useEffect, useMemo, useState } from "react";
import useGameRuntimeBridge from "../../utils/useGameRuntimeBridge";
import {
  KNOWLEDGE_ARCADE_MATCH_COUNT,
  getRandomKnowledgeMatchId,
  getRandomKnowledgeMatchIdExcept,
  resolveKnowledgeArcadeLocale
} from "./knowledgeArcadeUtils";

const MAX_ERRORS = 6;

const HANGMAN_ENTRIES = {
  es: {
    words: [
      { word: "ATOMO", clue: "Unidad minima de un elemento quimico." },
      { word: "CELULA", clue: "Base estructural de los seres vivos." },
      { word: "VOLCAN", clue: "Montana que expulsa lava y gases." },
      { word: "PIRAMIDE", clue: "Monumento de base ancha y lados triangulares." },
      { word: "BRUJULA", clue: "Instrumento para orientarse con el norte magnetico." },
      { word: "PLANETA", clue: "Cuerpo celeste que orbita una estrella." },
      { word: "GALAXIA", clue: "Conjunto enorme de estrellas y polvo cosmico." },
      { word: "ALGEBRA", clue: "Rama matematica que usa simbolos y ecuaciones." },
      { word: "VECTOR", clue: "Magnitud con direccion y sentido." },
      { word: "TEOREMA", clue: "Proposicion matematica demostrada." },
      { word: "CODIGO", clue: "Conjunto de instrucciones para un programa." },
      { word: "DATOS", clue: "Informacion procesable por un sistema." },
      { word: "ROBOT", clue: "Maquina programable que ejecuta tareas." },
      { word: "MEMORIA", clue: "Componente donde se almacenan datos temporalmente." },
      { word: "LOGICA", clue: "Disciplina que estudia razonamientos validos." },
      { word: "SILOGISMO", clue: "Argumento deductivo con dos premisas y una conclusion." },
      { word: "NOVELA", clue: "Obra narrativa extensa de ficcion." },
      { word: "POEMA", clue: "Composicion literaria en verso." },
      { word: "MUSEO", clue: "Lugar donde se exhiben colecciones artisticas o historicas." },
      { word: "PINTOR", clue: "Artista que crea obras con pintura." },
      { word: "BALON", clue: "Objeto esferico usado en varios deportes." },
      { word: "AJEDREZ", clue: "Juego de estrategia con tablero y piezas." },
      { word: "TENIS", clue: "Deporte de raqueta sobre pista." },
      { word: "VACUNA", clue: "Preparacion que estimula defensas del organismo." },
      { word: "PULSO", clue: "Latido arterial perceptible." },
      { word: "IDIOMA", clue: "Sistema de comunicacion propio de una comunidad." },
      { word: "VERBO", clue: "Palabra que expresa accion o estado." },
      { word: "FRASE", clue: "Conjunto breve de palabras con sentido." },
      { word: "MAPA", clue: "Representacion grafica de un territorio." },
      { word: "RELOJ", clue: "Instrumento para medir el tiempo." },
      { word: "ENERGIA", clue: "Capacidad para realizar trabajo." },
      { word: "NEURONA", clue: "Celula especializada del sistema nervioso." }
    ]
  },
  en: {
    words: [
      { word: "ATOM", clue: "Smallest unit of a chemical element." },
      { word: "CELL", clue: "Basic structural unit of living beings." },
      { word: "VOLCANO", clue: "Mountain that erupts lava and gases." },
      { word: "PYRAMID", clue: "Monument with triangular faces." },
      { word: "COMPASS", clue: "Tool used to find cardinal directions." },
      { word: "PLANET", clue: "Celestial body that orbits a star." },
      { word: "GALAXY", clue: "Huge system of stars, gas and dust." },
      { word: "ALGEBRA", clue: "Math branch that works with symbols and equations." },
      { word: "VECTOR", clue: "Quantity with magnitude and direction." },
      { word: "THEOREM", clue: "Statement proven by logical deduction." },
      { word: "CODE", clue: "Instructions written for software." },
      { word: "DATA", clue: "Information that can be processed." },
      { word: "ROBOT", clue: "Programmable machine that performs tasks." },
      { word: "MEMORY", clue: "Computer component that stores information." },
      { word: "LOGIC", clue: "Discipline that studies valid reasoning." },
      { word: "SYLLOGISM", clue: "Deductive argument with premises and conclusion." },
      { word: "NOVEL", clue: "Long fictional narrative in prose." },
      { word: "POEM", clue: "Literary composition written in verse." },
      { word: "MUSEUM", clue: "Place where art or historical collections are displayed." },
      { word: "PAINTER", clue: "Artist who creates works with paint." },
      { word: "BALL", clue: "Round object used in many sports." },
      { word: "CHESS", clue: "Strategy board game with pieces." },
      { word: "TENNIS", clue: "Racket sport played on a court." },
      { word: "VACCINE", clue: "Preparation that helps the immune system respond." },
      { word: "PULSE", clue: "Rhythmic beat felt in an artery." },
      { word: "LANGUAGE", clue: "Structured system used for communication." },
      { word: "VERB", clue: "Word class that expresses action or state." },
      { word: "PHRASE", clue: "Short group of words with meaning." },
      { word: "MAP", clue: "Graphic representation of an area." },
      { word: "CLOCK", clue: "Device used to measure time." },
      { word: "ENERGY", clue: "Capacity to perform work." },
      { word: "NEURON", clue: "Specialized nerve cell." }
    ]
  }
};

const COPY_BY_LOCALE = {
  es: {
    title: "Ahorcado Flash",
    subtitle: "Adivina la palabra antes de quedarte sin intentos.",
    restart: "Partida aleatoria",
    attempts: "Intentos",
    wrong: "Fallos",
    status: "Estado",
    statusPlaying: "En curso",
    statusWon: "Ganada",
    statusLost: "Perdida",
    clue: "Pista",
    noWrong: "Sin fallos",
    match: "Partida",
    startMessage: "Escribe letras para adivinar la palabra.",
    alreadyTried: (letter) => `La letra ${letter} ya fue probada.`,
    correct: (letter) => `Letra ${letter} correcta.`,
    solved: (word) => `Palabra resuelta: ${word}.`,
    wrongLetter: (letter) => `Letra ${letter} incorrecta.`,
    lost: (word) => `Sin intentos. Palabra: ${word}.`,
    currentWordLabel: (maskedWord) => `Palabra actual: ${maskedWord}`
  },
  en: {
    title: "Hangman Flash",
    subtitle: "Guess the word before you run out of attempts.",
    restart: "Random match",
    attempts: "Attempts",
    wrong: "Wrong",
    status: "Status",
    statusPlaying: "In progress",
    statusWon: "Won",
    statusLost: "Lost",
    clue: "Clue",
    noWrong: "No mistakes",
    match: "Match",
    startMessage: "Type letters to guess the word.",
    alreadyTried: (letter) => `Letter ${letter} was already tried.`,
    correct: (letter) => `Letter ${letter} is correct.`,
    solved: (word) => `Word solved: ${word}.`,
    wrongLetter: (letter) => `Letter ${letter} is wrong.`,
    lost: (word) => `No attempts left. Word: ${word}.`,
    currentWordLabel: (maskedWord) => `Current word: ${maskedWord}`
  }
};

const normalizeLetter = (value) => value.trim().toUpperCase().slice(0, 1);

const createGeneratedWord = (matchId, locale) => {
  const config = HANGMAN_ENTRIES[locale] ?? HANGMAN_ENTRIES.en;
  const safeId = Math.abs(Number(matchId) || 0);
  return config.words[safeId % config.words.length];
};

const createInitialState = (matchId, locale, copy) => {
  const generated = createGeneratedWord(matchId, locale);
  return {
    matchId,
    word: generated.word,
    clue: generated.clue,
    guessedLetters: [],
    wrongLetters: [],
    attemptsLeft: MAX_ERRORS,
    status: "playing",
    message: copy.startMessage
  };
};

function HangmanKnowledgeGame() {
  const locale = useMemo(resolveKnowledgeArcadeLocale, []);
  const copy = useMemo(() => COPY_BY_LOCALE[locale] ?? COPY_BY_LOCALE.en, [locale]);
  const [state, setState] = useState(() =>
    createInitialState(getRandomKnowledgeMatchId(), locale, copy)
  );

  const wrongCount = MAX_ERRORS - state.attemptsLeft;

  const guessLetter = useCallback((letter) => {
    setState((previous) => {
      if (previous.status !== "playing") {
        return previous;
      }
      const safeLetter = normalizeLetter(letter);
      if (!/^[A-Z]$/.test(safeLetter)) {
        return previous;
      }
      if (previous.guessedLetters.includes(safeLetter) || previous.wrongLetters.includes(safeLetter)) {
        return {
          ...previous,
          message: copy.alreadyTried(safeLetter)
        };
      }

      if (previous.word.includes(safeLetter)) {
        const nextGuessed = [...previous.guessedLetters, safeLetter];
        const solved = [...new Set(previous.word.split(""))].every((value) => nextGuessed.includes(value));
        return {
          ...previous,
          guessedLetters: nextGuessed,
          status: solved ? "won" : "playing",
          message: solved ? copy.solved(previous.word) : copy.correct(safeLetter)
        };
      }

      const nextAttempts = previous.attemptsLeft - 1;
      const lost = nextAttempts <= 0;
      return {
        ...previous,
        wrongLetters: [...previous.wrongLetters, safeLetter],
        attemptsLeft: Math.max(0, nextAttempts),
        status: lost ? "lost" : "playing",
        message: lost ? copy.lost(previous.word) : copy.wrongLetter(safeLetter)
      };
    });
  }, [copy]);

  const restart = useCallback(() => {
    setState((previous) =>
      createInitialState(getRandomKnowledgeMatchIdExcept(previous.matchId), locale, copy)
    );
  }, [copy, locale]);

  useEffect(() => {
    const onKeyDown = (event) => {
      const key = event.key;
      if (/^[a-z]$/i.test(key)) {
        guessLetter(key);
        return;
      }
      if (key === "Enter" && state.status !== "playing") {
        restart();
        return;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [guessLetter, restart, state.status]);

  const maskedWord = useMemo(
    () =>
      state.word
        .split("")
        .map((letter) => (state.guessedLetters.includes(letter) ? letter : "_"))
        .join(" "),
    [state.guessedLetters, state.word]
  );

  const maskedTokens = useMemo(
    () =>
      state.word.split("").map((letter) => ({
        letter,
        revealed: state.guessedLetters.includes(letter)
      })),
    [state.guessedLetters, state.word]
  );

  const usedLetters = useMemo(
    () => new Set([...state.guessedLetters, ...state.wrongLetters]),
    [state.guessedLetters, state.wrongLetters]
  );

  const statusLabel = state.status === "won"
    ? copy.statusWon
    : state.status === "lost"
      ? copy.statusLost
      : copy.statusPlaying;

  const payloadBuilder = useCallback((snapshot) => ({
    mode: "knowledge-arcade",
    variant: "ahorcado",
    coordinates: "ui_linear",
    locale,
    match: {
      current: snapshot.matchId + 1,
      total: KNOWLEDGE_ARCADE_MATCH_COUNT
    },
    status: snapshot.status,
    attemptsLeft: snapshot.attemptsLeft,
    guessedLetters: snapshot.guessedLetters,
    wrongLetters: snapshot.wrongLetters,
    clue: snapshot.clue,
    maskedWord: snapshot.word
      .split("")
      .map((letter) => (snapshot.guessedLetters.includes(letter) ? letter : "_"))
      .join(""),
    message: snapshot.message
  }), [locale]);

  const advanceTime = useCallback(() => undefined, []);
  useGameRuntimeBridge(state, payloadBuilder, advanceTime);

  return (
    <div className="mini-game knowledge-game knowledge-arcade-game knowledge-ahorcado">
      <div className="mini-head">
        <div>
          <h4>{copy.title}</h4>
          <p>{copy.subtitle}</p>
        </div>
        <button type="button" onClick={restart}>{copy.restart}</button>
      </div>

      <section className="knowledge-mode-shell">
        <div className="knowledge-status-row">
          <span>{copy.match}: {state.matchId + 1}/{KNOWLEDGE_ARCADE_MATCH_COUNT}</span>
          <span>{copy.attempts}: {state.attemptsLeft}</span>
          <span>{copy.wrong}: {state.wrongLetters.join(" ") || "-"}</span>
          <span>{copy.status}: {statusLabel}</span>
        </div>

        <div className="hangman-stage">
          <div className="hangman-gallows" aria-hidden="true">
            <span className="gallows-base" />
            <span className="gallows-post" />
            <span className="gallows-arm" />
            <span className="gallows-rope" />

            <span className={`hangman-draw head ${wrongCount >= 1 ? "active" : ""}`.trim()} />
            <span className={`hangman-draw torso ${wrongCount >= 2 ? "active" : ""}`.trim()} />
            <span className={`hangman-draw arm-left ${wrongCount >= 3 ? "active" : ""}`.trim()} />
            <span className={`hangman-draw arm-right ${wrongCount >= 4 ? "active" : ""}`.trim()} />
            <span className={`hangman-draw leg-left ${wrongCount >= 5 ? "active" : ""}`.trim()} />
            <span className={`hangman-draw leg-right ${wrongCount >= 6 ? "active" : ""}`.trim()} />
          </div>

          <ol className="hangman-fails" aria-label={copy.wrong}>
            {state.wrongLetters.map((letter) => (
              <li key={letter}>{letter}</li>
            ))}
            {!state.wrongLetters.length ? <li className="placeholder">{copy.noWrong}</li> : null}
          </ol>
        </div>

        <p className="hangman-word" aria-label={copy.currentWordLabel(maskedWord)}>
          {maskedTokens.map((token, index) => (
            <span key={`${token.letter}-${index}`} className={token.revealed ? "revealed" : "hidden"}>
              {token.revealed ? token.letter : "_"}
            </span>
          ))}
        </p>
        <p className="hangman-clue">{copy.clue}: {state.clue}</p>

        <div className="hangman-keyboard">
          {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letter) => (
            <button
              key={letter}
              type="button"
              disabled={usedLetters.has(letter) || state.status !== "playing"}
              onClick={() => guessLetter(letter)}
            >
              {letter}
            </button>
          ))}
        </div>
      </section>

      <p className="game-message">{state.message}</p>
    </div>
  );
}

export default HangmanKnowledgeGame;
