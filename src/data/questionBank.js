const shuffleArray = (items) => {
  const cloned = [...items];
  for (let index = cloned.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [cloned[index], cloned[swapIndex]] = [cloned[swapIndex], cloned[index]];
  }
  return cloned;
};

const pickDistractors = (values, index, count = 3) => {
  const distractors = [];
  let cursor = 1;

  while (distractors.length < count) {
    const candidate = values[(index + cursor * 7) % values.length];
    if (!distractors.includes(candidate) && candidate !== values[index]) {
      distractors.push(candidate);
    }
    cursor += 1;
  }

  return distractors;
};

const buildQuestion = ({
  prompt,
  correct,
  distractors,
  explanation,
  topic = "General",
  difficulty = "Media"
}) => {
  const optionsPool = [String(correct), ...distractors.map((item) => String(item))];
  const uniqueOptions = [];

  for (const option of optionsPool) {
    if (!uniqueOptions.includes(option)) {
      uniqueOptions.push(option);
    }
    if (uniqueOptions.length === 4) {
      break;
    }
  }

  while (uniqueOptions.length < 4) {
    uniqueOptions.push(`Opcion ${uniqueOptions.length + 1}`);
  }

  const options = shuffleArray(uniqueOptions);

  return {
    prompt,
    options,
    answer: options.indexOf(String(correct)),
    explanation,
    topic,
    difficulty
  };
};

const coreQuestions = [
  buildQuestion({
    prompt: "Que planeta es conocido como el planeta rojo?",
    correct: "Marte",
    distractors: ["Jupiter", "Venus", "Mercurio"],
    explanation: "El color rojizo de Marte procede de oxidos de hierro.",
    topic: "Ciencia",
    difficulty: "Baja"
  }),
  buildQuestion({
    prompt: "Cual es la capital de Japon?",
    correct: "Tokio",
    distractors: ["Kioto", "Osaka", "Sapporo"],
    explanation: "Tokio es la capital politica y economica de Japon.",
    topic: "Geografia",
    difficulty: "Baja"
  }),
  buildQuestion({
    prompt: "Que lenguaje se ejecuta directamente en el navegador junto con HTML y CSS?",
    correct: "JavaScript",
    distractors: ["Python", "C#", "Rust"],
    explanation: "JavaScript es el lenguaje nativo de la capa de comportamiento web.",
    topic: "Tecnologia",
    difficulty: "Baja"
  }),
  buildQuestion({
    prompt: "Que estructura de datos sigue el principio LIFO?",
    correct: "Pila",
    distractors: ["Cola", "Arbol", "Heap"],
    explanation: "LIFO significa Last In First Out, propio de una pila.",
    topic: "Tecnologia",
    difficulty: "Media"
  }),
  buildQuestion({
    prompt: "Quien pinto La noche estrellada?",
    correct: "Vincent van Gogh",
    distractors: ["Claude Monet", "Pablo Picasso", "Salvador Dali"],
    explanation: "La obra fue creada por Vincent van Gogh en 1889.",
    topic: "Arte",
    difficulty: "Baja"
  }),
  buildQuestion({
    prompt: "Cual es el oceano mas grande de la Tierra?",
    correct: "Pacifico",
    distractors: ["Atlantico", "Indico", "Artico"],
    explanation: "El Pacifico es el oceano de mayor extension.",
    topic: "Geografia",
    difficulty: "Baja"
  }),
  buildQuestion({
    prompt: "Cual es la formula quimica del agua?",
    correct: "H2O",
    distractors: ["CO2", "O2", "NaCl"],
    explanation: "Una molecula de agua combina dos atomos de hidrogeno y uno de oxigeno.",
    topic: "Ciencia",
    difficulty: "Baja"
  }),
  buildQuestion({
    prompt: "Que cientifica descubrio el radio y el polonio?",
    correct: "Marie Curie",
    distractors: ["Ada Lovelace", "Rosalind Franklin", "Grace Hopper"],
    explanation: "Marie Curie fue pionera en el estudio de la radiactividad.",
    topic: "Historia",
    difficulty: "Media"
  }),
  buildQuestion({
    prompt: "En que anio llego el ser humano a la Luna por primera vez?",
    correct: "1969",
    distractors: ["1965", "1971", "1959"],
    explanation: "La mision Apollo 11 alunizo en 1969.",
    topic: "Historia",
    difficulty: "Media"
  }),
  buildQuestion({
    prompt: "Que organo bombea la sangre en el cuerpo humano?",
    correct: "Corazon",
    distractors: ["Higado", "Pulmon", "Rinon"],
    explanation: "El corazon impulsa la sangre por todo el sistema circulatorio.",
    topic: "Ciencia",
    difficulty: "Baja"
  }),
  buildQuestion({
    prompt: "Que instrumento mide la temperatura?",
    correct: "Termometro",
    distractors: ["Barometro", "Anemometro", "Sismografo"],
    explanation: "El termometro se usa para medir temperatura.",
    topic: "Ciencia",
    difficulty: "Baja"
  }),
  buildQuestion({
    prompt: "Cuantos bits tiene un byte?",
    correct: "8",
    distractors: ["4", "16", "32"],
    explanation: "Por convencion, un byte esta compuesto por 8 bits.",
    topic: "Tecnologia",
    difficulty: "Baja"
  }),
  buildQuestion({
    prompt: "Que numero binario representa el decimal 10?",
    correct: "1010",
    distractors: ["1001", "1100", "1110"],
    explanation: "En base dos, 1010 equivale a 10 en decimal.",
    topic: "Matematicas",
    difficulty: "Media"
  }),
  buildQuestion({
    prompt: "Que continente tiene mas paises soberanos?",
    correct: "Africa",
    distractors: ["Europa", "Asia", "America"],
    explanation: "Africa es el continente con mayor numero de estados reconocidos.",
    topic: "Geografia",
    difficulty: "Media"
  }),
  buildQuestion({
    prompt: "Que deporte se juega en Roland Garros?",
    correct: "Tenis",
    distractors: ["Baloncesto", "Futbol", "Hockey"],
    explanation: "Roland Garros es uno de los cuatro torneos Grand Slam de tenis.",
    topic: "Deporte",
    difficulty: "Baja"
  }),
  buildQuestion({
    prompt: "Que escritor creo Don Quijote de la Mancha?",
    correct: "Miguel de Cervantes",
    distractors: ["Lope de Vega", "Federico Garcia Lorca", "Benito Perez Galdos"],
    explanation: "Don Quijote fue escrito por Miguel de Cervantes.",
    topic: "Literatura",
    difficulty: "Media"
  }),
  buildQuestion({
    prompt: "Que fenomeno produce la separacion de colores en un prisma?",
    correct: "Dispersion",
    distractors: ["Reflexion", "Difraccion", "Conduccion"],
    explanation: "La dispersion separa la luz en longitudes de onda.",
    topic: "Ciencia",
    difficulty: "Media"
  }),
  buildQuestion({
    prompt: "Que gas necesitan las plantas para la fotosintesis?",
    correct: "Dioxido de carbono",
    distractors: ["Oxigeno", "Nitrogeno", "Helio"],
    explanation: "Las plantas capturan CO2 durante la fotosintesis.",
    topic: "Ciencia",
    difficulty: "Baja"
  }),
  buildQuestion({
    prompt: "Que figura tiene todos sus lados iguales y cuatro angulos rectos?",
    correct: "Cuadrado",
    distractors: ["Rectangulo", "Rombo", "Trapecio"],
    explanation: "El cuadrado combina cuatro lados iguales y angulos de 90 grados.",
    topic: "Matematicas",
    difficulty: "Baja"
  }),
  buildQuestion({
    prompt: "Que protocolo se usa para transferir paginas web?",
    correct: "HTTP",
    distractors: ["FTP", "SMTP", "SSH"],
    explanation: "HTTP/HTTPS es el protocolo principal para navegar web.",
    topic: "Tecnologia",
    difficulty: "Baja"
  }),
  buildQuestion({
    prompt: "Que pintor espaniol es autor de Guernica?",
    correct: "Pablo Picasso",
    distractors: ["Joan Miro", "Francisco de Goya", "Diego Velazquez"],
    explanation: "Guernica fue pintado por Pablo Picasso en 1937.",
    topic: "Arte",
    difficulty: "Media"
  }),
  buildQuestion({
    prompt: "Cuantos minutos tiene una hora y media?",
    correct: "90",
    distractors: ["60", "75", "120"],
    explanation: "Una hora son 60 minutos y media hora son 30.",
    topic: "Matematicas",
    difficulty: "Baja"
  }),
  buildQuestion({
    prompt: "Cual es el rio mas largo de Sudamerica?",
    correct: "Amazonas",
    distractors: ["Parana", "Orinoco", "Magdalena"],
    explanation: "El Amazonas es el rio mas largo y caudaloso de la region.",
    topic: "Geografia",
    difficulty: "Media"
  }),
  buildQuestion({
    prompt: "Que musculo separa torax y abdomen y participa en la respiracion?",
    correct: "Diafragma",
    distractors: ["Biceps", "Triceps", "Deltoides"],
    explanation: "El diafragma es clave para la respiracion pulmonar.",
    topic: "Ciencia",
    difficulty: "Media"
  }),
  buildQuestion({
    prompt: "Que pais organiza tradicionalmente el Tour de Francia?",
    correct: "Francia",
    distractors: ["Italia", "Belgica", "Suiza"],
    explanation: "El Tour de Francia se disputa principalmente en territorio frances.",
    topic: "Deporte",
    difficulty: "Baja"
  }),
  buildQuestion({
    prompt: "Que significa CPU en informatica?",
    correct: "Unidad central de procesamiento",
    distractors: [
      "Unidad de control de perifericos",
      "Sistema principal de memoria",
      "Unidad de comunicacion principal"
    ],
    explanation: "CPU corresponde a Central Processing Unit.",
    topic: "Tecnologia",
    difficulty: "Media"
  }),
  buildQuestion({
    prompt: "Que mar separa Europa de Africa en el estrecho de Gibraltar?",
    correct: "Mar Mediterraneo",
    distractors: ["Mar Negro", "Mar Rojo", "Mar del Norte"],
    explanation: "El Mediterraneo conecta ambos continentes en Gibraltar.",
    topic: "Geografia",
    difficulty: "Media"
  }),
  buildQuestion({
    prompt: "Que numero primo es el menor mayor que 10?",
    correct: "11",
    distractors: ["12", "13", "15"],
    explanation: "11 es primo y es el primero por encima de 10.",
    topic: "Matematicas",
    difficulty: "Baja"
  }),
  buildQuestion({
    prompt: "Que estilo arquitectonico caracteriza a la Sagrada Familia?",
    correct: "Modernismo",
    distractors: ["Romanico", "Gotico", "Barroco"],
    explanation: "La obra de Gaudi se enmarca en el modernismo catalan.",
    topic: "Arte",
    difficulty: "Media"
  }),
  buildQuestion({
    prompt: "Que unidad mide la resistencia electrica?",
    correct: "Ohmio",
    distractors: ["Voltio", "Amperio", "Watio"],
    explanation: "La resistencia se mide en ohmios.",
    topic: "Ciencia",
    difficulty: "Media"
  })
];

