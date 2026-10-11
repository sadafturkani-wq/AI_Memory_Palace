(() => {
  "use strict";

  const root = document.documentElement;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  root.classList.add("js-ready");

  const progress = document.querySelector(".scroll-progress");
  const nav = document.querySelector(".nav");
  const sections = [...document.querySelectorAll("section[id], header[id]")];
  const navLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];

  const updateScrollState = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = scrollable > 0 ? window.scrollY / scrollable : 0;
    if (progress) progress.style.transform = `scaleX(${ratio})`;
    nav?.classList.toggle("is-scrolled", window.scrollY > 24);

    const marker = window.scrollY + window.innerHeight * 0.34;
    let activeId = sections[0]?.id ?? "top";
    sections.forEach((section) => {
      if (section.offsetTop <= marker) activeId = section.id;
    });
    navLinks.forEach((link) => {
      link.classList.toggle("is-active", link.getAttribute("href") === `#${activeId}`);
    });
  };

  let scrollQueued = false;
  window.addEventListener(
    "scroll",
    () => {
      if (scrollQueued) return;
      scrollQueued = true;
      requestAnimationFrame(() => {
        updateScrollState();
        scrollQueued = false;
      });
    },
    { passive: true },
  );
  updateScrollState();

  const revealItems = document.querySelectorAll(
    ".section-head, .split-visual, .chamber, .core-fact, .tl-item, .gal, .arch-tile, .stat, .quote-card, .plan, .contact-panel",
  );
  revealItems.forEach((item, index) => {
    item.classList.add("js-reveal");
    item.style.setProperty("--reveal-delay", `${(index % 4) * 70}ms`);
  });

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -7%" },
  );
  revealItems.forEach((item) => revealObserver.observe(item));

  const counters = document.querySelectorAll("[data-count]");
  const counterObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const element = entry.target;
        const target = Number(element.dataset.count ?? 0);
        const decimals = Number(element.dataset.decimals ?? 0);
        const suffix = element.dataset.suffix ?? "";
        if (reducedMotion.matches) {
          element.textContent = `${target.toFixed(decimals)}${suffix}`;
        } else {
          const start = performance.now();
          const duration = 1500;
          const tick = (now) => {
            const elapsed = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - elapsed, 4);
            element.textContent = `${(target * eased).toFixed(decimals)}${suffix}`;
            if (elapsed < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
        observer.unobserve(element);
      });
    },
    { threshold: 0.55 },
  );
  counters.forEach((counter) => counterObserver.observe(counter));

  const tiltTargets = document.querySelectorAll(".chamber, .plan, .gal, .arch-tile");
  const canTilt = window.matchMedia("(hover: hover) and (pointer: fine)");
  tiltTargets.forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      if (!canTilt.matches || reducedMotion.matches) return;
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.setProperty("--tilt-x", `${y * -5}deg`);
      card.style.setProperty("--tilt-y", `${x * 6}deg`);
      card.style.setProperty("--light-x", `${(x + 0.5) * 100}%`);
      card.style.setProperty("--light-y", `${(y + 0.5) * 100}%`);
    });
    card.addEventListener("pointerleave", () => {
      card.style.removeProperty("--tilt-x");
      card.style.removeProperty("--tilt-y");
    });
  });

  const hero = document.querySelector(".hero");
  const palace = document.querySelector(".palace-illus");
  hero?.addEventListener("pointermove", (event) => {
    if (!canTilt.matches || reducedMotion.matches || !palace) return;
    const x = event.clientX / window.innerWidth - 0.5;
    const y = event.clientY / window.innerHeight - 0.5;
    palace.style.setProperty("--parallax-x", `${x * 20}px`);
    palace.style.setProperty("--parallax-y", `${y * 16}px`);
  });

  const form = document.querySelector("#entry-form");
  const formStatus = document.querySelector("#form-status");
  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      form.reportValidity();
      return;
    }
    const button = form.querySelector('button[type="submit"]');
    if (button) {
      button.classList.add("is-sent");
      button.innerHTML = '<i class="bi bi-check2"></i> Request Received';
      button.setAttribute("disabled", "");
    }
    if (formStatus) {
      formStatus.textContent = "Your message has entered the Palace. A curator will be in touch.";
      formStatus.classList.add("is-visible");
    }
    form.reset();
  });
})();