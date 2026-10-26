const menuToggle = document.querySelector(".menu-toggle");
const menuText = document.querySelector(".menu-text");
const navLinks = document.querySelector(".nav-links");
const navItems = document.querySelectorAll(
  ".nav-links a[href^='#']:not(.nav-cta)",
);
const sections = document.querySelectorAll("main section[id]");
const yearTarget = document.querySelector("#year");
const revealItems = document.querySelectorAll(".reveal");
const scrollTopButton = document.querySelector(".scroll-top");
const viewQrButton = document.querySelector("#view-qr-button");
const qrModal = document.querySelector("#resume-qr-modal");
const closeQrButton = document.querySelector("#close-qr-button");
const reduceMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

const themeToggle = document.querySelector(".theme-toggle");
const themeStorageKey = "zin-portfolio-theme";
const savedTheme = (() => {
  try { return localStorage.getItem(themeStorageKey); } catch { return null; }
})();
const initialTheme = savedTheme === "dark" || savedTheme === "light"
  ? savedTheme
  : (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

const applyTheme = (theme, persist = false) => {
  document.documentElement.dataset.theme = theme;
  if (!themeToggle) return;
  const darkMode = theme === "dark";
  themeToggle.setAttribute("aria-label", darkMode ? "Switch to light mode" : "Switch to dark mode");
  themeToggle.setAttribute("title", darkMode ? "Switch to light mode" : "Switch to dark mode");
  themeToggle.setAttribute("aria-pressed", String(darkMode));
  if (persist) {
    try { localStorage.setItem(themeStorageKey, theme); } catch { /* Storage may be unavailable. */ }
  }
};

applyTheme(initialTheme);
if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(nextTheme, true);
  });
}


if (yearTarget) {
  yearTarget.textContent = new Date().getFullYear();
}

const closeMenu = () => {
  if (!menuToggle || !navLinks || !menuText) {
    return;
  }

  navLinks.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuText.textContent = "Menu";
};

if (menuToggle && navLinks && menuText) {
  menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuText.textContent = isOpen ? "Close" : "Menu";
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      closeMenu();
    });
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 820) {
      closeMenu();
    }
  });
}

if (!reduceMotion && "IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 },
  );

  revealItems.forEach((item) => {
    revealObserver.observe(item);
  });
} else {
  revealItems.forEach((item) => {
    item.classList.add("is-visible");
  });
}

if ("IntersectionObserver" in window && navItems.length && sections.length) {
  const setActiveLink = (id) => {
    navItems.forEach((link) => {
      const isActive = link.getAttribute("href") === `#${id}`;
      link.classList.toggle("is-active", isActive);

      if (isActive) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const visibleEntry = entries
        .filter((entry) => entry.isIntersecting)
        .sort(
          (first, second) => second.intersectionRatio - first.intersectionRatio,
        )[0];

      if (visibleEntry) {
        setActiveLink(visibleEntry.target.id);
      }
    },
    {
      rootMargin: "-35% 0px -50% 0px",
      threshold: [0.2, 0.45, 0.7],
    },
  );

  sections.forEach((section) => {
    sectionObserver.observe(section);
  });
}

const syncScrollTopButton = () => {
  if (!scrollTopButton) {
    return;
  }

  scrollTopButton.classList.toggle("is-visible", window.scrollY > 320);
};

if (scrollTopButton) {
  scrollTopButton.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  });

  syncScrollTopButton();
  window.addEventListener("scroll", syncScrollTopButton, { passive: true });
}

const closeQrModal = () => {
  if (!qrModal) {
    return;
  }

  qrModal.setAttribute("hidden", "");
  document.body.classList.remove("is-modal-open");
};

if (viewQrButton && qrModal) {
  const openQrModal = () => {
    qrModal.removeAttribute("hidden");
    document.body.classList.add("is-modal-open");
  };

  viewQrButton.addEventListener("click", openQrModal);

  if (closeQrButton) {
    closeQrButton.addEventListener("click", () => {
      closeQrModal();
      viewQrButton.focus();
    });
  }

  qrModal.addEventListener("click", (event) => {
    if (event.target === qrModal) {
      closeQrModal();
    }
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !qrModal.hasAttribute("hidden")) {
      closeQrModal();
      viewQrButton.focus();
    }
  });
}
