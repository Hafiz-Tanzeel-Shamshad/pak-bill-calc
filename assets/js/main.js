document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".mobile-toggle");
  const navLinks = document.querySelector(".nav-links");

  if (toggle && navLinks) {
    toggle.addEventListener("click", () => {
      navLinks.classList.toggle("open");
    });
  }

  const yearEls = document.querySelectorAll("[data-current-year]");
  yearEls.forEach((el) => {
    el.textContent = new Date().getFullYear();
  });

  // --- Cookie Consent Banner ---
  const consent = localStorage.getItem("cookieConsent");
  if (!consent) {
    const banner = document.createElement("div");
    banner.id = "cookie-banner";
    banner.innerHTML =
      '<p>We use cookies and similar technologies to improve your experience, analyze traffic, and serve personalized ads. <a href="/privacy-policy.html">Learn more</a></p>' +
      '<div class="cookie-actions">' +
      '<button class="btn secondary" id="cookie-necessary">Necessary Only</button>' +
      '<button class="btn" id="cookie-accept">Accept All</button>' +
      "</div>";
    Object.assign(banner.style, {
      position: "fixed",
      bottom: "0",
      left: "0",
      width: "100%",
      background: "#1a1a2e",
      color: "#e0e0e0",
      padding: "16px 24px",
      zIndex: "99999",
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "12px",
      fontSize: "14px",
      boxShadow: "0 -4px 12px rgba(0,0,0,0.3)",
    });
    banner.querySelector("#cookie-accept").addEventListener("click", () => {
      localStorage.setItem("cookieConsent", "all");
      gtagConsent("granted");
      banner.remove();
    });
    banner.querySelector("#cookie-necessary").addEventListener("click", () => {
      localStorage.setItem("cookieConsent", "necessary");
      gtagConsent("denied");
      banner.remove();
    });
    document.body.appendChild(banner);
  }

  function gtagConsent(grant) {
    if (typeof gtag === "function") {
      gtag("consent", "update", { ad_storage: grant, analytics_storage: grant });
    }
  }
});
