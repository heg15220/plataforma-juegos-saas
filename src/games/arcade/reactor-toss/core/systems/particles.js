import { clamp } from "../physics/constants";

const rand = (min, max) => min + Math.random() * (max - min);

export function createParticle(config) {
  return {
    x: config.x,
    y: config.y,
    vx: config.vx ?? 0,
    vy: config.vy ?? 0,
    lifeMs: config.lifeMs ?? 400,
    maxLifeMs: config.lifeMs ?? 400,
    size: config.size ?? 6,
    color: config.color ?? "#ffffff",
    alpha: config.alpha ?? 1,
    glow: config.glow ?? 0,
    shape: config.shape ?? "dot",
  };
}

export function spawnBurst(x, y, options = {}) {
  const {
    count = 8,
    color = "#ffffff",
    speed = 180,
    spread = Math.PI * 2,
    lifeMs = 380,
    size = 5,
    driftY = 0,
  } = options;

  return Array.from({ length: count }, (_, index) => {
    const angle = (spread / Math.max(1, count)) * index + rand(-0.2, 0.2);
    const magnitude = rand(speed * 0.55, speed);
    return createParticle({
      x,
      y,
      vx: Math.cos(angle) * magnitude,
      vy: Math.sin(angle) * magnitude + driftY,
      lifeMs: rand(lifeMs * 0.7, lifeMs * 1.05),
      size: rand(size * 0.6, size * 1.2),
      color,
      glow: size * 2.2,
    });
  });
}

export function spawnTrail(ball, color) {
  return createParticle({
    x: ball.x,
    y: ball.y,
    vx: rand(-18, 18),
    vy: rand(-18, 18),
    lifeMs: 220,
    size: rand(4, 7),
    color,
    alpha: 0.7,
    glow: 12,
  });
}

export function updateParticles(particles, dtMs) {
  particles.forEach((particle) => {
    particle.lifeMs -= dtMs;
    particle.x += particle.vx * (dtMs / 1000);
    particle.y += particle.vy * (dtMs / 1000);
    particle.vx *= 0.98;
    particle.vy *= 0.98;
    particle.alpha = clamp(particle.lifeMs / Math.max(1, particle.maxLifeMs), 0, 1);
  });

  return particles.filter((particle) => particle.lifeMs > 0);
}
