const ELEMENT_IDENTITIES = [
  ["H", "Hidrogeno", "Hydrogen"],
  ["He", "Helio", "Helium"],
  ["Li", "Litio", "Lithium"],
  ["Be", "Berilio", "Beryllium"],
  ["B", "Boro", "Boron"],
  ["C", "Carbono", "Carbon"],
  ["N", "Nitrogeno", "Nitrogen"],
  ["O", "Oxigeno", "Oxygen"],
  ["F", "Fluor", "Fluorine"],
  ["Ne", "Neon", "Neon"],
  ["Na", "Sodio", "Sodium"],
  ["Mg", "Magnesio", "Magnesium"],
  ["Al", "Aluminio", "Aluminum"],
  ["Si", "Silicio", "Silicon"],
  ["P", "Fosforo", "Phosphorus"],
  ["S", "Azufre", "Sulfur"],
  ["Cl", "Cloro", "Chlorine"],
  ["Ar", "Argon", "Argon"],
  ["K", "Potasio", "Potassium"],
  ["Ca", "Calcio", "Calcium"],
  ["Sc", "Escandio", "Scandium"],
  ["Ti", "Titanio", "Titanium"],
  ["V", "Vanadio", "Vanadium"],
  ["Cr", "Cromo", "Chromium"],
  ["Mn", "Manganeso", "Manganese"],
  ["Fe", "Hierro", "Iron"],
  ["Co", "Cobalto", "Cobalt"],
  ["Ni", "Niquel", "Nickel"],
  ["Cu", "Cobre", "Copper"],
  ["Zn", "Zinc", "Zinc"],
  ["Ga", "Galio", "Gallium"],
  ["Ge", "Germanio", "Germanium"],
  ["As", "Arsenico", "Arsenic"],
  ["Se", "Selenio", "Selenium"],
  ["Br", "Bromo", "Bromine"],
  ["Kr", "Kripton", "Krypton"],
  ["Rb", "Rubidio", "Rubidium"],
  ["Sr", "Estroncio", "Strontium"],
  ["Y", "Itrio", "Yttrium"],
  ["Zr", "Circonio", "Zirconium"],
  ["Nb", "Niobio", "Niobium"],
  ["Mo", "Molibdeno", "Molybdenum"],
  ["Tc", "Tecnecio", "Technetium"],
  ["Ru", "Rutenio", "Ruthenium"],
  ["Rh", "Rodio", "Rhodium"],
  ["Pd", "Paladio", "Palladium"],
  ["Ag", "Plata", "Silver"],
  ["Cd", "Cadmio", "Cadmium"],
  ["In", "Indio", "Indium"],
  ["Sn", "Estano", "Tin"],
  ["Sb", "Antimonio", "Antimony"],
  ["Te", "Telurio", "Tellurium"],
  ["I", "Yodo", "Iodine"],
  ["Xe", "Xenon", "Xenon"],
  ["Cs", "Cesio", "Cesium"],
  ["Ba", "Bario", "Barium"],
  ["La", "Lantano", "Lanthanum"],
  ["Ce", "Cerio", "Cerium"],
  ["Pr", "Praseodimio", "Praseodymium"],
  ["Nd", "Neodimio", "Neodymium"],
  ["Pm", "Prometio", "Promethium"],
  ["Sm", "Samario", "Samarium"],
  ["Eu", "Europio", "Europium"],
  ["Gd", "Gadolinio", "Gadolinium"],
  ["Tb", "Terbio", "Terbium"],
  ["Dy", "Disprosio", "Dysprosium"],
  ["Ho", "Holmio", "Holmium"],
  ["Er", "Erbio", "Erbium"],
  ["Tm", "Tulio", "Thulium"],
  ["Yb", "Iterbio", "Ytterbium"],
  ["Lu", "Lutecio", "Lutetium"],
  ["Hf", "Hafnio", "Hafnium"],
  ["Ta", "Tantalio", "Tantalum"],
  ["W", "Wolframio", "Tungsten"],
  ["Re", "Renio", "Rhenium"],
  ["Os", "Osmio", "Osmium"],
  ["Ir", "Iridio", "Iridium"],
  ["Pt", "Platino", "Platinum"],
  ["Au", "Oro", "Gold"],
  ["Hg", "Mercurio", "Mercury"],
  ["Tl", "Talio", "Thallium"],
  ["Pb", "Plomo", "Lead"],
  ["Bi", "Bismuto", "Bismuth"],
  ["Po", "Polonio", "Polonium"],
  ["At", "Astato", "Astatine"],
  ["Rn", "Radon", "Radon"],
  ["Fr", "Francio", "Francium"],
  ["Ra", "Radio", "Radium"],
  ["Ac", "Actinio", "Actinium"],
  ["Th", "Torio", "Thorium"],
  ["Pa", "Protactinio", "Protactinium"],
  ["U", "Uranio", "Uranium"],
  ["Np", "Neptunio", "Neptunium"],
  ["Pu", "Plutonio", "Plutonium"],
  ["Am", "Americio", "Americium"],
  ["Cm", "Curio", "Curium"],
  ["Bk", "Berkelio", "Berkelium"],
  ["Cf", "Californio", "Californium"],
  ["Es", "Einsteinio", "Einsteinium"],
  ["Fm", "Fermio", "Fermium"],
  ["Md", "Mendelevio", "Mendelevium"],
  ["No", "Nobelio", "Nobelium"],
  ["Lr", "Lawrencio", "Lawrencium"],
  ["Rf", "Rutherfordio", "Rutherfordium"],
  ["Db", "Dubnio", "Dubnium"],
  ["Sg", "Seaborgio", "Seaborgium"],
  ["Bh", "Bohrio", "Bohrium"],
  ["Hs", "Hassio", "Hassium"],
  ["Mt", "Meitnerio", "Meitnerium"],
  ["Ds", "Darmstadtio", "Darmstadtium"],
  ["Rg", "Roentgenio", "Roentgenium"],
  ["Cn", "Copernicio", "Copernicium"],
  ["Nh", "Nihonio", "Nihonium"],
  ["Fl", "Flerovio", "Flerovium"],
  ["Mc", "Moscovio", "Moscovium"],
  ["Lv", "Livermorio", "Livermorium"],
  ["Ts", "Teneso", "Tennessine"],
  ["Og", "Oganeson", "Oganesson"]
];

