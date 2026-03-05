export function createSeededRng(seedInput) {
  let seed = (Number(seedInput) || 1) >>> 0;
  return function next() {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

export function range(rand, min, max) {
  return min + (max - min) * rand();
}

export function intRange(rand, min, max) {
  return Math.floor(range(rand, min, max + 1));
}

export function pick(rand, list) {
  return list[Math.floor(rand() * list.length) % list.length];
}
