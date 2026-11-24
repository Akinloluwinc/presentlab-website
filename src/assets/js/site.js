// Progressive enhancement for presentlab.org: menu dismissal, one-time hero edit,
// stale upcoming-event fallback between builds, viewport-aware animation, and film playback.
(() => {
  // 1. Play the home hero tracked-change animation once per browser session.
  try {
    if (sessionStorage.getItem("pl_hero")) {
      document.documentElement.classList.add("hero-seen");
    } else if (document.querySelector(".hero del")) {
      sessionStorage.setItem("pl_hero", "1");
    }
  } catch {}

  // 2. Mobile menu: close on outside click, link click, or Escape.
  document.addEventListener("click", (event) => {
    const menu = document.querySelector("details.menu[open]");
    if (menu && (!menu.contains(event.target) || event.target.closest("a"))) menu.open = false;
  });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    const menu = document.querySelector("details.menu[open]");
    if (menu) {
      menu.open = false;
      menu.querySelector("summary")?.focus();
    }
  });

  // 3. Stale upcoming-event guard: if an event's UTC date has passed since the last build,
  //    move it out of "Coming up" and drop the "Coming up" label so visitors never see past dates there.
  const todayIso = new Date().toISOString().slice(0, 10);
  const stripComingUp = (row) => {
    const meta = row.querySelector(".n-meta");
    if (!meta) return;
    const cleaned = meta.textContent.replace(/^Coming up\.?\s*/, "").trim();
    if (cleaned) meta.textContent = cleaned;
    else meta.remove();
  };
  for (const row of document.querySelectorAll(".note")) {
    const time = row.querySelector(".n-when time[datetime]");
    const dt = time?.getAttribute("datetime") || "";
    if (dt.length !== 10 || dt >= todayIso) continue;
    stripComingUp(row);
    if (!row.classList.contains("note--next")) continue;
    row.classList.remove("note--next");
    row.querySelector(".dw")?.remove();
    const year = dt.slice(0, 4);
    const nextSec = row.closest("section.yr");
    const yrs = nextSec?.parentElement;
    if (yrs) {
      let yearSec = document.getElementById(`h-${year}`)?.closest("section.yr");
      if (!yearSec) {
        yearSec = document.createElement("section");
        yearSec.className = "yr";
        yearSec.setAttribute("aria-labelledby", `h-${year}`);
        yearSec.innerHTML = `<h2 id="h-${year}">${year}</h2><ol class="nlist"></ol>`;
        nextSec.after(yearSec);
      }
      yearSec.querySelector(".nlist")?.prepend(row);
      if (!nextSec.querySelector(".note")) nextSec.remove();
    }
  }

  // 4. Looping note animation: play only when in view, respecting reduced-motion and Save-Data.
  const animVideo = document.getElementById("anim-video");
  const animButton = document.getElementById("anim-toggle");
  if (animVideo && animButton) {
    let manualChoice = null;
    const syncLabel = () => {
      animButton.textContent = animVideo.paused ? "Play" : "Pause";
    };
    animVideo.addEventListener("play", syncLabel);
    animVideo.addEventListener("pause", syncLabel);
    animButton.addEventListener("click", () => {
      if (animVideo.paused) {
        manualChoice = "play";
        animVideo.play().catch(syncLabel);
      } else {
        manualChoice = "pause";
        animVideo.pause();
      }
    });
    animButton.hidden = false;
    const allowAuto =
      !matchMedia("(prefers-reduced-motion: reduce)").matches && !navigator.connection?.saveData;
    if (allowAuto && "IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (manualChoice === "pause") continue;
            if (entry.isIntersecting) animVideo.play().catch(syncLabel);
            else if (!animVideo.paused && manualChoice !== "play") animVideo.pause();
          }
        },
        { threshold: 0.2 },
      );
      observer.observe(animVideo);
    } else if (allowAuto) {
      animVideo.play().catch(syncLabel);
    }
    syncLabel();
  }

  // 5. Film posters: swap for native HTML5 video first, cookie-free embed if needed.
  const makeEmbed = (link) => {
    const frame = document.createElement("iframe");
    frame.src = link.dataset.embed;
    frame.title = link.getAttribute("aria-label") || "Film";
    frame.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
    frame.allowFullscreen = true;
    frame.className = "film-frame";
    return frame;
  };
  const playFilm = (link) => {
    if (link.dataset.video) {
      const video = document.createElement("video");
      video.className = "film-frame";
      video.controls = true;
      video.playsInline = true;
      video.preload = "auto";
      if (link.dataset.poster) video.poster = link.dataset.poster;
      video.setAttribute("aria-label", link.getAttribute("aria-label") || "Film");
      if (link.dataset.embed) {
        video.addEventListener(
          "error",
          () => {
            video.replaceWith(makeEmbed(link));
          },
          { once: true },
        );
      }
      video.src = link.dataset.video;
      link.replaceWith(video);
      video.play().catch(() => {});
      video.focus();
      return;
    }
    if (link.dataset.embed) {
      const frame = makeEmbed(link);
      link.replaceWith(frame);
      frame.focus();
    }
  };
  document.addEventListener("click", (event) => {
    const jump = event.target.closest("a[data-film-jump]");
    if (jump) {
      const fig = document.getElementById(jump.dataset.filmJump);
      if (!fig) return;
      event.preventDefault();
      fig.scrollIntoView({ behavior: "smooth", block: "center" });
      const link = fig.querySelector("a.film-play[data-video], a.film-play[data-embed]");
      if (link) {
        playFilm(link);
        return;
      }
      const video = fig.querySelector("video.film-frame");
      if (video) {
        video.play().catch(() => {});
        video.focus();
      }
      return;
    }
    const link = event.target.closest("a.film-play[data-video], a.film-play[data-embed]");
    if (!link) return;
    event.preventDefault();
    playFilm(link);
  });
})();
