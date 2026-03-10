const DEG_TO_RAD = Math.PI / 180;
const MIN_POINT_GAP = 70;
const STRAIGHT_STEP_MM = 220;
const ARC_STEP_MM = 170;

const bcmStraight = (lengthMm) => [0, lengthMm];
const bcmLeft = (angleDeg, radiusMm) => [Math.abs(angleDeg), radiusMm];
const bcmRight = (angleDeg, radiusMm) => [-Math.abs(angleDeg), radiusMm];
const bcmAutoCurveLeft = () => [1, 0];
const bcmAutoCurveRight = () => [-1, 0];
const bcmAutoStraight = () => [0, 0];

function appendPoint(points, x, y) {
  const last = points[points.length - 1];
  if (!last || Math.hypot(last[0] - x, last[1] - y) >= MIN_POINT_GAP) {
    points.push([x, y]);
  }
}

function normalizePositiveDegrees(value) {
  return ((value % 360) + 360) % 360;
}

function forwardVector(heading) {
  return [Math.cos(heading), Math.sin(heading)];
}

function leftVector(heading) {
  return [-Math.sin(heading), Math.cos(heading)];
}

function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1];
}

function add(a, b) {
  return [a[0] + b[0], a[1] + b[1]];
}

function subtract(a, b) {
  return [a[0] - b[0], a[1] - b[1]];
}

function scale(vector, factor) {
  return [vector[0] * factor, vector[1] * factor];
}

function advanceTurn(point, heading, signedAngleDeg, radiusMm) {
  const turnDirection = Math.sign(signedAngleDeg);
  const arcAngle = Math.abs(signedAngleDeg) * DEG_TO_RAD;
  const centerX = point[0] - Math.sin(heading) * radiusMm * turnDirection;
  const centerY = point[1] + Math.cos(heading) * radiusMm * turnDirection;
  const startAngle = Math.atan2(point[1] - centerY, point[0] - centerX);
  const endAngle = startAngle + arcAngle * turnDirection;
  return [
    centerX + Math.cos(endAngle) * radiusMm,
    centerY + Math.sin(endAngle) * radiusMm,
  ];
}

function simulateTramos(origin, tramos, withPoints = true) {
  let x = origin[0];
  let y = origin[1];
  let heading = Math.atan2(origin[3], origin[2]);
  const points = withPoints ? [[x, y]] : null;

  for (const [tipo, magnitude] of tramos) {
    if (tipo === 0) {
      const steps = Math.max(1, Math.ceil(magnitude / STRAIGHT_STEP_MM));
      for (let step = 1; step <= steps; step += 1) {
        const distance = (magnitude * step) / steps;
        if (withPoints) {
          appendPoint(points, x + Math.cos(heading) * distance, y + Math.sin(heading) * distance);
        }
      }
      x += Math.cos(heading) * magnitude;
      y += Math.sin(heading) * magnitude;
      continue;
    }

    const turnDirection = Math.sign(tipo);
    const arcAngle = Math.abs(tipo) * DEG_TO_RAD;
    const radius = magnitude;
    const centerX = x - Math.sin(heading) * radius * turnDirection;
    const centerY = y + Math.cos(heading) * radius * turnDirection;
    const startAngle = Math.atan2(y - centerY, x - centerX);
    const steps = Math.max(3, Math.ceil((radius * arcAngle) / ARC_STEP_MM));

    for (let step = 1; step <= steps; step += 1) {
      const theta = startAngle + (arcAngle * step * turnDirection) / steps;
      if (withPoints) {
        appendPoint(points, centerX + Math.cos(theta) * radius, centerY + Math.sin(theta) * radius);
      }
    }

    const endAngle = startAngle + arcAngle * turnDirection;
    x = centerX + Math.cos(endAngle) * radius;
    y = centerY + Math.sin(endAngle) * radius;
    heading += arcAngle * turnDirection;
  }

  return { x, y, heading, points: points || [] };
}