const countriesAndCapitals = [
  ["Argentina", "Buenos Aires"],
  ["Bolivia", "Sucre"],
  ["Brasil", "Brasilia"],
  ["Chile", "Santiago"],
  ["Colombia", "Bogota"],
  ["Costa Rica", "San Jose"],
  ["Cuba", "La Habana"],
  ["Ecuador", "Quito"],
  ["El Salvador", "San Salvador"],
  ["Estados Unidos", "Washington D.C."],
  ["Guatemala", "Ciudad de Guatemala"],
  ["Honduras", "Tegucigalpa"],
  ["Mexico", "Ciudad de Mexico"],
  ["Nicaragua", "Managua"],
  ["Panama", "Ciudad de Panama"],
  ["Paraguay", "Asuncion"],
  ["Peru", "Lima"],
  ["Republica Dominicana", "Santo Domingo"],
  ["Uruguay", "Montevideo"],
  ["Venezuela", "Caracas"],
  ["Alemania", "Berlin"],
  ["Austria", "Viena"],
  ["Belgica", "Bruselas"],
  ["Chequia", "Praga"],
  ["Dinamarca", "Copenhague"],
  ["Espania", "Madrid"],
  ["Finlandia", "Helsinki"],
  ["Francia", "Paris"],
  ["Grecia", "Atenas"],
  ["Hungria", "Budapest"],
  ["Irlanda", "Dublin"],
  ["Islandia", "Reikiavik"],
  ["Italia", "Roma"],
  ["Noruega", "Oslo"],
  ["Paises Bajos", "Amsterdam"],
  ["Polonia", "Varsovia"],
  ["Portugal", "Lisboa"],
  ["Reino Unido", "Londres"],
  ["Suecia", "Estocolmo"],
  ["Suiza", "Berna"],
  ["Turquia", "Ankara"],
  ["Ucrania", "Kiev"],
  ["Marruecos", "Rabat"],
  ["Argelia", "Argel"],
  ["Egipto", "El Cairo"],
  ["Kenia", "Nairobi"],
  ["Nigeria", "Abuya"],
  ["Sudafrica", "Pretoria"],
  ["Australia", "Canberra"],
  ["Nueva Zelanda", "Wellington"],
  ["China", "Pekin"],
  ["Corea del Sur", "Seul"],
  ["Filipinas", "Manila"],
  ["India", "Nueva Delhi"],
  ["Indonesia", "Yakarta"],
  ["Japon", "Tokio"],
  ["Pakistan", "Islamabad"],
  ["Tailandia", "Bangkok"],
  ["Vietnam", "Hanoi"]
];

const capitalQuestions = (() => {
  const capitals = countriesAndCapitals.map((item) => item[1]);
  return countriesAndCapitals.map(([country, capital], index) => {
    return buildQuestion({
      prompt: `Cual es la capital de ${country}?`,
      correct: capital,
      distractors: pickDistractors(capitals, index),
      explanation: `${capital} es la capital de ${country}.`,
      topic: "Geografia",
      difficulty: "Media"
    });
  });
})();

const elementsAndSymbols = [
  ["Hidrogeno", "H"],
  ["Helio", "He"],
  ["Carbono", "C"],
  ["Nitrogeno", "N"],
  ["Oxigeno", "O"],
  ["Sodio", "Na"],
  ["Potasio", "K"],
  ["Calcio", "Ca"],
  ["Hierro", "Fe"],
  ["Cobre", "Cu"],
  ["Zinc", "Zn"],
  ["Plata", "Ag"],
  ["Oro", "Au"],
  ["Mercurio", "Hg"],
  ["Cloro", "Cl"],
  ["Bromo", "Br"],
  ["Yodo", "I"],
  ["Silicio", "Si"],
  ["Fosforo", "P"],
  ["Azufre", "S"],
  ["Aluminio", "Al"],
  ["Magnesio", "Mg"],
  ["Litio", "Li"],
  ["Fluor", "F"],
  ["Neon", "Ne"],
  ["Argon", "Ar"],
  ["Cobalto", "Co"],
  ["Niquel", "Ni"],
  ["Plomo", "Pb"],
  ["Estanio", "Sn"]
];

const elementQuestions = (() => {
  const symbols = elementsAndSymbols.map((item) => item[1]);
  return elementsAndSymbols.map(([element, symbol], index) => {
    return buildQuestion({
      prompt: `Cual es el simbolo quimico de ${element}?`,
      correct: symbol,
      distractors: pickDistractors(symbols, index),
      explanation: `El simbolo de ${element} es ${symbol}.`,
      topic: "Ciencia",
      difficulty: "Media"
    });
  });
})();

const createAdditionQuestions = () => {
  const questions = [];

  for (let seed = 1; seed <= 120; seed += 1) {
    const a = 12 + seed;
    const b = 4 + ((seed * 3) % 31);
    const correct = a + b;
    questions.push(
      buildQuestion({
        prompt: `Cuanto es ${a} + ${b}?`,
        correct,
        distractors: [correct + 2, correct - 3, correct + 7],
        explanation: `${a} + ${b} = ${correct}.`,
        topic: "Matematicas",
        difficulty: "Baja"
      })
    );
  }

  return questions;
};

const createMultiplicationQuestions = () => {
  const questions = [];

  for (let seed = 1; seed <= 120; seed += 1) {
    const a = 3 + (seed % 16);
    const b = 2 + ((seed * 5) % 11);
    const correct = a * b;
    questions.push(
      buildQuestion({
        prompt: `Cuanto es ${a} x ${b}?`,
        correct,
        distractors: [correct + a, correct - b, correct + 9],
        explanation: `${a} x ${b} = ${correct}.`,
        topic: "Matematicas",
        difficulty: "Media"
      })
    );
  }

  return questions;
};

const createSubtractionQuestions = () => {
  const questions = [];

  for (let seed = 1; seed <= 90; seed += 1) {
    const a = 60 + seed;
    const b = 8 + ((seed * 4) % 27);
    const correct = a - b;
    questions.push(
      buildQuestion({
        prompt: `Cuanto es ${a} - ${b}?`,
        correct,
        distractors: [correct + 4, correct - 5, correct + 9],
        explanation: `${a} - ${b} = ${correct}.`,
        topic: "Matematicas",
        difficulty: "Baja"
      })
    );
  }

  return questions;
};

const createBinaryQuestions = () => {
  const questions = [];

  for (let value = 5; value <= 80; value += 1) {
    const correct = value.toString(2);
    const distractorA = (value + 1).toString(2);
    const distractorB = Math.max(1, value - 1).toString(2);
    const distractorC = (value + 2).toString(2);
    questions.push(
      buildQuestion({
        prompt: `Que valor en binario representa el decimal ${value}?`,
        correct,
        distractors: [distractorA, distractorB, distractorC],
        explanation: `${value} en base 10 equivale a ${correct} en base 2.`,
        topic: "Tecnologia",
        difficulty: "Media"
      })
    );
  }

  return questions;
};

const inventorsAndInventions = [
  ["Alexander Graham Bell", "Telefono"],
  ["Thomas Edison", "Bombilla incandescente"],
  ["Johannes Gutenberg", "Imprenta de tipos moviles"],
  ["James Watt", "Mejora de la maquina de vapor"],
  ["Nikola Tesla", "Sistema de corriente alterna"],
  ["Tim Berners-Lee", "World Wide Web"],
  ["Guglielmo Marconi", "Radiotelegrafia"],
  ["Karl Benz", "Automovil de motor moderno"],
  ["Wright Brothers", "Primer avion controlado"],
  ["John Logie Baird", "Television mecanica"],
  ["Samuel Morse", "Codigo Morse"],
  ["Guido van Rossum", "Lenguaje Python"]
];

const inventorQuestions = (() => {
  const inventions = inventorsAndInventions.map((item) => item[1]);
  return inventorsAndInventions.map(([inventor, invention], index) => {
    return buildQuestion({
      prompt: `Que invento se asocia principalmente con ${inventor}?`,
      correct: invention,
      distractors: pickDistractors(inventions, index),
      explanation: `${inventor} esta asociado con ${invention}.`,
      topic: "Historia",
      difficulty: "Media"
    });
  });
})();

const composersAndWorks = [
  ["Ludwig van Beethoven", "Novena Sinfonia"],
  ["Wolfgang A. Mozart", "La flauta magica"],
  ["Johann S. Bach", "Conciertos de Brandeburgo"],
  ["Antonio Vivaldi", "Las cuatro estaciones"],
  ["Giuseppe Verdi", "La Traviata"],
  ["Richard Wagner", "El anillo del nibelungo"],
  ["Pyotr Tchaikovsky", "El lago de los cisnes"],
  ["Claude Debussy", "Clair de Lune"],
  ["Frederic Chopin", "Nocturnos"],
  ["Igor Stravinsky", "La consagracion de la primavera"],
  ["Camille Saint-Saens", "El carnaval de los animales"],
  ["Maurice Ravel", "Bolero"]
];

const musicQuestions = (() => {
  const works = composersAndWorks.map((item) => item[1]);
  return composersAndWorks.map(([composer, work], index) => {
    return buildQuestion({
      prompt: `Que obra esta vinculada a ${composer}?`,
      correct: work,
      distractors: pickDistractors(works, index),
      explanation: `${work} es una obra emblematica de ${composer}.`,
      topic: "Musica",
      difficulty: "Media"
    });
  });
})();

