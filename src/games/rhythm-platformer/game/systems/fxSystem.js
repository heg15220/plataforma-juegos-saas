function randomRange(min, max) {
  return min + Math.random() * (max - min);
}

export function createFxSystem(maxParticles = 420) {
  const particles = new Array(maxParticles);
  for (let i = 0; i < maxParticles; i += 1) {
    particles[i] = {
      active: false,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      life: 0,
      maxLife: 1,
      size: 2,
      rot: 0,
      vr: 0,
      alpha: 0,
      color: "#ffffff",
      shape: "dot",
    };
  }

  return {
    particles,
    cursor: 0,
    shakeX: 0,
    shakeY: 0,
    shakePower: 0,
    shakeDecay: 0,
    flashColor: "#ffffff",
    flashAlpha: 0,
    beatBloom: 0,
  };
}

function acquireParticle(fx) {
  const particle = fx.particles[fx.cursor];
  fx.cursor = (fx.cursor + 1) % fx.particles.length;
  return particle;
}

export function pushParticle(fx, props) {
  const particle = acquireParticle(fx);
  particle.active = true;
  particle.x = props.x;
  particle.y = props.y;
  particle.vx = props.vx ?? 0;
  particle.vy = props.vy ?? 0;
  particle.life = props.life ?? 0.5;
  particle.maxLife = particle.life;
  particle.size = props.size ?? 3;
  particle.rot = props.rot ?? 0;
  particle.vr = props.vr ?? 0;
  particle.alpha = props.alpha ?? 1;
  particle.color = props.color ?? "#ffffff";
  particle.shape = props.shape ?? "dot";
}

export function spawnPerfectJumpFx(fx, x, y, color) {
  for (let i = 0; i < 24; i += 1) {
    const angle = (Math.PI * 2 * i) / 24;
    const speed = randomRange(86, 214);
    pushParticle(fx, {
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: randomRange(0.26, 0.54),
      size: randomRange(2, 5),
      color,
      shape: i % 4 === 0 ? "line" : "dot",
      vr: randomRange(-5, 5),
    });
  }

  for (let i = 0; i < 18; i += 1) {
    pushParticle(fx, {
      x,
      y,
      vx: randomRange(-36, 36),
      vy: randomRange(-160, -80),
      life: randomRange(0.35, 0.6),
      size: randomRange(1.4, 3.2),
      color: "#d7fff6",
      shape: "spark",
      vr: randomRange(-9, 9),
    });
  }

  fx.flashColor = "#86ffd0";
  fx.flashAlpha = 0.22;
}

export function spawnPickupFx(fx, x, y) {
  for (let i = 0; i < 20; i += 1) {
    const angle = randomRange(0, Math.PI * 2);
    const speed = randomRange(45, 150);
    pushParticle(fx, {
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 28,
      life: randomRange(0.3, 0.7),
      size: randomRange(1.6, 4),
      color: i % 2 === 0 ? "#7ae8ff" : "#ffe38e",
      shape: i % 3 === 0 ? "spark" : "dot",
      vr: randomRange(-7, 7),
    });
  }
}

export function spawnDamageFx(fx, x, y) {
  for (let i = 0; i < 30; i += 1) {
    pushParticle(fx, {
      x: x + randomRange(-22, 22),
      y: y + randomRange(-22, 22),
      vx: randomRange(-280, 280),
      vy: randomRange(-260, 260),
      life: randomRange(0.12, 0.28),
      size: randomRange(1, 4),
      color: i % 2 === 0 ? "#ff546f" : "#ffe1e5",
      shape: "line",
      vr: randomRange(-9, 9),
    });
  }
  fx.shakePower = Math.max(fx.shakePower, 11);
  fx.shakeDecay = Math.max(fx.shakeDecay, 13);
  fx.flashColor = "#ff3a57";
  fx.flashAlpha = 0.38;
}

export function spawnBurstFx(fx, x, y, boosted) {
  const ringCount = boosted ? 30 : 18;
  for (let i = 0; i < ringCount; i += 1) {
    const angle = (Math.PI * 2 * i) / ringCount;
    const speed = boosted ? randomRange(180, 320) : randomRange(120, 220);
    pushParticle(fx, {
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: randomRange(0.2, 0.46),
      size: randomRange(2, boosted ? 7 : 5),
      color: boosted ? "#ffe38e" : "#8ccfff",
      shape: "line",
      vr: randomRange(-4, 4),
    });
  }
  fx.flashColor = boosted ? "#ffe07a" : "#98deff";
  fx.flashAlpha = boosted ? 0.26 : 0.18;
}

export function pulseBeatFx(fx, power = 1) {
  fx.beatBloom = Math.max(fx.beatBloom, 0.32 * power);
}

export function tickFxSystem(fx, dt, reduceMotion) {
  const gravity = reduceMotion ? 0 : 240;

  for (const particle of fx.particles) {
    if (!particle.active) {
      continue;
    }
    particle.life -= dt;
    if (particle.life <= 0) {
      particle.active = false;
      continue;
    }
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.vx *= reduceMotion ? 0.92 : 0.984;
    particle.vy = particle.vy * (reduceMotion ? 0.92 : 0.978) + gravity * dt;
    particle.rot += particle.vr * dt;
    particle.alpha = particle.life / particle.maxLife;
  }

  if (fx.shakePower > 0.01) {
    fx.shakePower = Math.max(0, fx.shakePower - fx.shakeDecay * dt);
    fx.shakeX = randomRange(-1, 1) * fx.shakePower;
    fx.shakeY = randomRange(-1, 1) * fx.shakePower * 0.8;
  } else {
    fx.shakePower = 0;
    fx.shakeX = 0;
    fx.shakeY = 0;
  }

  fx.flashAlpha = Math.max(0, fx.flashAlpha - dt * (reduceMotion ? 5 : 2.6));
  fx.beatBloom = Math.max(0, fx.beatBloom - dt * (reduceMotion ? 4 : 1.7));
}