const range = (from, to) =>
  Array.from({ length: to - from + 1 }, (_, index) => from + index);

const positionByAtomic = new Map();

const assignSequential = (startAtomic, row, columns) => {
  let atomic = startAtomic;
  columns.forEach((col) => {
    positionByAtomic.set(atomic, { row, col });
    atomic += 1;
  });
};

assignSequential(1, 1, [1, 18]);
assignSequential(3, 2, [1, 2, 13, 14, 15, 16, 17, 18]);
assignSequential(11, 3, [1, 2, 13, 14, 15, 16, 17, 18]);
assignSequential(19, 4, range(1, 18));
assignSequential(37, 5, range(1, 18));
assignSequential(55, 6, [1, 2]);
assignSequential(72, 6, range(4, 18));
assignSequential(87, 7, [1, 2]);
assignSequential(104, 7, range(4, 18));
assignSequential(57, 8, range(3, 17));
assignSequential(89, 9, range(3, 17));

const resolveSeries = (atomicNumber) => {
  if (atomicNumber >= 57 && atomicNumber <= 71) return "lanthanide";
  if (atomicNumber >= 89 && atomicNumber <= 103) return "actinide";
  return "main";
};

const resolvePeriod = (row) => (row >= 8 ? row - 2 : row);

export const PERIODIC_TABLE_ELEMENTS = ELEMENT_IDENTITIES.map(
  ([symbol, nameEs, nameEn], index) => {
    const atomicNumber = index + 1;
    const position = positionByAtomic.get(atomicNumber);
    if (!position) {
      throw new Error(`Missing periodic table position for atomic number ${atomicNumber}`);
    }

    const period = resolvePeriod(position.row);
    const group = position.row <= 7 ? position.col : null;

    return {
      atomicNumber,
      symbol,
      nameEs,
      nameEn,
      row: position.row,
      col: position.col,
      period,
      group,
      series: resolveSeries(atomicNumber)
    };
  }
);

export const PERIODIC_TABLE_ELEMENT_COUNT = PERIODIC_TABLE_ELEMENTS.length;

export const PERIODIC_TABLE_PLACEHOLDERS = [
  {
    id: "lanthanides-bridge",
    row: 6,
    col: 3,
    label: "57-71"
  },
  {
    id: "actinides-bridge",
    row: 7,
    col: 3,
    label: "89-103"
  }
];

export const PERIODIC_TABLE_BY_ATOMIC = new Map(
  PERIODIC_TABLE_ELEMENTS.map((element) => [element.atomicNumber, element])
);

export const PERIODIC_TABLE_BY_GRID = new Map(
  PERIODIC_TABLE_ELEMENTS.map((element) => [`${element.row},${element.col}`, element.atomicNumber])
);

export const PERIODIC_TABLE_PLACEHOLDER_BY_GRID = new Map(
  PERIODIC_TABLE_PLACEHOLDERS.map((placeholder) => [`${placeholder.row},${placeholder.col}`, placeholder])
);