const filmsAndDirectors = [
  ["Inception", "Christopher Nolan"],
  ["Pulp Fiction", "Quentin Tarantino"],
  ["Parasite", "Bong Joon-ho"],
  ["The Godfather", "Francis Ford Coppola"],
  ["Titanic", "James Cameron"],
  ["Interstellar", "Christopher Nolan"],
  ["The Grand Budapest Hotel", "Wes Anderson"],
  ["La La Land", "Damien Chazelle"],
  ["The Irishman", "Martin Scorsese"],
  ["Spirited Away", "Hayao Miyazaki"],
  ["Fight Club", "David Fincher"],
  ["Roma", "Alfonso Cuaron"]
];

const cinemaQuestions = (() => {
  const directors = filmsAndDirectors.map((item) => item[1]);
  return filmsAndDirectors.map(([film, director], index) => {
    return buildQuestion({
      prompt: `Quien dirigio la pelicula ${film}?`,
      correct: director,
      distractors: pickDistractors(directors, index),
      explanation: `${film} fue dirigida por ${director}.`,
      topic: "Cine",
      difficulty: "Media"
    });
  });
})();

const spanishToEnglish = [
  ["manzana", "apple"],
  ["libro", "book"],
  ["ventana", "window"],
  ["camino", "path"],
  ["escuela", "school"],
  ["mercado", "market"],
  ["jardin", "garden"],
  ["montania", "mountain"],
  ["nube", "cloud"],
  ["mar", "sea"],
  ["bosque", "forest"],
  ["puerta", "door"],
  ["ciudad", "city"],
  ["cielo", "sky"],
  ["reloj", "clock"],
  ["cocina", "kitchen"]
];

const languageQuestions = (() => {
  const englishWords = spanishToEnglish.map((item) => item[1]);
  return spanishToEnglish.map(([spanish, english], index) => {
    return buildQuestion({
      prompt: `Cual es la traduccion al ingles de \"${spanish}\"?`,
      correct: english,
      distractors: pickDistractors(englishWords, index),
      explanation: `La traduccion correcta de ${spanish} es ${english}.`,
      topic: "Idiomas",
      difficulty: "Baja"
    });
  });
})();

const animalsAndHabitats = [
  ["camello", "desierto"],
  ["pinguino", "regiones polares"],
  ["delfin", "oceano"],
  ["aguila", "montanas"],
  ["rana arboricola", "selva humeda"],
  ["zorro rojo", "bosques templados"],
  ["koala", "bosques de eucalipto"],
  ["oso polar", "hielo artico"],
  ["flamenco", "humedales"],
  ["lobo marino", "costas rocosas"],
  ["lemur", "bosque tropical"],
  ["jaguar", "selva americana"]
];

const natureQuestions = (() => {
  const habitats = animalsAndHabitats.map((item) => item[1]);
  return animalsAndHabitats.map(([animal, habitat], index) => {
    return buildQuestion({
      prompt: `En que habitat vive principalmente el ${animal}?`,
      correct: habitat,
      distractors: pickDistractors(habitats, index),
      explanation: `El ${animal} se asocia sobre todo con ${habitat}.`,
      topic: "Naturaleza",
      difficulty: "Media"
    });
  });
})();

const programmingConcepts = [
  ["Recursion", "Funcion que se llama a si misma"],
  ["Compilador", "Traduce codigo fuente a codigo maquina"],
  ["API", "Interfaz para comunicacion entre sistemas"],
  ["Variable", "Espacio con nombre para guardar datos"],
  ["Array", "Coleccion indexada de elementos"],
  ["Hash map", "Estructura clave-valor"],
  ["Framework", "Base reutilizable para desarrollar aplicaciones"],
  ["Repositorio", "Almacen de codigo y versionado"],
  ["Bug", "Defecto en el software"],
  ["Refactorizacion", "Mejora interna sin cambiar comportamiento externo"],
  ["Asincronia", "Ejecucion sin bloqueo de tareas"],
  ["Prueba unitaria", "Verificacion de una pieza pequena de codigo"]
];

const programmingQuestions = (() => {
  const definitions = programmingConcepts.map((item) => item[1]);
  return programmingConcepts.map(([concept, definition], index) => {
    return buildQuestion({
      prompt: `Que definicion describe mejor el concepto \"${concept}\"?`,
      correct: definition,
      distractors: pickDistractors(definitions, index),
      explanation: `${concept}: ${definition}.`,
      topic: "Programacion",
      difficulty: "Media"
    });
  });
})();

const economicsConcepts = [
  ["Inflacion", "Aumento generalizado de precios"],
  ["Deflacion", "Descenso generalizado de precios"],
  ["PIB", "Valor monetario de bienes y servicios finales"],
  ["Oferta", "Cantidad disponible de un bien"],
  ["Demanda", "Cantidad que los consumidores desean comprar"],
  ["Monopolio", "Mercado controlado por un unico oferente"],
  ["Competencia perfecta", "Mercado con muchos oferentes y demandantes"],
  ["Tipo de interes", "Precio del dinero prestado"],
  ["Liquidez", "Facilidad para convertir un activo en efectivo"],
  ["Arancel", "Impuesto aplicado al comercio exterior"],
  ["Productividad", "Produccion por unidad de recurso"],
  ["Coste de oportunidad", "Valor de la mejor alternativa no elegida"]
];

const economyQuestions = (() => {
  const definitions = economicsConcepts.map((item) => item[1]);
  return economicsConcepts.map(([concept, definition], index) => {
    return buildQuestion({
      prompt: `Que significa ${concept} en economia?`,
      correct: definition,
      distractors: pickDistractors(definitions, index),
      explanation: `${concept} se refiere a: ${definition}.`,
      topic: "Economia",
      difficulty: "Media"
    });
  });
})();

const generatedQuestionSet = [
  ...createAdditionQuestions(),
  ...createSubtractionQuestions(),
  ...createMultiplicationQuestions(),
  ...createBinaryQuestions()
];

const EXPANSION_DIFFICULTIES = ["Baja", "Media", "Alta", "Media"];

const getExpansionDifficulty = (seed, offset = 0) => {
  return EXPANSION_DIFFICULTIES[(seed + offset) % EXPANSION_DIFFICULTIES.length];
};

const createPairExpansionQuestions = ({
  topic,
  pairs,
  total,
  promptFactory,
  explanationFactory = (left, right) => `${left} se asocia con ${right}.`,
  difficultyOffset = 0
}) => {
  const answers = Array.from(new Set(pairs.map((item) => String(item[1]))));
  if (answers.length < 4 || !pairs.length || total <= 0) {
    return [];
  }

  return Array.from({ length: total }, (_, seed) => {
    const pairIndex = seed % pairs.length;
    const batch = Math.floor(seed / pairs.length) + 1;
    const [left, right] = pairs[pairIndex];
    const rightText = String(right);
    const answerIndex = Math.max(0, answers.indexOf(rightText));

    return buildQuestion({
      prompt: promptFactory(left, right, batch),
      correct: rightText,
      distractors: pickDistractors(answers, answerIndex),
      explanation: explanationFactory(left, right),
      topic,
      difficulty: getExpansionDifficulty(seed, difficultyOffset)
    });
  });
};

const createMathExpansionQuestions = (total = 2500) => {
  const questions = [];

  for (let seed = 1; seed <= total; seed += 1) {
    const type = seed % 5;

    if (type === 0) {
      const a = 60 + seed * 2;
      const b = 15 + seed * 3;
      const correct = a + b;
      questions.push(
        buildQuestion({
          prompt: `Cuanto es ${a} + ${b}?`,
          correct,
          distractors: [correct + 2, correct - 3, correct + 7],
          explanation: `${a} + ${b} = ${correct}.`,
          topic: "Matematicas",
          difficulty: getExpansionDifficulty(seed)
        })
      );
      continue;
    }

    if (type === 1) {
      const a = 500 + seed * 2;
      const b = 20 + (seed % 150);
      const correct = a - b;
      questions.push(
        buildQuestion({
          prompt: `Cuanto es ${a} - ${b}?`,
          correct,
          distractors: [correct + 4, correct - 5, correct + 9],
          explanation: `${a} - ${b} = ${correct}.`,
          topic: "Matematicas",
          difficulty: getExpansionDifficulty(seed, 1)
        })
      );
      continue;
    }

    if (type === 2) {
      const a = 4 + (seed % 21);
      const b = 3 + Math.floor(seed / 40);
      const correct = a * b;
      questions.push(
        buildQuestion({
          prompt: `Cuanto es ${a} x ${b}?`,
          correct,
          distractors: [correct + a, Math.max(1, correct - b), correct + 11],
          explanation: `${a} x ${b} = ${correct}.`,
          topic: "Matematicas",
          difficulty: getExpansionDifficulty(seed, 2)
        })
      );
      continue;
    }

    if (type === 3) {
      const divisor = 2 + (seed % 13);
      const quotient = 4 + Math.floor(seed / 13);
      const dividend = divisor * quotient;
      questions.push(
        buildQuestion({
          prompt: `Cuanto es ${dividend} / ${divisor}?`,
          correct: quotient,
          distractors: [quotient + 2, Math.max(1, quotient - 3), quotient + 6],
          explanation: `${dividend} / ${divisor} = ${quotient}.`,
          topic: "Matematicas",
          difficulty: getExpansionDifficulty(seed, 3)
        })
      );
      continue;
    }

    const base = (10 + (seed % 90)) * 20;
    const percentages = [10, 20, 25, 30, 40, 50, 60, 75];
    const percentage = percentages[seed % percentages.length];
    const correct = (base * percentage) / 100;
    const step = Math.max(5, base / 20);

    questions.push(
      buildQuestion({
        prompt: `Cuanto es el ${percentage}% de ${base}?`,
        correct,
        distractors: [correct + step, Math.max(1, correct - step), correct + step * 2],
        explanation: `El ${percentage}% de ${base} es ${correct}.`,
        topic: "Matematicas",
        difficulty: getExpansionDifficulty(seed, 4)
      })
    );
  }

  return questions;
};

