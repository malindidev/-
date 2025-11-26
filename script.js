(() => {
  const START_DATE = new Date("2025-07-26T00:00:00Z");
  const M_DURATION = 9;
  const GAP_BETWEEN = 1; // smaller gap for faster appearance
  const HEART_SPAWN_MS = 500;
  const PETAL_SPAWN_MS = 1200;
  const PHASE_CYCLE_SECONDS = 40;
  const GOLD_HEART_CHANCE = 0.06;
  const PER_MILESTONE = M_DURATION + GAP_BETWEEN;

  const intro = document.getElementById("intro");
  const beginBtn = document.getElementById("beginBtn");
  const music = document.getElementById("bgMusic");
  const milestonesContainer = document.querySelector(".milestones");
  const heartsContainer = document.querySelector(".particles.hearts");
  const midground = document.querySelector(".midground");
  const lcDaysEl = document.getElementById("lcDays");
  const bodyEl = document.body;

  const loopFlash = document.createElement("div");
  loopFlash.className = "loop-flash";
  document.body.appendChild(loopFlash);

  const rand = (min, max) => Math.random() * (max - min) + min;

  function updateLoveCounter() {
    const diffDays = Math.floor((new Date() - START_DATE) / (1000 * 60 * 60 * 24));
    lcDaysEl.textContent = `${diffDays} days`;
  }
  updateLoveCounter();
  setInterval(updateLoveCounter, 1000);

  const phases = ["phase-dawn", "phase-day", "phase-evening", "phase-night"];
  let phaseIndex = 0;
  function nextPhase() {
    bodyEl.classList.remove(...phases);
    bodyEl.classList.add(phases[phaseIndex % phases.length]);
    phaseIndex++;
  }
  nextPhase();
  setInterval(nextPhase, PHASE_CYCLE_SECONDS * 1000);

  let heartTimer = null;
  function spawnHeart() {
    if (!heartsContainer) return;
    const heart = document.createElement("div");
    const isGold = Math.random() < GOLD_HEART_CHANCE;
    heart.className = "heart" + (isGold ? " gold" : "");
    const size = Math.floor(rand(14, 48));
    heart.style.setProperty("--hsize", `${size}px`);
    // keep translateY animation; reduce start so they appear lower
    heart.style.transform = `translateY(${rand(0, 20)}vh)`;
    heart.style.left = `${rand(8, 92)}%`;
    heart.style.setProperty("--hvel", `${rand(6, 14)}s`);
    heart.style.zIndex = Math.floor(rand(18, 30));
    heartsContainer.appendChild(heart);
    setTimeout(() => heart.remove(), (parseFloat(heart.style.getPropertyValue("--hvel")) * 1000) + 800);
  }
  function startHearts() {
    if (heartTimer) clearInterval(heartTimer);
    heartTimer = setInterval(spawnHeart, HEART_SPAWN_MS);
    for (let i = 0; i < 6; i++) setTimeout(spawnHeart, i * 200);
  }

  let petalTimer = null;
  function spawnPetal() {
    if (!midground) return;
    const pet = document.createElement("div");
    pet.className = "pet";
    pet.style.left = `${rand(8, 92)}%`;
    pet.style.animationDuration = `${rand(8, 18)}s`;
    pet.style.zIndex = 25;
    midground.appendChild(pet);
    setTimeout(() => pet.remove(), (parseFloat(pet.style.animationDuration) * 1000) + 700);
  }
  function startPetals() {
    if (petalTimer) clearInterval(petalTimer);
    petalTimer = setInterval(spawnPetal, PETAL_SPAWN_MS);
    for (let i = 0; i < 4; i++) setTimeout(spawnPetal, i * 250);
  }

  function seedRoadside() {
    const leftSide = document.querySelector(".roadside-left");
    const rightSide = document.querySelector(".roadside-right");
    [leftSide, rightSide].forEach(side => {
      if (!side) return;
      for (let i = 0; i < 8; i++) {
        const el = document.createElement("div");
        el.style.position = "absolute";
        el.style.width = `${rand(8, 28)}px`;
        el.style.height = el.style.width;
        el.style.left = `${rand(6, 86)}%`;
        el.style.top = `${rand(10, 92)}%`;
        el.style.borderRadius = "50%";
        el.style.opacity = `${rand(0.04, 0.18)}`;
        el.style.background = `linear-gradient(180deg, rgba(255, 95, 162, ${rand(0.14,0.28)}), rgba(255, 150, 190, ${rand(0.06,0.12)}))`;
        el.style.transform = `rotate(${rand(-40,40)}deg)`;
        side.appendChild(el);
      }
    });
  }
  seedRoadside();

  function mkMilestoneCard(obj) {
    const wrap = document.createElement("div");
    wrap.className = "milestone-card";
    if (obj.photo) {
      const img = document.createElement("img");
      img.className = "photo";
      img.src = obj.photo;
      img.alt = obj.title || "photo";
      wrap.appendChild(img);
    }
    const h = document.createElement("h3");
    h.className = "m-title";
    h.textContent = obj.title || "";
    const p = document.createElement("p");
    p.className = "m-desc";
    p.textContent = obj.desc || "";
    wrap.appendChild(h);
    wrap.appendChild(p);
    wrap.setAttribute("role", "article");
    wrap.setAttribute("aria-label", `${obj.title} — ${obj.desc}`);
    wrap.style.animation = `milestoneMove ${M_DURATION}s linear infinite`; // loop smoothly
    return wrap;
  }

  const milestones = [
    { title: "Month 1", desc: "Our story began" },
    { title: "Month 2", desc: "Our smiles grew brighter" },
    { title: "Month 3", desc: "Every moment felt special" },
    { title: "Month 4", desc: "Happy Anniversary 💞" },
    { title: "Days", desc: "We've been together" },
    { title: "Always", desc: "I love you more every day." }
  ];

  milestones.forEach(m => milestonesContainer.appendChild(mkMilestoneCard(m)));

  function hideIntroAndStart() {
    if (intro) {
      intro.setAttribute("aria-hidden", "true");
      setTimeout(() => intro.style.display = "none", 700);
    }
    startHearts();
    startPetals();
  }

  if (beginBtn) beginBtn.addEventListener("click", async () => {
    try { if (music) { music.volume = 0.16; await music.play(); } } catch {}
    hideIntroAndStart();
  });

  try {
    if (music) {
      music.volume = 0.16;
      music.loop = true;
      music.play().catch(() => {});
    }
  } catch {}

  function updateDaysCard() {
    const daysNow = Math.floor((new Date() - START_DATE) / (1000 * 60 * 60 * 24));
    const dynCard = milestonesContainer.children[4];
    if (dynCard) dynCard.querySelector(".m-title").textContent = `${daysNow} days`;
  }
  setInterval(updateDaysCard, 10000);

  // initial burst of hearts/petals
  for (let i = 0; i < 10; i++) setTimeout(spawnHeart, i * 150);
  for (let i = 0; i < 6; i++) setTimeout(spawnPetal, i * 250);
  for (let i = 0; i < 12; i++) setTimeout(spawnPetal, i * 350);
})();
