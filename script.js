/* ======================================================
   script.js
   Full logic for the cinematic anniversary milestone road
   - milestone sequencing (synchronous)
   - hearts / petals / midground particles
   - day/night phase cycling
   - love counter (based on 26 July 2025)
   - autoplay music with intro fallback
   ====================================================== */

(() => {
  // ---------- Config (tweak here) ----------
  const START_DATE = new Date("2025-07-26T00:00:00Z"); // relationship start date (UTC midnight)
  const M_DURATION = 9;   // seconds — must match CSS var --milestone-duration
  const GAP_BETWEEN = 3;  // seconds gap between milestone starts
  const REPEAT_GAP = 1.2; // small pause after last milestone before restart (seconds)
  const HEART_SPAWN_MS = 700; // how often hearts spawn
  const PETAL_SPAWN_MS = 1400; // how often petals spawn
  const PHASE_CYCLE_SECONDS = 40; // full day/night cycle duration
  const GOLD_HEART_CHANCE = 0.06; // 6% chance of gold heart

  // ---------- Derived ----------
  const PER_MILESTONE = M_DURATION + GAP_BETWEEN; // how far apart milestones start
  let milestoneList = [
    { title: "Month 1", desc: "Our story began" },
    { title: "Month 2", desc: "Our smiles grew brighter" },
    { title: "Month 3", desc: "Every moment felt special" },
    { title: "Month 4", desc: "Happy Anniversary 💞" },
    // dynamic days card will be appended later
    { title: "Final", desc: "I love you more every day." }
  ];

  // ---------- DOM refs ----------
  const intro = document.getElementById("intro");
  const beginBtn = document.getElementById("beginBtn");
  const music = document.getElementById("bgMusic");
  const milestonesContainer = document.querySelector(".milestones");
  const heartsContainer = document.querySelector(".particles.hearts");
  const midground = document.querySelector(".midground");
  const lcDaysEl = document.getElementById("lcDays");
  const bodyEl = document.body;

  // create loop flash overlay
  const loopFlash = document.createElement("div");
  loopFlash.className = "loop-flash";
  document.body.appendChild(loopFlash);

  // ---------- Utility helpers ----------
  const rand = (min, max) => Math.random() * (max - min) + min;
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const secondsToMs = (s) => Math.round(s * 1000);

  // ---------- Love counter ----------
  function updateLoveCounter() {
    const now = new Date();
    // compute days difference in user's local timezone for friendliness
    const diffMs = now - START_DATE;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(diffDays / 7);
    // show days as "X days" (you can expand this to weeks/months)
    lcDaysEl.textContent = `${diffDays} days`;
  }
  // update every second
  updateLoveCounter();
  setInterval(updateLoveCounter, 1000);

  // ---------- Day/Night phase cycling ----------
  const phases = ["phase-dawn", "phase-day", "phase-evening", "phase-night"];
  let phaseIndex = 0;
  function nextPhase() {
    bodyEl.classList.remove(...phases);
    const cls = phases[phaseIndex % phases.length];
    bodyEl.classList.add(cls);
    phaseIndex++;
  }
  nextPhase();
  setInterval(nextPhase, secondsToMs(PHASE_CYCLE_SECONDS));

  // ---------- Particle systems: hearts ----------
  let heartTimer = null;
  function spawnHeart() {
    if (!heartsContainer) return;
    const heart = document.createElement("div");
    const isGold = Math.random() < GOLD_HEART_CHANCE;
    heart.className = "heart" + (isGold ? " gold" : "");
    const size = Math.floor(rand(14, 48));
    heart.style.setProperty("--hsize", `${size}px`);
    // random horizontal position across viewport
    const left = `${rand(8, 92)}%`;
    heart.style.left = left;
    // velocity / duration
    const vel = rand(6, 14);
    heart.style.setProperty("--hvel", `${vel}s`);
    // z-index and slight rotation
    heart.style.zIndex = Math.floor(rand(18, 30));
    heartsContainer.appendChild(heart);

    // remove after animation completes
    setTimeout(() => {
      heart.remove();
    }, secondsToMs(vel) + 800);
  }
  function startHearts() {
    if (heartTimer) clearInterval(heartTimer);
    heartTimer = setInterval(spawnHeart, HEART_SPAWN_MS);
    // spawn a few immediately for richness
    for (let i = 0; i < 6; i++) setTimeout(spawnHeart, i * 200);
  }
  function stopHearts() {
    if (heartTimer) clearInterval(heartTimer);
  }

  // ---------- Midground petals/butterflies ----------
  let petalTimer = null;
  function spawnPetal() {
    if (!midground) return;
    const pet = document.createElement("div");
    pet.className = "pet";
    const left = rand(8, 92);
    pet.style.left = `${left}%`;
    const dur = rand(8, 18);
    pet.style.animationDuration = `${dur}s`;
    pet.style.zIndex = 25;
    midground.appendChild(pet);
    setTimeout(() => pet.remove(), secondsToMs(dur) + 700);
  }
  function startPetals() {
    if (petalTimer) clearInterval(petalTimer);
    petalTimer = setInterval(spawnPetal, PETAL_SPAWN_MS);
    for (let i = 0; i < 4; i++) setTimeout(spawnPetal, i * 250);
  }
  function stopPetals() {
    if (petalTimer) clearInterval(petalTimer);
  }

  // ---------- Roadside decoration seeds (light) ----------
  function seedRoadside() {
    const leftSide = document.querySelector(".roadside-left");
    const rightSide = document.querySelector(".roadside-right");
    [leftSide, rightSide].forEach((side, idx) => {
      if (!side) return;
      // add some decorative floating circles
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
  // seed once
  seedRoadside();

  // ---------- Milestone card creation ----------
  function mkMilestoneCard(obj, idx, totalCount) {
    const wrap = document.createElement("div");
    wrap.className = "milestone-card";
    // If the object contains photo property (filename), add <img>
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
    // accessibility
    wrap.setAttribute("role", "article");
    wrap.setAttribute("aria-label", `${obj.title} — ${obj.desc}`);

    // we'll not set the animation inline now; sequence controller will trigger animations
    return wrap;
  }

  // append dynamic days milestone (we keep it near the end before final)
  function buildMilestonesIntoDOM() {
    // clear container
    milestonesContainer.innerHTML = "";

    // compute dynamic days text
    const now = new Date();
    const daysTogether = Math.floor((now - START_DATE) / (1000 * 60 * 60 * 24));
    const daysCard = { title: `${daysTogether} days`, desc: "We've been together" };

    // Construct the final list: months -> dynamic days -> final love note
    const base = [
      { title: "Month 1", desc: "Our story began" },
      { title: "Month 2", desc: "Our smiles grew brighter" },
      { title: "Month 3", desc: "Every moment felt special" },
      { title: "Month 4", desc: "Happy Anniversary 💞" },
      daysCard,
      { title: "Always", desc: "I love you more every day." }
    ];

    // create elements and append
    base.forEach((m, i) => {
      const card = mkMilestoneCard(m, i, base.length);
      // ensure the CSS animation is not running until triggered:
      card.style.animation = "none";
      milestonesContainer.appendChild(card);
    });

    return base.length;
  }

  // ---------- Sequence controller ----------
  let sequenceInterval = null;
  let isSequenceRunning = false;

  function playSequenceOnce() {
    if (isSequenceRunning) return;
    isSequenceRunning = true;

    // Rebuild milestone elements (updates dynamic days)
    const total = buildMilestonesIntoDOM();
    const cards = Array.from(document.querySelectorAll(".milestone-card"));

    // For each card, schedule start
    cards.forEach((card, i) => {
      const startAfter = (PER_MILESTONE * i) * 1000; // ms
      // schedule activation: set inline animation that runs once
      setTimeout(() => {
        // apply animation (runs once)
        card.style.animation = `milestoneMove ${M_DURATION}s linear 0s 1 normal forwards`;
        // add active class for extra glow
        card.classList.add("active");
        // remove active after animation ends (M_DURATION seconds)
        setTimeout(() => {
          card.classList.remove("active");
          // Reset animation property so it can be re-applied on next loop
          card.style.animation = "none";
        }, secondsToMs(M_DURATION) + 80);
      }, startAfter);
    });

    // schedule end-of-loop flash and then allow restart
    const totalSeqTime = (PER_MILESTONE * total) + REPEAT_GAP; // seconds
    setTimeout(() => {
      // brief elegant flash
      loopFlash.style.transition = "opacity .45s ease";
      loopFlash.style.opacity = "1";
      setTimeout(() => {
        loopFlash.style.opacity = "0";
      }, 380);
      // sequence finished; allow restart after small gap
      isSequenceRunning = false;
    }, secondsToMs(totalSeqTime));
  }

  function startSequenceLoop() {
    // play once immediately
    playSequenceOnce();
    // clear existing interval if any
    if (sequenceInterval) clearInterval(sequenceInterval);
    // compute full cycle time
    const totalCards = document.querySelectorAll(".milestone-card").length || 6;
    const totalCycleSec = PER_MILESTONE * totalCards + REPEAT_GAP;
    // set interval to re-run sequence after the full cycle time
    sequenceInterval = setInterval(() => {
      playSequenceOnce();
    }, secondsToMs(totalCycleSec));
  }

  // ---------- Autoplay music handling + intro ----------
  let autoplaySucceeded = false;
  // attempt to autoplay on load
  function tryAutoplay() {
    if (!music) return Promise.resolve(false);
    music.volume = 0.16;
    music.loop = true;
    const p = music.play();
    if (p !== undefined) {
      return p.then(() => {
        autoplaySucceeded = true;
        hideIntroAndStart();
        return true;
      }).catch(() => {
        // autoplay blocked; keep intro visible, wait for button
        autoplaySucceeded = false;
        return false;
      });
    } else {
      autoplaySucceeded = false;
      return Promise.resolve(false);
    }
  }

  function hideIntroAndStart() {
    // fade out intro overlay
    if (intro) {
      intro.setAttribute("aria-hidden", "true");
      setTimeout(() => {
        intro.style.display = "none";
      }, 700);
    }
    // start particle systems and sequence
    startHearts();
    startPetals();
    startSequenceLoop();
  }

  // Begin button handler (also used when autoplay blocked)
  if (beginBtn) {
    beginBtn.addEventListener("click", async (e) => {
      // start music (important for browsers that require user gesture)
      try {
        if (music) {
          music.volume = 0.16;
          await music.play();
        }
      } catch (err) {
        // ignore
      }
      hideIntroAndStart();
    });
  }

  // initial attempt
  tryAutoplay().then((ok) => {
    if (!ok) {
      // still show intro overlay; the Begin button will trigger start
      // but we can also let ambient visuals run behind if you prefer
      // do not start sequence until user interaction in that case
    }
  });

  // ---------- Responsive / lifecycle ----------
  // rebuild milestone text periodically so dynamic days update in next loop
  setInterval(() => {
    // If a sequence isn't running, it's safe to rebuild; else rebuild will run next cycle
    if (!isSequenceRunning) {
      // update days text inside DOM if present
      const daysNow = Math.floor((new Date() - START_DATE) / (1000 * 60 * 60 * 24));
      // find the dynamic card (we built it at position index 4)
      const dynCard = Array.from(document.querySelectorAll(".milestone-card"))[4];
      if (dynCard) {
        const titleEl = dynCard.querySelector(".m-title");
        const descEl = dynCard.querySelector(".m-desc");
        if (titleEl) titleEl.textContent = `${daysNow} days`;
        if (descEl) descEl.textContent = "We've been together";
      }
    }
  }, 10 * 1000); // update every 10s

  // ---------- Start background particle seeds (but don't start sequence until intro finishes) ----------
  // Even while intro overlay is up, we can show floating hearts (a few)
  for (let i = 0; i < 10; i++) setTimeout(spawnHeart, i * 200);
  for (let i = 0; i < 6; i++) setTimeout(spawnPetal, i * 300);

  // Also seed a few midground decorative items
  for (let i = 0; i < 12; i++) setTimeout(spawnPetal, i * 450);

  // ---------- Accessibility: if user uses prefers-reduced-motion, tone down animations ----------
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (mq.matches) {
    // stop heavy animations
    stopHearts();
    stopPetals();
    if (music) music.pause();
    // make milestones static: set a single card visible
    buildMilestonesIntoDOM();
    const firstCard = document.querySelector(".milestone-card");
    if (firstCard) {
      firstCard.style.animation = "none";
      firstCard.style.transform = "translateX(-50%) translateY(8vh) rotateX(0deg) scale(1)";
      firstCard.style.opacity = "1";
    }
    if (intro) intro.setAttribute("aria-hidden", "true");
  }

  // On page visibility change, pause/resume music and particle generators
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      if (music && !music.paused) music.pause();
      stopHearts();
      stopPetals();
    } else {
      // resume audio if it was playing or autoplay succeeded
      if (music && autoplaySucceeded) music.play().catch(() => {});
      startHearts();
      startPetals();
    }
  });

  // Finally, ensure the first build so sequence loop can compute counts
  buildMilestonesIntoDOM();

  // If autoplay succeeded earlier, everything will start in hideIntroAndStart().
  // Otherwise, waiting for user's Begin click will start the experience.

})();