const createTechnologyExpansionQuestions = (total = 1200) => {
  const protocolPairs = [
    ["HTTP", "Transferencia de paginas web"],
    ["HTTPS", "Transferencia web cifrada"],
    ["DNS", "Resolucion de dominios a IP"],
    ["FTP", "Transferencia de archivos"],
    ["SSH", "Conexion remota segura"],
    ["SMTP", "Envio de correo electronico"],
    ["IMAP", "Sincronizacion de correo en servidor"],
    ["TCP", "Transporte orientado a conexion"],
    ["UDP", "Transporte sin conexion"],
    ["IP", "Direccionamiento de paquetes en red"],
    ["VPN", "Tunel cifrado para trafico"],
    ["CDN", "Distribucion de contenido en nodos"]
  ];

  const protocolDescriptions = protocolPairs.map((item) => item[1]);
  const questions = [];

  for (let seed = 1; seed <= total; seed += 1) {
    const type = seed % 4;

    if (type === 0) {
      const value = 30 + seed;
      const correct = value.toString(2);
      questions.push(
        buildQuestion({
          prompt: `Que binario representa el decimal ${value}?`,
          correct,
          distractors: [(value + 1).toString(2), (value - 1).toString(2), (value + 2).toString(2)],
          explanation: `${value} en binario es ${correct}.`,
          topic: "Tecnologia",
          difficulty: getExpansionDifficulty(seed)
        })
      );
      continue;
    }

    if (type === 1) {
      const value = 100 + seed * 2;
      const correct = value.toString(16).toUpperCase();
      questions.push(
        buildQuestion({
          prompt: `Que hexadecimal corresponde a ${value} en decimal?`,
          correct,
          distractors: [
            (value + 2).toString(16).toUpperCase(),
            (value - 2).toString(16).toUpperCase(),
            (value + 4).toString(16).toUpperCase()
          ],
          explanation: `${value} en hexadecimal es ${correct}.`,
          topic: "Tecnologia",
          difficulty: getExpansionDifficulty(seed, 1)
        })
      );
      continue;
    }

    if (type === 2) {
      const mb = 5 + seed;
      const correct = mb * 1024;
      questions.push(
        buildQuestion({
          prompt: `Cuantos KB son ${mb} MB si 1 MB = 1024 KB?`,
          correct,
          distractors: [correct + 1024, correct - 1024, correct + 2048],
          explanation: `${mb} MB son ${correct} KB.`,
          topic: "Tecnologia",
          difficulty: getExpansionDifficulty(seed, 2)
        })
      );
      continue;
    }

    const pairIndex = seed % protocolPairs.length;
    const [protocol, description] = protocolPairs[pairIndex];
    questions.push(
      buildQuestion({
        prompt: `Que describe mejor el termino ${protocol}?`,
        correct: description,
        distractors: pickDistractors(protocolDescriptions, pairIndex),
        explanation: `${protocol}: ${description}.`,
        topic: "Tecnologia",
        difficulty: getExpansionDifficulty(seed, 3)
      })
    );
  }

  return questions;
};

const createScienceExpansionQuestions = (total = 800) => {
  const elementNames = elementsAndSymbols.map((item) => item[0]);
  const elementSymbols = elementsAndSymbols.map((item) => item[1]);
  const organPairs = [
    ["Corazon", "Bombear sangre"],
    ["Pulmones", "Intercambio de gases"],
    ["Higado", "Metabolizar sustancias"],
    ["Rinones", "Filtrar la sangre"],
    ["Pancreas", "Regular glucosa"],
    ["Estomago", "Iniciar digestion"],
    ["Intestino delgado", "Absorber nutrientes"],
    ["Tiroides", "Regular metabolismo"],
    ["Piel", "Proteger y regular temperatura"],
    ["Cerebro", "Coordinar sistema nervioso"],
    ["Vejiga", "Almacenar orina"],
    ["Diafragma", "Facilitar respiracion"]
  ];
  const organFunctions = organPairs.map((item) => item[1]);
  const questions = [];

  for (let seed = 1; seed <= total; seed += 1) {
    const type = seed % 4;

    if (type === 0) {
      const index = seed % elementsAndSymbols.length;
      const [element, symbol] = elementsAndSymbols[index];
      questions.push(
        buildQuestion({
          prompt: `Cual es el simbolo quimico de ${element}?`,
          correct: symbol,
          distractors: pickDistractors(elementSymbols, index),
          explanation: `${element} se representa con ${symbol}.`,
          topic: "Ciencia",
          difficulty: getExpansionDifficulty(seed)
        })
      );
      continue;
    }

    if (type === 1) {
      const index = seed % elementsAndSymbols.length;
      const [element, symbol] = elementsAndSymbols[index];
      questions.push(
        buildQuestion({
          prompt: `Que elemento corresponde al simbolo ${symbol}?`,
          correct: element,
          distractors: pickDistractors(elementNames, index),
          explanation: `El simbolo ${symbol} corresponde a ${element}.`,
          topic: "Ciencia",
          difficulty: getExpansionDifficulty(seed, 1)
        })
      );
      continue;
    }

    if (type === 2) {
      const liters = 2 + seed;
      const correct = liters * 1000;
      questions.push(
        buildQuestion({
          prompt: `Cuantos mililitros son ${liters} litros?`,
          correct,
          distractors: [correct + 200, correct - 100, correct + 500],
          explanation: `${liters} litros equivalen a ${correct} ml.`,
          topic: "Ciencia",
          difficulty: getExpansionDifficulty(seed, 2)
        })
      );
      continue;
    }

    const index = seed % organPairs.length;
    const [organ, functionName] = organPairs[index];
    questions.push(
      buildQuestion({
        prompt: `Cual es la funcion principal de ${organ}?`,
        correct: functionName,
        distractors: pickDistractors(organFunctions, index),
        explanation: `${organ}: ${functionName}.`,
        topic: "Ciencia",
        difficulty: getExpansionDifficulty(seed, 3)
      })
    );
  }

  return questions;
};

const createProgrammingCodeExpansionQuestions = (total = 260) => {
  const questions = [];
  for (let seed = 1; seed <= total; seed += 1) {
    const a = 8 + seed;
    const b = 2 + (seed % 9);
    const c = 2 + (seed % 5);
    const d = 1 + (seed % 7);
    const correct = (a + b) * c - d;

    questions.push(
      buildQuestion({
        prompt: `Si x=${a}; x+=${b}; x*=${c}; x-=${d}; cual es x al final?`,
        correct,
        distractors: [correct + c, correct - b, correct + d + 3],
        explanation: `(${a}+${b})*${c}-${d} = ${correct}.`,
        topic: "Programacion",
        difficulty: getExpansionDifficulty(seed, 1)
      })
    );
  }
  return questions;
};

const createLogicExpansionQuestions = (total = 400) => {
  const questions = [];

  for (let seed = 1; seed <= total; seed += 1) {
    const type = seed % 3;

    if (type === 0) {
      const start = 10 + seed;
      const step = 2 + (seed % 8);
      const n1 = start;
      const n2 = n1 + step;
      const n3 = n2 + step;
      const n4 = n3 + step;
      const correct = n4 + step;
      questions.push(
        buildQuestion({
          prompt: `Completa la serie ${n1}, ${n2}, ${n3}, ${n4}, ?`,
          correct,
          distractors: [correct + 1, correct - step, correct + step],
          explanation: `La serie aumenta de ${step} en ${step}, por eso sigue ${correct}.`,
          topic: "Logica",
          difficulty: getExpansionDifficulty(seed)
        })
      );
      continue;
    }

    if (type === 1) {
      const start = 2 + (seed % 5);
      const ratio = 2 + (seed % 3);
      const n1 = start;
      const n2 = n1 * ratio;
      const n3 = n2 * ratio;
      const n4 = n3 * ratio;
      const correct = n4 * ratio;
      questions.push(
        buildQuestion({
          prompt: `Completa la progresion ${n1}, ${n2}, ${n3}, ${n4}, ?`,
          correct,
          distractors: [correct + ratio, Math.max(1, correct - ratio), n4 + ratio],
          explanation: `Cada termino se multiplica por ${ratio}; sigue ${correct}.`,
          topic: "Logica",
          difficulty: getExpansionDifficulty(seed, 1)
        })
      );
      continue;
    }

    const start = 30 + seed;
    const up = 3 + (seed % 4);
    const down = 1 + (seed % 3);
    const n1 = start;
    const n2 = n1 + up;
    const n3 = n2 - down;
    const n4 = n3 + up;
    const correct = n4 - down;
    questions.push(
      buildQuestion({
        prompt: `Serie alterna ${n1}, ${n2}, ${n3}, ${n4}, ?`,
        correct,
        distractors: [correct + up, correct - down, correct + 2],
        explanation: `El patron alterna +${up} y -${down}. El siguiente es ${correct}.`,
        topic: "Logica",
        difficulty: getExpansionDifficulty(seed, 2)
      })
    );
  }

  return questions;
};

const historyMilestones = [
  ["Revolucion Francesa", "1789"],
  ["Independencia de Estados Unidos", "1776"],
  ["Caida del Muro de Berlin", "1989"],
  ["Llegada a la Luna del Apollo 11", "1969"],
  ["Creacion de la ONU", "1945"],
  ["Inicio de la Primera Guerra Mundial", "1914"],
  ["Inicio de la Segunda Guerra Mundial", "1939"],
  ["Descubrimiento de America", "1492"],
  ["Invencion de la imprenta moderna", "1450"],
  ["Disolucion de la URSS", "1991"],
  ["Unificacion de Alemania", "1871"],
  ["Batalla de Waterloo", "1815"]
];

const artArtistWorks = [
  ["Leonardo da Vinci", "Mona Lisa"],
  ["Pablo Picasso", "Guernica"],
  ["Vincent van Gogh", "La noche estrellada"],
  ["Diego Velazquez", "Las meninas"],
  ["Claude Monet", "Impresion, sol naciente"],
  ["Salvador Dali", "La persistencia de la memoria"],
  ["Edvard Munch", "El grito"],
  ["Johannes Vermeer", "La joven de la perla"],
  ["Frida Kahlo", "Las dos Fridas"],
  ["Gustav Klimt", "El beso"],
  ["Botticelli", "El nacimiento de Venus"],
  ["Caravaggio", "La vocacion de San Mateo"]
];

