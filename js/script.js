/* ============================================================
   YADAV WEB TECHNOLOGIES — Global Script
   Theme · Reveal · Scroll Progress · Smooth Anchors
   Lightweight / Performance-focused
   ============================================================ */

(() => {
    "use strict";

    const root = document.documentElement;
    const themeBtn = document.getElementById("theme-toggle");
    const progressBar = document.querySelector(".scroll-progress");

    const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );

    const THEME_KEY = "ywt-theme";

    /* ============================================================
       1. THEME
       ============================================================ */

    const getSystemTheme = () =>
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";

    const updateThemeButton = (theme) => {
        if (!themeBtn) return;

        const isDark = theme === "dark";

        themeBtn.setAttribute(
            "aria-label",
            isDark ? "Switch to light mode" : "Switch to dark mode"
        );

        themeBtn.setAttribute(
            "title",
            isDark ? "Switch to light mode" : "Switch to dark mode"
        );

        themeBtn.setAttribute("aria-pressed", String(isDark));
    };

    const applyTheme = (theme, save = true) => {
        const safeTheme = theme === "dark" ? "dark" : "light";

        root.classList.toggle("dark-mode", safeTheme === "dark");

        updateThemeButton(safeTheme);

        if (save) {
            try {
                localStorage.setItem(THEME_KEY, safeTheme);
            } catch {
                /* Storage may be unavailable in restricted contexts. */
            }
        }
    };

    let storedTheme = null;

    try {
        storedTheme = localStorage.getItem(THEME_KEY);
    } catch {
        storedTheme = null;
    }

    applyTheme(storedTheme || getSystemTheme(), Boolean(storedTheme));

    if (themeBtn) {
        themeBtn.addEventListener("click", () => {
            const nextTheme = root.classList.contains("dark-mode")
                ? "light"
                : "dark";

            applyTheme(nextTheme, true);
        });
    }

    if (window.matchMedia) {
        const colorScheme = window.matchMedia(
            "(prefers-color-scheme: dark)"
        );

        const handleSystemThemeChange = (event) => {
            let savedTheme = null;

            try {
                savedTheme = localStorage.getItem(THEME_KEY);
            } catch {
                savedTheme = null;
            }

            if (!savedTheme) {
                applyTheme(event.matches ? "dark" : "light", false);
            }
        };

        if (typeof colorScheme.addEventListener === "function") {
            colorScheme.addEventListener(
                "change",
                handleSystemThemeChange
            );
        } else if (typeof colorScheme.addListener === "function") {
            colorScheme.addListener(handleSystemThemeChange);
        }
    }

    /* ============================================================
       2. SCROLL REVEAL
       ============================================================ */

    const revealElements = document.querySelectorAll(".reveal");

    if (revealElements.length) {
        if (
            prefersReducedMotion.matches ||
            !("IntersectionObserver" in window)
        ) {
            revealElements.forEach((element) => {
                element.classList.add("is-visible");
            });
        } else {
            const revealObserver = new IntersectionObserver(
                (entries, observer) => {
                    entries.forEach((entry) => {
                        if (!entry.isIntersecting) return;

                        entry.target.classList.add("is-visible");
                        observer.unobserve(entry.target);
                    });
                },
                {
                    threshold: 0.08,
                    rootMargin: "0px 0px -50px 0px"
                }
            );

            revealElements.forEach((element) => {
                revealObserver.observe(element);
            });
        }
    }

    /* ============================================================
       3. SCROLL PROGRESS
       requestAnimationFrame prevents excessive style updates
       during fast scrolling.
       ============================================================ */

    if (progressBar) {
        let progressTicking = false;

        const updateScrollProgress = () => {
            const documentHeight =
                document.documentElement.scrollHeight -
                window.innerHeight;

            const scrollTop = window.scrollY;

            const progress =
                documentHeight > 0
                    ? Math.min(
                          100,
                          Math.max(0, (scrollTop / documentHeight) * 100)
                      )
                    : 0;

            progressBar.style.width = `${progress}%`;
            progressTicking = false;
        };

        const requestProgressUpdate = () => {
            if (progressTicking) return;

            progressTicking = true;
            window.requestAnimationFrame(updateScrollProgress);
        };

        window.addEventListener(
            "scroll",
            requestProgressUpdate,
            { passive: true }
        );

        window.addEventListener(
            "resize",
            requestProgressUpdate,
            { passive: true }
        );

        updateScrollProgress();
    }

    /* ============================================================
       4. SMOOTH ANCHOR LINKS
       ============================================================ */

    document.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener("click", (event) => {
            const targetId = link.getAttribute("href");

            if (!targetId || targetId === "#") return;

            const target = document.querySelector(targetId);

            if (!target) return;

            event.preventDefault();

            target.scrollIntoView({
                behavior: prefersReducedMotion.matches
                    ? "auto"
                    : "smooth",
                block: "start"
            });

            /*
             * Keep keyboard focus accessible without changing
             * the browser's visible layout.
             */
            if (!target.hasAttribute("tabindex")) {
                target.setAttribute("tabindex", "-1");
            }

            target.focus({
                preventScroll: true
            });
        });
    });

    /* ============================================================
       5. LIGHTWEIGHT PAGE VISIBILITY HANDLING
       Pause decorative animations while the tab is hidden.
       ============================================================ */

    document.addEventListener("visibilitychange", () => {
        root.classList.toggle(
            "page-hidden",
            document.hidden
        );
    });

})();