function solveRadius(evalCandidate) {
  let best = null;
  let minRadius = 80;
  let maxRadius = 3200;
  let step = 40;

  for (let pass = 0; pass < 4; pass += 1) {
    for (let radius = minRadius; radius <= maxRadius; radius += step) {
      const candidate = evalCandidate(radius);
      if (!candidate) {
        continue;
      }
      if (!best || candidate.score < best.score) {
        best = candidate;
      }
    }
    if (!best) {
      return null;
    }
    minRadius = Math.max(40, best.radius - step);
    maxRadius = best.radius + step;
    step /= 4;
  }

  return best;
}

function solveAutoClose(origin, tramos) {
  if (tramos.length < 2) {
    return tramos;
  }

  const penultimate = tramos[tramos.length - 2];
  const last = tramos[tramos.length - 1];
  const fixedTramos = tramos.slice(0, -2);
  const fixedState = simulateTramos(origin, fixedTramos, false);
  const currentPoint = [fixedState.x, fixedState.y];
  const currentHeading = fixedState.heading;
  const startPoint = [origin[0], origin[1]];
  const startHeading = Math.atan2(origin[3], origin[2]);
  const headingDeltaDeg = (startHeading - currentHeading) / DEG_TO_RAD;
  const remainingAngleFor = (sign) => {
    const positive = normalizePositiveDegrees(headingDeltaDeg);
    const negative = normalizePositiveDegrees(-headingDeltaDeg);
    const remaining = sign > 0 ? positive : negative;
    return remaining < 1 ? 360 : remaining;
  };

  if (penultimate[0] === 0 && last[1] === 0 && Math.abs(last[0]) === 1) {
    const curveSign = Math.sign(last[0]);
    const curveAngleDeg = remainingAngleFor(curveSign);
    const best = solveRadius((radius) => {
      const curveStartHeading = startHeading - curveSign * curveAngleDeg * DEG_TO_RAD;
      const center = add(startPoint, scale(leftVector(startHeading), curveSign * radius));
      const curveStart = subtract(center, scale(leftVector(curveStartHeading), curveSign * radius));
      const ray = subtract(curveStart, currentPoint);
      const straightLength = dot(ray, forwardVector(currentHeading));
      const perpendicularError = dot(ray, leftVector(currentHeading));
      if (straightLength < 0) {
        return null;
      }
      return {
        radius,
        straightLength,
        score: Math.abs(perpendicularError) + Math.max(0, 80 - straightLength) * 5,
      };
    });

    if (best) {
      return [
        ...fixedTramos,
        [0, best.straightLength],
        [curveSign * curveAngleDeg, best.radius],
      ];
    }
  }

  if (Math.abs(penultimate[0]) === 1 && penultimate[1] === 0 && last[0] === 0) {
    const curveSign = Math.sign(penultimate[0]);
    const curveAngleDeg = remainingAngleFor(curveSign);
    const best = solveRadius((radius) => {
      const curveEnd = advanceTurn(currentPoint, currentHeading, curveSign * curveAngleDeg, radius);
      const ray = subtract(startPoint, curveEnd);
      const straightLength = dot(ray, forwardVector(startHeading));
      const perpendicularError = dot(ray, leftVector(startHeading));
      if (straightLength < 0) {
        return null;
      }
      return {
        radius,
        straightLength,
        score: Math.abs(perpendicularError) + Math.max(0, 80 - straightLength) * 5,
      };
    });

    if (best) {
      return [
        ...fixedTramos,
        [curveSign * curveAngleDeg, best.radius],
        [0, best.straightLength],
      ];
    }
  }

  return tramos;
}

function compileBlueprint(blueprint) {
  const solvedTramos = solveAutoClose(blueprint.origin, blueprint.tramos);
  const { x, y, points } = simulateTramos(blueprint.origin, solvedTramos, true);
  const startX = blueprint.origin[0];
  const startY = blueprint.origin[1];
  const endGap = Math.hypot(x - startX, y - startY);

  if (endGap > 1) {
    appendPoint(points, startX, startY);
  }
  if (
    points.length > 2 &&
    Math.hypot(points[0][0] - points[points.length - 1][0], points[0][1] - points[points.length - 1][1]) < MIN_POINT_GAP
  ) {
    points.pop();
  }

  return {
    ...blueprint,
    tramos: solvedTramos,
    raw: points,
  };
}