const sportsEventDiscipline = [
  ["Roland Garros", "Tenis"],
  ["Wimbledon", "Tenis"],
  ["Tour de Francia", "Ciclismo"],
  ["Super Bowl", "Futbol americano"],
  ["NBA Finals", "Baloncesto"],
  ["Mundial de futbol", "Futbol"],
  ["MotoGP", "Motociclismo"],
  ["24 Horas de Le Mans", "Automovilismo"],
  ["Maraton de Boston", "Atletismo"],
  ["Copa America", "Futbol"],
  ["US Open", "Tenis"],
  ["Seis Naciones", "Rugby"]
];

const literatureAuthorBook = [
  ["Miguel de Cervantes", "Don Quijote de la Mancha"],
  ["Gabriel Garcia Marquez", "Cien anios de soledad"],
  ["Jorge Luis Borges", "Ficciones"],
  ["Julio Cortazar", "Rayuela"],
  ["George Orwell", "1984"],
  ["Jane Austen", "Orgullo y prejuicio"],
  ["William Shakespeare", "Hamlet"],
  ["Franz Kafka", "La metamorfosis"],
  ["Leon Tolstoi", "Guerra y paz"],
  ["Fiodor Dostoievski", "Crimen y castigo"],
  ["Isabel Allende", "La casa de los espiritus"],
  ["Antoine de Saint-Exupery", "El principito"]
];

const astronomyFacts = [
  ["Planeta mas cercano al Sol", "Mercurio"],
  ["Planeta mas grande del sistema solar", "Jupiter"],
  ["Planeta famoso por sus anillos", "Saturno"],
  ["Satelite natural de la Tierra", "Luna"],
  ["Galaxia donde vivimos", "Via Lactea"],
  ["Planeta rojo", "Marte"],
  ["Planeta mas lejano reconocido del Sol", "Neptuno"],
  ["Mision que llego a la Luna en 1969", "Apollo 11"],
  ["Unidad para distancias estelares grandes", "Anio luz"],
  ["Objeto helado con cola cerca del Sol", "Cometa"],
  ["Fenomeno donde la Luna tapa al Sol", "Eclipse solar"],
  ["Fenomeno donde la Tierra sombrea la Luna", "Eclipse lunar"]
];

const healthHabits = [
  ["Dormir al menos 7 horas", "Favorecer recuperacion fisica y mental"],
  ["Hidratarse con regularidad", "Mantener funciones vitales"],
  ["Realizar ejercicio semanal", "Reducir riesgo cardiovascular"],
  ["Comer frutas y verduras", "Aumentar micronutrientes"],
  ["Evitar tabaquismo", "Reducir dano respiratorio"],
  ["Controlar estres cronico", "Proteger salud mental"],
  ["Usar protector solar", "Reducir dano por radiacion UV"],
  ["Mantener higiene oral", "Prevenir caries y enfermedad periodontal"],
  ["Evitar sedentarismo prolongado", "Mejorar metabolismo"],
  ["Practicar fuerza muscular", "Preservar masa muscular"],
  ["Limitar ultraprocesados", "Mejorar calidad nutricional"],
  ["Chequeos medicos periodicos", "Detectar problemas temprano"]
];

const gastronomyOriginPairs = [
  ["Paella", "Espania"],
  ["Sushi", "Japon"],
  ["Pizza napolitana", "Italia"],
  ["Tacos", "Mexico"],
  ["Couscous", "Marruecos"],
  ["Feijoada", "Brasil"],
  ["Kimchi", "Corea del Sur"],
  ["Ceviche", "Peru"],
  ["Fondue", "Suiza"],
  ["Pho", "Vietnam"],
  ["Biryani", "India"],
  ["Poutine", "Canada"]
];

const expansionQuestionSet = [
  ...createMathExpansionQuestions(2500),
  ...createTechnologyExpansionQuestions(1200),
  ...createScienceExpansionQuestions(800),
  ...createPairExpansionQuestions({
    topic: "Geografia",
    pairs: countriesAndCapitals,
    total: 700,
    promptFactory: (country, _capital, _batch) => `Cual es la capital de ${country}?`,
    explanationFactory: (country, capital) => `${capital} es la capital de ${country}.`
  }),
  ...createPairExpansionQuestions({
    topic: "Historia",
    pairs: historyMilestones,
    total: 450,
    promptFactory: (event, _year, _batch) => `En que anio ocurrio ${event}?`,
    explanationFactory: (event, year) => `${event} se asocia con el anio ${year}.`
  }),
  ...createPairExpansionQuestions({
    topic: "Arte",
    pairs: artArtistWorks,
    total: 300,
    promptFactory: (artist, _work, _batch) => `Que obra se asocia con ${artist}?`,
    explanationFactory: (artist, work) => `${work} fue creada por ${artist}.`
  }),
  ...createPairExpansionQuestions({
    topic: "Deporte",
    pairs: sportsEventDiscipline,
    total: 300,
    promptFactory: (event, _discipline, _batch) => `Que disciplina corresponde a ${event}?`,
    explanationFactory: (event, discipline) => `${event} pertenece a ${discipline}.`
  }),
  ...createPairExpansionQuestions({
    topic: "Literatura",
    pairs: literatureAuthorBook,
    total: 300,
    promptFactory: (author, _book, _batch) => `Que obra escribio ${author}?`,
    explanationFactory: (author, book) => `${book} fue escrito por ${author}.`
  }),
  ...createPairExpansionQuestions({
    topic: "Musica",
    pairs: composersAndWorks,
    total: 300,
    promptFactory: (composer, _work, _batch) => `Que obra se vincula con ${composer}?`,
    explanationFactory: (composer, work) => `${work} es una obra de ${composer}.`
  }),
  ...createPairExpansionQuestions({
    topic: "Cine",
    pairs: filmsAndDirectors,
    total: 300,
    promptFactory: (film, _director, _batch) => `Quien dirigio la pelicula ${film}?`,
    explanationFactory: (film, director) => `${film} fue dirigida por ${director}.`
  }),
  ...createPairExpansionQuestions({
    topic: "Idiomas",
    pairs: spanishToEnglish,
    total: 300,
    promptFactory: (spanish, _english, _batch) => `Como se traduce "${spanish}" al ingles?`,
    explanationFactory: (spanish, english) => `${spanish} en ingles es ${english}.`
  }),
  ...createPairExpansionQuestions({
    topic: "Naturaleza",
    pairs: animalsAndHabitats,
    total: 300,
    promptFactory: (animal, _habitat, _batch) => `En que habitat vive ${animal}?`,
    explanationFactory: (animal, habitat) => `${animal} vive principalmente en ${habitat}.`
  }),
  ...createPairExpansionQuestions({
    topic: "Programacion",
    pairs: programmingConcepts,
    total: 240,
    promptFactory: (concept, _definition, _batch) => `Que define mejor el concepto "${concept}"?`,
    explanationFactory: (concept, definition) => `${concept}: ${definition}.`
  }),
  ...createProgrammingCodeExpansionQuestions(260),
  ...createPairExpansionQuestions({
    topic: "Economia",
    pairs: economicsConcepts,
    total: 500,
    promptFactory: (concept, _definition, _batch) => `Que significa ${concept}?`,
    explanationFactory: (concept, definition) => `${concept}: ${definition}.`
  }),
  ...createPairExpansionQuestions({
    topic: "Astronomia",
    pairs: astronomyFacts,
    total: 300,
    promptFactory: (fact, _answer, _batch) => `${fact}. Cual es la respuesta correcta?`,
    explanationFactory: (fact, answer) => `${fact}: ${answer}.`
  }),
  ...createPairExpansionQuestions({
    topic: "Salud",
    pairs: healthHabits,
    total: 300,
    promptFactory: (habit, _benefit, _batch) => `Que beneficio aporta "${habit}"?`,
    explanationFactory: (habit, benefit) => `${habit} ayuda a ${benefit}.`
  }),
  ...createPairExpansionQuestions({
    topic: "Gastronomia",
    pairs: gastronomyOriginPairs,
    total: 300,
    promptFactory: (dish, _origin, _batch) => `De donde es tradicional el plato ${dish}?`,
    explanationFactory: (dish, origin) => `${dish} se asocia tradicionalmente a ${origin}.`
  }),
  ...createLogicExpansionQuestions(400)
];

export const QUESTION_BANK = [
  ...coreQuestions,
  ...capitalQuestions,
  ...elementQuestions,
  ...inventorQuestions,
  ...musicQuestions,
  ...cinemaQuestions,
  ...languageQuestions,
  ...natureQuestions,
  ...programmingQuestions,
  ...economyQuestions,
  ...generatedQuestionSet,
  ...expansionQuestionSet
];

export const QUESTION_BANK_BY_TOPIC = QUESTION_BANK.reduce((accumulator, question) => {
  if (!accumulator[question.topic]) {
    accumulator[question.topic] = [];
  }
  accumulator[question.topic].push(question);
  return accumulator;
}, {});

export const QUESTION_TOPICS = Object.keys(QUESTION_BANK_BY_TOPIC);

export const QUESTION_BANK_SIZE = QUESTION_BANK.length;

const TOPIC_TRANSLATIONS = Object.freeze({
  General: "General",
  Ciencia: "Science",
  Geografia: "Geography",
  Tecnologia: "Technology",
  Historia: "History",
  Arte: "Art",
  Matematicas: "Mathematics",
  Deporte: "Sports",
  Literatura: "Literature",
  Musica: "Music",
  Cine: "Cinema",
  Idiomas: "Languages",
  Naturaleza: "Nature",
  Programacion: "Programming",
  Economia: "Economics",
  Astronomia: "Astronomy",
  Salud: "Health",
  Gastronomia: "Gastronomy"
});

const DIFFICULTY_TRANSLATIONS = Object.freeze({
  Baja: "Easy",
  Media: "Medium",
  Alta: "Hard",
  "Media-Alta": "Medium-Hard"
});

