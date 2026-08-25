/* ============================================================
   Philemon — scroll choreography
   ============================================================ */

(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const calm = () => reduceMotion.matches;

  const hero = document.querySelector(".hero");
  const heroName = document.querySelector(".hero__name");
  const topbar = document.getElementById("topbar");
  const cue = document.getElementById("scrollCue");

  /* ---------- 1. Hero drifts away, bar takes over ---------- */

  let ticking = false;

  const onScroll = () => {
    ticking = false;
    const y = window.scrollY;
    const h = hero ? hero.offsetHeight : window.innerHeight;

    // the name sinks and fades as it leaves — never fully out of sync
    // with the scroll, so it reads as one continuous movement
    if (heroName && !calm()) {
      const p = Math.min(y / h, 1);
      heroName.style.transform = `translate3d(0, ${y * 0.16}px, 0) scale(${1 - p * 0.03})`;
      heroName.style.opacity = String(Math.max(1 - p * 1.35, 0));
    }

    if (cue) cue.classList.toggle("is-hidden", y > 24);
    if (topbar) topbar.classList.toggle("is-visible", y > h * 0.72);
  };

  const requestScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(onScroll);
  };

  window.addEventListener("scroll", requestScroll, { passive: true });
  window.addEventListener("resize", requestScroll, { passive: true });
  onScroll();

  /* ---------- 2. Reveal the release ---------- */

  const reveals = Array.from(document.querySelectorAll("[data-reveal]"));

  const reveal = (el, delay = 0) => {
    el.style.setProperty("--delay", `${delay}ms`);
    el.classList.add("is-revealed");
  };

  if (!("IntersectionObserver" in window) || calm()) {
    reveals.forEach((el) => reveal(el));
  } else {
    // one shared observer: a group entering together cascades,
    // anything already past the fold appears at once
    const io = new IntersectionObserver(
      (entries, obs) => {
        const arriving = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        arriving.forEach((entry, i) => {
          reveal(entry.target, i * 70);
          obs.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
    );
    reveals.forEach((el) => io.observe(el));
  }

  /* ---------- 3. Ripple on the streaming rows ---------- */

  document.querySelectorAll(".row").forEach((row) => {
    row.addEventListener(
      "pointerdown",
      (e) => {
        if (calm()) return;
        const r = row.getBoundingClientRect();
        const size = Math.max(r.width, r.height) * 2.2;
        const ripple = document.createElement("span");
        ripple.className = "ripple";
        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${e.clientX - r.left - size / 2}px`;
        ripple.style.top = `${e.clientY - r.top - size / 2}px`;
        row.appendChild(ripple);
        ripple.addEventListener("animationend", () => ripple.remove(), {
          once: true,
        });
      },
      { passive: true }
    );
  });
})();