const BLUEPRINTS = [
  {
    id: 0,
    envId: "neon-city",
    name: { es: "Costa Azul GP", en: "Azure Coast GP" },
    classification: { es: "Semipermanente", en: "Semi-permanent" },
    layoutLabel: { es: "Tecnico lento", en: "Slow technical" },
    note: {
      es: "Trazado compacto de muchas curvas lentas y medias, basado en el modelo de tramos del motor basic-circuit-maker.",
      en: "Compact layout with many slow and medium-speed corners, built from the basic-circuit-maker segment model.",
    },
    distanceKm: "4.2 km",
    turns: 14,
    overtaking: { es: "Baja", en: "Low" },
    profile: { es: "Carga alta", en: "High downforce" },
    poleSide: "left",
    trackWidth: 66,
    startS: 0.018,
    dimensionsMm: [5000, 2000],
    origin: [1130, 360, 1, 0],
    tramos: [
      bcmStraight(2740),
      bcmLeft(210, 650),
      bcmStraight(878),
      bcmRight(60, 570),
      bcmAutoStraight(),
      bcmAutoCurveLeft(),
    ],
  },
  {
    id: 1,
    envId: "volcano",
    name: { es: "Sierra Verde GP", en: "Sierra Verde GP" },
    classification: { es: "Permanente", en: "Permanent" },
    layoutLabel: { es: "Power lap", en: "Power lap" },
    note: {
      es: "Circuito de potencia con una recta principal larga, frenadas serias y un cierre rapido de apoyo.",
      en: "Power circuit with a long main straight, hard braking zones, and a quick support-based final sector.",
    },
    distanceKm: "4.6 km",
    turns: 10,
    overtaking: { es: "Alta", en: "High" },
    profile: { es: "Carga media-baja", en: "Medium-low downforce" },
    poleSide: "right",
    trackWidth: 74,
    startS: 0.018,
    dimensionsMm: [4000, 2000],
    origin: [1420, 200, 1, 0],
    tramos: [
      bcmStraight(1800),
      bcmLeft(140, 530),
      bcmStraight(750),
      bcmLeft(95, 500),
      bcmRight(83, 500),
      bcmStraight(700),
      bcmLeft(45, 520),
      bcmLeft(100, 500),
      bcmAutoStraight(),
      bcmAutoCurveLeft(),
    ],
  },
  {
    id: 2,
    envId: "arctic",
    name: { es: "Nordhaven Ring", en: "Nordhaven Ring" },
    classification: { es: "Costero", en: "Coastal" },
    layoutLabel: { es: "Stop-go", en: "Stop-go" },
    note: {
      es: "Dos rectas largas, angulos rectos y cierre automatico con el mismo esquema de tramos del repositorio base.",
      en: "Two long straights, right-angle braking zones, and an auto-closed layout built with the same segment scheme as the source repository.",
    },
    distanceKm: "4.9 km",
    turns: 8,
    overtaking: { es: "Alta", en: "High" },
    profile: { es: "Traccion y frenada", en: "Traction and braking" },
    poleSide: "left",
    trackWidth: 72,
    startS: 0.02,
    dimensionsMm: [5400, 2400],
    origin: [1000, 340, 1, 0],
    tramos: [
      bcmStraight(1600),
      bcmLeft(90, 260),
      bcmStraight(500),
      bcmLeft(90, 260),
      bcmStraight(1500),
      bcmLeft(90, 260),
      bcmAutoCurveLeft(),
      bcmAutoStraight(),
    ],
  },
  {
    id: 3,
    envId: "jungle",
    name: { es: "Emerald Forest GP", en: "Emerald Forest GP" },
    classification: { es: "Permanente", en: "Permanent" },
    layoutLabel: { es: "Flow rapido", en: "Fast flow" },
    note: {
      es: "Secuencia enlazada de apoyos y cambios de direccion rapidos, inspirada en layouts de alta velocidad sin cruces.",
      en: "Linked sequence of support corners and quick direction changes, inspired by high-speed layouts without self-crossings.",
    },
    distanceKm: "5.2 km",
    turns: 13,
    overtaking: { es: "Media", en: "Medium" },
    profile: { es: "Carga media", en: "Medium downforce" },
    poleSide: "left",
    trackWidth: 70,
    startS: 0.018,
    dimensionsMm: [5000, 2500],
    origin: [1000, 280, -1, 0],
    tramos: [
      bcmRight(90, 700),
      bcmStraight(750),
      bcmRight(190, 500),
      bcmStraight(310),
      bcmLeft(100, 500),
      bcmStraight(20),
      bcmLeft(6, 700),
      bcmRight(17, 700),
      bcmLeft(22, 700),
      bcmRight(22, 700),
      bcmLeft(22, 700),
      bcmRight(22, 700),
      bcmLeft(22, 700),
      bcmRight(17, 700),
      bcmLeft(6, 700),
      bcmStraight(20),
      bcmLeft(207, 500),
      bcmStraight(950),
      bcmRight(207, 520),
      bcmStraight(1250),
      bcmRight(40, 1300),
      bcmRight(20, 720),
      bcmRight(10, 480),
      bcmRight(10, 1000),
      bcmRight(10, 1000),
      bcmRight(25, 1300),
      bcmAutoCurveRight(),
      bcmAutoStraight(),
    ],
  },
  {
    id: 4,
    envId: "desert",
    name: { es: "Sol Dunes Speedway", en: "Sol Dunes Speedway" },
    classification: { es: "Speedway", en: "Speedway" },
    layoutLabel: { es: "Oval", en: "Oval" },
    note: {
      es: "Oval puro de largas aceleraciones con dos curvas constantes y mucha estela.",
      en: "Pure oval with long acceleration zones, constant banking and heavy slipstreaming.",
    },
    distanceKm: "4.1 km",
    turns: 4,
    overtaking: { es: "Muy alta", en: "Very high" },
    profile: { es: "Baja carga", en: "Low downforce" },
    poleSide: "left",
    trackWidth: 86,
    startS: 0.02,
    dimensionsMm: [3000, 2000],
    origin: [1070, 430, 1, 0],
    tramos: [
      bcmStraight(860),
      bcmLeft(180, 570),
      bcmAutoStraight(),
      bcmAutoCurveLeft(),
    ],
  },
  {
    id: 5,
    envId: "space",
    name: { es: "Capital Grand Prix", en: "Capital Grand Prix" },
    classification: { es: "Grand Prix", en: "Grand Prix" },
    layoutLabel: { es: "Modern GP", en: "Modern GP" },
    note: {
      es: "Layout largo y moderno con primer sector tecnico, parte central enlazada y retorno amplio a la recta.",
      en: "Long modern layout with a technical first sector, linked middle section, and a broad return onto the straight.",
    },
    distanceKm: "5.7 km",
    turns: 17,
    overtaking: { es: "Media-alta", en: "Medium-high" },
    profile: { es: "Balanceado", en: "Balanced" },
    poleSide: "right",
    trackWidth: 72,
    startS: 0.018,
    dimensionsMm: [7000, 2000],
    origin: [4200, 200, 1, 0],
    tramos: [
      bcmStraight(2000),
      bcmLeft(165, 530),
      bcmStraight(700),
      bcmLeft(90, 480),
      bcmRight(75, 600),
      bcmRight(60, 480),
      bcmStraight(750),
      bcmLeft(45, 520),
      bcmLeft(115, 480),
      bcmRight(145, 480),
      bcmStraight(1200),
      bcmLeft(170, 500),
      bcmLeft(55, 1900),
      bcmStraight(1000),
      bcmLeft(30, 480),
      bcmRight(60, 480),
      bcmAutoCurveLeft(),
      bcmAutoStraight(),
    ],
  },
];

export const RACE2DPRO_CIRCUITS = BLUEPRINTS.map(compileBlueprint);