const VALUE_TRANSLATIONS = Object.freeze({
  "Africa": "Africa",
  "Alemania": "Germany",
  "America": "America",
  "Argelia": "Algeria",
  "Argel": "Algiers",
  "Asuncion": "Asuncion",
  "Atenas": "Athens",
  "Atlantico": "Atlantic",
  "Austria": "Austria",
  "Azufre": "Sulfur",
  "Baloncesto": "Basketball",
  "Belgica": "Belgium",
  "Berlin": "Berlin",
  "Berna": "Bern",
  "Bogota": "Bogota",
  "Bombear sangre": "Pump blood",
  "Bombilla incandescente": "Incandescent light bulb",
  "Bosque tropical": "Tropical forest",
  "Bosques de eucalipto": "Eucalyptus forests",
  "Bosques templados": "Temperate forests",
  "Brasil": "Brazil",
  "Brasilia": "Brasilia",
  "Bruselas": "Brussels",
  "Buenos Aires": "Buenos Aires",
  "Camello": "Camel",
  "Canada": "Canada",
  "Canberra": "Canberra",
  "Carbono": "Carbon",
  "Ciclismo": "Cycling",
  "Ciudad de Guatemala": "Guatemala City",
  "Ciudad de Mexico": "Mexico City",
  "Ciudad de Panama": "Panama City",
  "Cloro": "Chlorine",
  "Cobalto": "Cobalt",
  "Cobre": "Copper",
  "Cola": "Queue",
  "Cometa": "Comet",
  "Compilador": "Compiler",
  "Competencia perfecta": "Perfect competition",
  "Conduccion": "Conduction",
  "Conexion remota segura": "Secure remote connection",
  "Corazon": "Heart",
  "Corea del Sur": "South Korea",
  "Costas rocosas": "Rocky coasts",
  "Coste de oportunidad": "Opportunity cost",
  "Cuadrado": "Square",
  "Cuba": "Cuba",
  "Defecto en el software": "Software defect",
  "Deflacion": "Deflation",
  "Desierto": "Desert",
  "Diafragma": "Diaphragm",
  "Difraccion": "Diffraction",
  "Dinamarca": "Denmark",
  "Dioxido de carbono": "Carbon dioxide",
  "Direccionamiento de paquetes en red": "Packet addressing on a network",
  "Dispersion": "Dispersion",
  "Dublin": "Dublin",
  "Eclipse lunar": "Lunar eclipse",
  "Eclipse solar": "Solar eclipse",
  "Ecuador": "Ecuador",
  "Egipto": "Egypt",
  "El Cairo": "Cairo",
  "El Salvador": "El Salvador",
  "Envio de correo electronico": "Email sending",
  "Espacio con nombre para guardar datos": "Named storage space for data",
  "Espania": "Spain",
  "Estanio": "Tin",
  "Estocolmo": "Stockholm",
  "Estomago": "Stomach",
  "Europa": "Europe",
  "Evitar sedentarismo prolongado": "Avoid prolonged sedentary habits",
  "Evitar tabaquismo": "Avoid smoking",
  "Facilidad para convertir un activo en efectivo": "Ease of converting an asset into cash",
  "Facilitar respiracion": "Support breathing",
  "Filipinas": "Philippines",
  "Filtrar la sangre": "Filter blood",
  "Finlandia": "Finland",
  "Fluor": "Fluorine",
  "Framework": "Framework",
  "Francia": "France",
  "Futbol": "Soccer",
  "Futbol americano": "American football",
  "Gotico": "Gothic",
  "Guatemala": "Guatemala",
  "H2O": "H2O",
  "Hanoi": "Hanoi",
  "Hash map": "Hash map",
  "Heap": "Heap",
  "Helio": "Helium",
  "Helsinki": "Helsinki",
  "Hierro": "Iron",
  "Higado": "Liver",
  "Hockey": "Hockey",
  "Honduras": "Honduras",
  "Hidratarse con regularidad": "Hydrate regularly",
  "Hidrogeno": "Hydrogen",
  "Hielo artico": "Arctic ice",
  "Impuesto aplicado al comercio exterior": "Tax on foreign trade",
  "India": "India",
  "Indonesia": "Indonesia",
  "Inflacion": "Inflation",
  "Iniciar digestion": "Start digestion",
  "Intestino delgado": "Small intestine",
  "Intercambio de gases": "Gas exchange",
  "Interfaz para comunicacion entre sistemas": "Interface for communication between systems",
  "Irlanda": "Ireland",
  "Islandia": "Iceland",
  "Italia": "Italy",
  "Japon": "Japan",
  "Kenia": "Kenya",
  "Kiev": "Kyiv",
  "La Habana": "Havana",
  "Limitar ultraprocesados": "Limit ultra-processed foods",
  "Liquidez": "Liquidity",
  "Litio": "Lithium",
  "Londres": "London",
  "Magnesio": "Magnesium",
  "Managua": "Managua",
  "Mar Mediterraneo": "Mediterranean Sea",
  "Marruecos": "Morocco",
  "Marte": "Mars",
  "Mantener funciones vitales": "Maintain vital functions",
  "Mantener higiene oral": "Maintain oral hygiene",
  "Mejora de la maquina de vapor": "Improvement of the steam engine",
  "Mejorar calidad nutricional": "Improve nutritional quality",
  "Mejorar metabolismo": "Improve metabolism",
  "Mercurio": "Mercury",
  "Mercado controlado por un unico oferente": "Market controlled by a single supplier",
  "Mexico": "Mexico",
  "Modernismo": "Modernism",
  "Monopolio": "Monopoly",
  "Montevideo": "Montevideo",
  "Motociclismo": "Motorcycling",
  "Nairobi": "Nairobi",
  "Neon": "Neon",
  "Neptuno": "Neptune",
  "Nicaragua": "Nicaragua",
  "Niquel": "Nickel",
  "Nitrogeno": "Nitrogen",
  "Noruega": "Norway",
  "Nueva Delhi": "New Delhi",
  "Nueva Zelanda": "New Zealand",
  "Oferta": "Supply",
  "Ohmio": "Ohm",
  "Orinoco": "Orinoco",
  "Oro": "Gold",
  "Oso polar": "Polar bear",
  "Oxigeno": "Oxygen",
  "Pacifico": "Pacific",
  "Paises Bajos": "Netherlands",
  "Pakistan": "Pakistan",
  "Panama": "Panama",
  "Paraguay": "Paraguay",
  "Paris": "Paris",
  "Pekin": "Beijing",
  "Peru": "Peru",
  "Piel": "Skin",
  "Pila": "Stack",
  "Plomo": "Lead",
  "Polonia": "Poland",
  "Potasio": "Potassium",
  "Practicar fuerza muscular": "Practice strength training",
  "Praga": "Prague",
  "Pretoria": "Pretoria",
  "Productividad": "Productivity",
  "Produccion por unidad de recurso": "Production per resource unit",
  "Proteger salud mental": "Protect mental health",
  "Proteger y regular temperatura": "Protect and regulate temperature",
  "Prueba unitaria": "Unit test",
  "Pulmon": "Lung",
  "Pulmones": "Lungs",
  "Quito": "Quito",
  "Radiotelegrafia": "Radiotelegraphy",
  "Refactorizacion": "Refactoring",
  "Reflexion": "Reflection",
  "Regiones polares": "Polar regions",
  "Reino Unido": "United Kingdom",
  "Regular glucosa": "Regulate glucose",
  "Regular metabolismo": "Regulate metabolism",
  "Republica Dominicana": "Dominican Republic",
  "Rinon": "Kidney",
  "Rinones": "Kidneys",
  "Roma": "Rome",
  "Rombo": "Rhombus",
  "Rugby": "Rugby",
  "Santo Domingo": "Santo Domingo",
  "Saturno": "Saturn",
  "Selva americana": "American rainforest",
  "Selva humeda": "Rainforest",
  "Seul": "Seoul",
  "Silicio": "Silicon",
  "Sincronizacion de correo en servidor": "Server-side email synchronization",
  "Sistema de corriente alterna": "Alternating current system",
  "Sistema principal de memoria": "Main memory system",
  "Sodio": "Sodium",
  "Sucre": "Sucre",
  "Sudafrica": "South Africa",
  "Suecia": "Sweden",
  "Suiza": "Switzerland",
  "Tailandia": "Thailand",
  "Tegucigalpa": "Tegucigalpa",
  "Telefono": "Telephone",
  "Tenis": "Tennis",
  "Termometro": "Thermometer",
  "Tiroides": "Thyroid",
  "Tokio": "Tokyo",
  "Transferencia de archivos": "File transfer",
  "Transferencia de paginas web": "Web page transfer",
  "Transferencia web cifrada": "Encrypted web transfer",
  "Transporte orientado a conexion": "Connection-oriented transport",
  "Transporte sin conexion": "Connectionless transport",
  "Trapecio": "Trapezoid",
  "Triceps": "Triceps",
  "Turquia": "Turkey",
  "Tunel cifrado para trafico": "Encrypted traffic tunnel",
  "Ucrania": "Ukraine",
  "Unidad central de procesamiento": "Central processing unit",
  "Unidad de comunicacion principal": "Main communication unit",
  "Unidad de control de perifericos": "Peripheral control unit",
  "Unidad para distancias estelares grandes": "Unit for large stellar distances",
  "Uruguay": "Uruguay",
  "Varsovia": "Warsaw",
  "Vejiga": "Bladder",
  "Venezuela": "Venezuela",
  "Viena": "Vienna",
  "Vietnam": "Vietnam",
  "Via Lactea": "Milky Way",
  "Voltio": "Volt",
  "Watio": "Watt",
  "Wellington": "Wellington",
  "Yakarta": "Jakarta",
  "Yodo": "Iodine",
  "Zinc": "Zinc"
});

const CORE_PROMPT_TRANSLATIONS = Object.freeze({
  "Que planeta es conocido como el planeta rojo?": "Which planet is known as the red planet?",
  "Cual es la capital de Japon?": "What is the capital of Japan?",
  "Que lenguaje se ejecuta directamente en el navegador junto con HTML y CSS?":
    "Which language runs directly in the browser alongside HTML and CSS?",
  "Que estructura de datos sigue el principio LIFO?":
    "Which data structure follows the LIFO principle?",
  "Quien pinto La noche estrellada?": "Who painted The Starry Night?",
  "Cual es el oceano mas grande de la Tierra?": "What is the largest ocean on Earth?",
  "Cual es la formula quimica del agua?": "What is the chemical formula of water?",
  "Que cientifica descubrio el radio y el polonio?":
    "Which scientist discovered radium and polonium?",
  "En que anio llego el ser humano a la Luna por primera vez?":
    "In what year did humans first reach the Moon?",
  "Que organo bombea la sangre en el cuerpo humano?":
    "Which organ pumps blood in the human body?",
  "Que instrumento mide la temperatura?": "Which instrument measures temperature?",
  "Cuantos bits tiene un byte?": "How many bits are in a byte?",
  "Que numero binario representa el decimal 10?":
    "Which binary number represents decimal 10?",
  "Que continente tiene mas paises soberanos?":
    "Which continent has the most sovereign countries?",
  "Que deporte se juega en Roland Garros?": "Which sport is played at Roland Garros?",
  "Que escritor creo Don Quijote de la Mancha?":
    "Which writer created Don Quixote?",
  "Que fenomeno produce la separacion de colores en un prisma?":
    "Which phenomenon causes the separation of colors in a prism?",
  "Que gas necesitan las plantas para la fotosintesis?":
    "Which gas do plants need for photosynthesis?",
  "Que figura tiene todos sus lados iguales y cuatro angulos rectos?":
    "Which shape has all equal sides and four right angles?",
  "Que protocolo se usa para transferir paginas web?":
    "Which protocol is used to transfer web pages?",
  "Que pintor espaniol es autor de Guernica?":
    "Which Spanish painter is the author of Guernica?",
  "Cuantos minutos tiene una hora y media?":
    "How many minutes are in one hour and a half?",
  "Cual es el rio mas largo de Sudamerica?":
    "Which is the longest river in South America?",
  "Que musculo separa torax y abdomen y participa en la respiracion?":
    "Which muscle separates thorax and abdomen and helps breathing?",
  "Que pais organiza tradicionalmente el Tour de Francia?":
    "Which country traditionally hosts the Tour de France?",
  "Que significa CPU en informatica?": "What does CPU mean in computing?",
  "Que mar separa Europa de Africa en el estrecho de Gibraltar?":
    "Which sea separates Europe from Africa at the Strait of Gibraltar?",
  "Que numero primo es el menor mayor que 10?":
    "Which prime number is the smallest one greater than 10?",
  "Que estilo arquitectonico caracteriza a la Sagrada Familia?":
    "Which architectural style characterizes the Sagrada Familia?",
  "Que unidad mide la resistencia electrica?":
    "Which unit measures electrical resistance?"
});

const CORE_EXPLANATION_TRANSLATIONS = Object.freeze({
  "El color rojizo de Marte procede de oxidos de hierro.":
    "Mars looks reddish because of iron oxides.",
  "Tokio es la capital politica y economica de Japon.":
    "Tokyo is Japan's political and economic capital.",
  "JavaScript es el lenguaje nativo de la capa de comportamiento web.":
    "JavaScript is the native language for web behavior.",
  "LIFO significa Last In First Out, propio de una pila.":
    "LIFO means Last In, First Out, which is a stack behavior.",
  "La obra fue creada por Vincent van Gogh en 1889.":
    "The artwork was created by Vincent van Gogh in 1889.",
  "El Pacifico es el oceano de mayor extension.":
    "The Pacific is the largest ocean by area.",
  "Una molecula de agua combina dos atomos de hidrogeno y uno de oxigeno.":
    "A water molecule combines two hydrogen atoms and one oxygen atom.",
  "Marie Curie fue pionera en el estudio de la radiactividad.":
    "Marie Curie was a pioneer in the study of radioactivity.",
  "La mision Apollo 11 alunizo en 1969.":
    "The Apollo 11 mission landed on the Moon in 1969.",
  "El corazon impulsa la sangre por todo el sistema circulatorio.":
    "The heart pumps blood through the circulatory system.",
  "El termometro se usa para medir temperatura.":
    "A thermometer is used to measure temperature.",
  "Por convencion, un byte esta compuesto por 8 bits.":
    "By convention, one byte is made up of 8 bits.",
  "En base dos, 1010 equivale a 10 en decimal.":
    "In base two, 1010 equals 10 in decimal.",
  "Africa es el continente con mayor numero de estados reconocidos.":
    "Africa is the continent with the largest number of recognized states.",
  "Roland Garros es uno de los cuatro torneos Grand Slam de tenis.":
    "Roland Garros is one of the four tennis Grand Slam tournaments.",
  "Don Quijote fue escrito por Miguel de Cervantes.":
    "Don Quixote was written by Miguel de Cervantes.",
  "La dispersion separa la luz en longitudes de onda.":
    "Dispersion separates light into wavelengths.",
  "Las plantas capturan CO2 durante la fotosintesis.":
    "Plants absorb CO2 during photosynthesis.",
  "El cuadrado combina cuatro lados iguales y angulos de 90 grados.":
    "A square has four equal sides and 90-degree angles.",
  "HTTP/HTTPS es el protocolo principal para navegar web.":
    "HTTP/HTTPS is the main protocol for web browsing.",
  "Guernica fue pintado por Pablo Picasso en 1937.":
    "Guernica was painted by Pablo Picasso in 1937.",
  "Una hora son 60 minutos y media hora son 30.":
    "One hour is 60 minutes and half an hour is 30.",
  "El Amazonas es el rio mas largo y caudaloso de la region.":
    "The Amazon is the longest and most voluminous river in the region.",
  "El diafragma es clave para la respiracion pulmonar.":
    "The diaphragm is key for breathing.",
  "El Tour de Francia se disputa principalmente en territorio frances.":
    "The Tour de France is mainly raced in France.",
  "CPU corresponde a Central Processing Unit.":
    "CPU stands for Central Processing Unit.",
  "El Mediterraneo conecta ambos continentes en Gibraltar.":
    "The Mediterranean connects both continents at Gibraltar.",
  "11 es primo y es el primero por encima de 10.":
    "11 is prime and it is the first one above 10.",
  "La obra de Gaudi se enmarca en el modernismo catalan.":
    "Gaudi's work belongs to Catalan Modernism.",
  "La resistencia se mide en ohmios.":
    "Resistance is measured in ohms."
});

const PROMPT_PATTERNS = [
  {
    pattern: /^Cual es la capital de (.+)\?$/,
    translate: ([country], translateValue) => `What is the capital of ${translateValue(country)}?`
  },
  {
    pattern: /^Cual es el simbolo quimico de (.+)\?$/,
    translate: ([element], translateValue) =>
      `What is the chemical symbol for ${translateValue(element)}?`
  },
  {
    pattern: /^Cuanto es el (\d+)% de (\d+)\?$/,
    translate: ([percentage, base]) => `What is ${percentage}% of ${base}?`
  },
  {
    pattern: /^Cuanto es (.+)\?$/,
    translate: ([expression]) => `What is ${expression}?`
  },
  {
    pattern: /^Que valor en binario representa el decimal (\d+)\?$/,
    translate: ([value]) => `Which binary value represents decimal ${value}?`
  },
  {
    pattern: /^Que invento se asocia principalmente con (.+)\?$/,
    translate: ([inventor]) =>
      `Which invention is mainly associated with ${inventor}?`
  },
  {
    pattern: /^Que obra esta vinculada a (.+)\?$/,
    translate: ([composer]) => `Which work is linked to ${composer}?`
  },
  {
    pattern: /^Quien dirigio la pelicula (.+)\?$/,
    translate: ([film]) => `Who directed the movie ${film}?`
  },
  {
    pattern: /^Cual es la traduccion al ingles de "(.+)"\?$/,
    translate: ([word]) => `What is the English translation of "${word}"?`
  },
  {
    pattern: /^En que habitat vive principalmente el (.+)\?$/,
    translate: ([animal], translateValue) =>
      `In which habitat does the ${translateValue(animal)} mainly live?`
  },
  {
    pattern: /^Que definicion describe mejor el concepto "(.+)"\?$/,
    translate: ([concept], translateValue) =>
      `Which definition best describes the concept "${translateValue(concept)}"?`
  },
  {
    pattern: /^Que significa (.+) en economia\?$/,
    translate: ([concept], translateValue) =>
      `What does ${translateValue(concept)} mean in economics?`
  },
  {
    pattern: /^Que binario representa el decimal (\d+)\?$/,
    translate: ([value]) => `Which binary number represents decimal ${value}?`
  },
  {
    pattern: /^Que hexadecimal corresponde a (\d+) en decimal\?$/,
    translate: ([value]) =>
      `Which hexadecimal value corresponds to ${value} in decimal?`
  },
  {
    pattern: /^Cuantos KB son (\d+) MB si 1 MB = 1024 KB\?$/,
    translate: ([mb]) => `How many KB are ${mb} MB if 1 MB = 1024 KB?`
  },
  {
    pattern: /^Que describe mejor el termino (.+)\?$/,
    translate: ([term]) => `What best describes the term ${term}?`
  },
  {
    pattern: /^Que elemento corresponde al simbolo (.+)\?$/,
    translate: ([symbol]) => `Which element corresponds to symbol ${symbol}?`
  },
  {
    pattern: /^Cuantos mililitros son (\d+) litros\?$/,
    translate: ([liters]) => `How many milliliters are ${liters} liters?`
  },
  {
    pattern: /^Cual es la funcion principal de (.+)\?$/,
    translate: ([organ], translateValue) =>
      `What is the main function of ${translateValue(organ)}?`
  },
  {
    pattern: /^Si x=(.+); x\+=(.+); x\*=(.+); x-=(.+); cual es x al final\?$/,
    translate: ([a, b, c, d]) =>
      `If x=${a}; x+=${b}; x*=${c}; x-=${d}; what is x at the end?`
  },
  {
    pattern: /^Completa la serie (.+), \?$/,
    translate: ([sequence]) => `Complete the sequence ${sequence}, ?`
  },
  {
    pattern: /^Completa la progresion (.+), \?$/,
    translate: ([sequence]) => `Complete the progression ${sequence}, ?`
  },
  {
    pattern: /^Serie alterna (.+), \?$/,
    translate: ([sequence]) => `Alternating sequence ${sequence}, ?`
  },
  {
    pattern: /^En que anio ocurrio (.+)\?$/,
    translate: ([event], translateValue) =>
      `In what year did ${translateValue(event)} occur?`
  },
  {
    pattern: /^Que obra se asocia con (.+)\?$/,
    translate: ([artist]) => `Which work is associated with ${artist}?`
  },
  {
    pattern: /^Que disciplina corresponde a (.+)\?$/,
    translate: ([event]) => `Which discipline corresponds to ${event}?`
  },
  {
    pattern: /^Que obra escribio (.+)\?$/,
    translate: ([author]) => `Which work was written by ${author}?`
  },
  {
    pattern: /^Que obra se vincula con (.+)\?$/,
    translate: ([composer]) => `Which work is linked to ${composer}?`
  },
  {
    pattern: /^Como se traduce "(.+)" al ingles\?$/,
    translate: ([word]) => `How do you translate "${word}" into English?`
  },
  {
    pattern: /^En que habitat vive (.+)\?$/,
    translate: ([animal], translateValue) =>
      `In which habitat does ${translateValue(animal)} live?`
  },
  {
    pattern: /^Que define mejor el concepto "(.+)"\?$/,
    translate: ([concept], translateValue) =>
      `What best defines the concept "${translateValue(concept)}"?`
  },
  {
    pattern: /^Que significa (.+)\?$/,
    translate: ([concept], translateValue) =>
      `What does ${translateValue(concept)} mean?`
  },
  {
    pattern: /^(.+)\. Cual es la respuesta correcta\?$/,
    translate: ([fact], translateValue) =>
      `${translateValue(fact)}. What is the correct answer?`
  },
  {
    pattern: /^Que beneficio aporta "(.+)"\?$/,
    translate: ([habit], translateValue) =>
      `What benefit does "${translateValue(habit)}" provide?`
  },
  {
    pattern: /^De donde es tradicional el plato (.+)\?$/,
    translate: ([dish]) => `Where is the dish ${dish} traditionally from?`
  }
];

const EXPLANATION_PATTERNS = [
  {
    pattern: /^(.+) es la capital de (.+)\.$/,
    translate: ([capital, country], translateValue) =>
      `${translateValue(capital)} is the capital of ${translateValue(country)}.`
  },
  {
    pattern: /^El simbolo de (.+) es (.+)\.$/,
    translate: ([element, symbol], translateValue) =>
      `The symbol of ${translateValue(element)} is ${symbol}.`
  },
  {
    pattern: /^(\d+) en base 10 equivale a (.+) en base 2\.$/,
    translate: ([decimal, binary]) =>
      `${decimal} in base 10 is ${binary} in base 2.`
  },
  {
    pattern: /^(.+) esta asociado con (.+)\.$/,
    translate: ([left, right], translateValue) =>
      `${translateValue(left)} is associated with ${translateValue(right)}.`
  },
  {
    pattern: /^(.+) es una obra emblematica de (.+)\.$/,
    translate: ([work, composer], translateValue) =>
      `${translateValue(work)} is a signature work by ${translateValue(composer)}.`
  },
  {
    pattern: /^(.+) fue dirigida por (.+)\.$/,
    translate: ([film, director]) => `${film} was directed by ${director}.`
  },
  {
    pattern: /^La traduccion correcta de (.+) es (.+)\.$/,
    translate: ([sourceWord, targetWord], translateValue) =>
      `The correct translation of ${translateValue(sourceWord)} is ${translateValue(targetWord)}.`
  },
  {
    pattern: /^El (.+) se asocia sobre todo con (.+)\.$/,
    translate: ([animal, habitat], translateValue) =>
      `The ${translateValue(animal)} is mainly associated with ${translateValue(habitat)}.`
  },
  {
    pattern: /^(.+) se refiere a: (.+)\.$/,
    translate: ([concept, definition], translateValue) =>
      `${translateValue(concept)} refers to: ${translateValue(definition)}.`
  },
  {
    pattern: /^El (\d+)% de (\d+) es (\d+)\.$/,
    translate: ([percentage, base, result]) =>
      `${percentage}% of ${base} is ${result}.`
  },
  {
    pattern: /^(\d+) en binario es (.+)\.$/,
    translate: ([decimal, binary]) => `${decimal} in binary is ${binary}.`
  },
  {
    pattern: /^(\d+) en hexadecimal es (.+)\.$/,
    translate: ([decimal, hexadecimal]) =>
      `${decimal} in hexadecimal is ${hexadecimal}.`
  },
  {
    pattern: /^(\d+) MB son (\d+) KB\.$/,
    translate: ([mb, kb]) => `${mb} MB are ${kb} KB.`
  },
  {
    pattern: /^(.+) se representa con (.+)\.$/,
    translate: ([element, symbol], translateValue) =>
      `${translateValue(element)} is represented by ${symbol}.`
  },
  {
    pattern: /^El simbolo (.+) corresponde a (.+)\.$/,
    translate: ([symbol, element], translateValue) =>
      `The symbol ${symbol} corresponds to ${translateValue(element)}.`
  },
  {
    pattern: /^(\d+) litros equivalen a (\d+) ml\.$/,
    translate: ([liters, milliliters]) =>
      `${liters} liters equal ${milliliters} ml.`
  },
  {
    pattern: /^La serie aumenta de (\d+) en (\d+), por eso sigue (\d+)\.$/,
    translate: ([step, _stepAgain, nextValue]) =>
      `The sequence increases by ${step}, so the next value is ${nextValue}.`
  },
  {
    pattern: /^Cada termino se multiplica por (\d+); sigue (\d+)\.$/,
    translate: ([ratio, nextValue]) =>
      `Each term is multiplied by ${ratio}; the next value is ${nextValue}.`
  },
  {
    pattern: /^El patron alterna \+(\d+) y -(\d+)\. El siguiente es (\d+)\.$/,
    translate: ([up, down, nextValue]) =>
      `The pattern alternates +${up} and -${down}. The next value is ${nextValue}.`
  },
  {
    pattern: /^(.+) se asocia con el anio (.+)\.$/,
    translate: ([event, year], translateValue) =>
      `${translateValue(event)} is associated with the year ${year}.`
  },
  {
    pattern: /^(.+) fue creada por (.+)\.$/,
    translate: ([work, artist], translateValue) =>
      `${translateValue(work)} was created by ${translateValue(artist)}.`
  },
  {
    pattern: /^(.+) pertenece a (.+)\.$/,
    translate: ([event, discipline], translateValue) =>
      `${translateValue(event)} belongs to ${translateValue(discipline)}.`
  },
  {
    pattern: /^(.+) fue escrito por (.+)\.$/,
    translate: ([book, author], translateValue) =>
      `${translateValue(book)} was written by ${translateValue(author)}.`
  },
  {
    pattern: /^(.+) en ingles es (.+)\.$/,
    translate: ([sourceWord, englishWord], translateValue) =>
      `${translateValue(sourceWord)} in English is ${translateValue(englishWord)}.`
  },
  {
    pattern: /^(.+) vive principalmente en (.+)\.$/,
    translate: ([animal, habitat], translateValue) =>
      `${translateValue(animal)} mainly lives in ${translateValue(habitat)}.`
  },
  {
    pattern: /^(.+) ayuda a (.+)\.$/,
    translate: ([habit, benefit], translateValue) =>
      `${translateValue(habit)} helps to ${translateValue(benefit)}.`
  },
  {
    pattern: /^(.+) se asocia tradicionalmente a (.+)\.$/,
    translate: ([dish, origin], translateValue) =>
      `${translateValue(dish)} is traditionally associated with ${translateValue(origin)}.`
  },
  {
    pattern: /^(.+): (.+)\.$/,
    translate: ([concept, definition], translateValue) =>
      `${translateValue(concept)}: ${translateValue(definition)}.`
  }
];

const EN_QUESTION_CACHE = new WeakMap();

export const normalizeKnowledgeLocale = (locale) => {
  const normalized = String(locale || "").toLowerCase();
  return normalized.startsWith("es") ? "es" : "en";
};

const translateValue = (value) => {
  const text = String(value ?? "");
  if (VALUE_TRANSLATIONS[text]) {
    return VALUE_TRANSLATIONS[text];
  }

  const optionMatch = /^Opcion (\d+)$/.exec(text);
  if (optionMatch) {
    return `Option ${optionMatch[1]}`;
  }

  return text;
};

const applyPatternTranslations = (source, patternSet) => {
  for (const { pattern, translate } of patternSet) {
    const match = source.match(pattern);
    if (!match) {
      continue;
    }
    return translate(match.slice(1), translateValue);
  }
  return source;
};

const localizePromptToEnglish = (prompt) => {
  const text = String(prompt ?? "");
  if (CORE_PROMPT_TRANSLATIONS[text]) {
    return CORE_PROMPT_TRANSLATIONS[text];
  }
  return applyPatternTranslations(text, PROMPT_PATTERNS);
};

const localizeExplanationToEnglish = (explanation) => {
  const text = String(explanation ?? "");
  if (CORE_EXPLANATION_TRANSLATIONS[text]) {
    return CORE_EXPLANATION_TRANSLATIONS[text];
  }
  return applyPatternTranslations(text, EXPLANATION_PATTERNS);
};

export const localizeTopic = (topic, locale = "es") => {
  const resolvedLocale = normalizeKnowledgeLocale(locale);
  if (resolvedLocale === "es") {
    return topic;
  }
  return TOPIC_TRANSLATIONS[topic] ?? topic;
};

export const localizeDifficulty = (difficulty, locale = "es") => {
  const resolvedLocale = normalizeKnowledgeLocale(locale);
  if (resolvedLocale === "es") {
    return difficulty;
  }
  return DIFFICULTY_TRANSLATIONS[difficulty] ?? difficulty;
};

export const localizeQuestion = (question, locale = "es") => {
  if (!question) {
    return question;
  }

  const resolvedLocale = normalizeKnowledgeLocale(locale);
  if (resolvedLocale === "es") {
    return question;
  }

  const cached = EN_QUESTION_CACHE.get(question);
  if (cached) {
    return cached;
  }

  const localized = {
    ...question,
    prompt: localizePromptToEnglish(question.prompt),
    options: question.options.map((option) => translateValue(option)),
    explanation: localizeExplanationToEnglish(question.explanation),
    topic: localizeTopic(question.topic, resolvedLocale),
    difficulty: localizeDifficulty(question.difficulty, resolvedLocale)
  };

  EN_QUESTION_CACHE.set(question, localized);
  return localized;
};
