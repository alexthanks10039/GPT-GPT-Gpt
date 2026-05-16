const header = document.querySelector("[data-header]");
const menuButton = document.querySelector("[data-menu-button]");
const parallaxItems = document.querySelectorAll("[data-parallax]");
const leadForm = document.querySelector("[data-lead-form]");
const formNote = document.querySelector("[data-form-note]");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (window.lucide) {
  window.lucide.createIcons();
}

const motionPresets = {
  fade: [{ opacity: 0 }, { opacity: 1 }],
  "fade-up": [
    { opacity: 0, transform: "translate3d(0, 28px, 0)" },
    { opacity: 1, transform: "translate3d(0, 0, 0)" },
  ],
  "fade-down": [
    { opacity: 0, transform: "translate3d(0, -28px, 0)" },
    { opacity: 1, transform: "translate3d(0, 0, 0)" },
  ],
  "fade-left": [
    { opacity: 0, transform: "translate3d(-32px, 0, 0)" },
    { opacity: 1, transform: "translate3d(0, 0, 0)" },
  ],
  "fade-right": [
    { opacity: 0, transform: "translate3d(32px, 0, 0)" },
    { opacity: 1, transform: "translate3d(0, 0, 0)" },
  ],
  zoom: [
    { opacity: 0, transform: "scale(0.94)" },
    { opacity: 1, transform: "scale(1)" },
  ],
  "zoom-out": [
    { opacity: 0, transform: "scale(1.06)" },
    { opacity: 1, transform: "scale(1)" },
  ],
  blur: [
    { opacity: 0, filter: "blur(16px)" },
    { opacity: 1, filter: "blur(0)" },
  ],
  flip: [
    { opacity: 0, transform: "perspective(900px) rotateX(16deg) translateY(18px)" },
    { opacity: 1, transform: "perspective(900px) rotateX(0) translateY(0)" },
  ],
  rotate: [
    { opacity: 0, transform: "rotate(-4deg) scale(0.96)" },
    { opacity: 1, transform: "rotate(0) scale(1)" },
  ],
  bounce: [
    { transform: "translateY(0)" },
    { transform: "translateY(-14px)" },
    { transform: "translateY(0)" },
  ],
  shake: [
    { transform: "translateX(0)" },
    { transform: "translateX(-8px)" },
    { transform: "translateX(8px)" },
    { transform: "translateX(0)" },
  ],
  pulse: [
    { transform: "scale(1)", opacity: 1 },
    { transform: "scale(1.04)", opacity: 0.86 },
    { transform: "scale(1)", opacity: 1 },
  ],
  glow: [
    { boxShadow: "0 0 0 rgba(22, 139, 255, 0)" },
    { boxShadow: "0 0 36px rgba(22, 139, 255, 0.45)" },
    { boxShadow: "0 0 0 rgba(22, 139, 255, 0)" },
  ],
  float: [
    { transform: "translateY(0)" },
    { transform: "translateY(-10px)" },
    { transform: "translateY(0)" },
  ],
};

const toElements = (target) => {
  if (!target) return [];
  if (typeof target === "string") return [...document.querySelectorAll(target)];
  if (target instanceof Element) return [target];
  return [...target].filter((item) => item instanceof Element);
};

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

function runAnimation(target, type = "fade-up", options = {}) {
  const elements = toElements(target);
  const preset = motionPresets[type] || motionPresets["fade-up"];
  const duration = toNumber(options.duration, 720);
  const delay = toNumber(options.delay, 0);
  const stagger = toNumber(options.stagger, 0);
  const easing = options.easing || "cubic-bezier(0.22, 1, 0.36, 1)";
  const iterations = options.loop ? Infinity : toNumber(options.iterations, 1);

  if (reduceMotion || window.__siteMotionDisabled) {
    elements.forEach((element) => element.classList.add("is-visible"));
    return Promise.resolve(elements);
  }

  return Promise.all(
    elements.map((element, index) => {
      element.classList.add("is-visible");
      const animation = element.animate(preset, {
        duration,
        delay: delay + index * stagger,
        easing,
        iterations,
        fill: "both",
      });

      return animation.finished.catch(() => element);
    })
  );
}

function registerAnimation(name, keyframes) {
  motionPresets[name] = keyframes;
}

function setupAttributeAnimations() {
  const viewItems = document.querySelectorAll(
    ".reveal, [data-animate]:not([data-animate-trigger='hover']):not([data-animate-trigger='click']):not([data-animate-trigger='load'])"
  );

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const element = entry.target;
        runAnimation(element, element.dataset.animate || "fade-up", {
          duration: toNumber(element.dataset.duration, 720),
          delay: toNumber(element.dataset.delay, 0),
          easing: element.dataset.easing,
        });
        revealObserver.unobserve(element);
      });
    },
    { threshold: 0.16 }
  );

  viewItems.forEach((item) => revealObserver.observe(item));

  document.querySelectorAll("[data-animate-trigger='load']").forEach((item) => {
    runAnimation(item, item.dataset.animate || "fade-up", {
      duration: toNumber(item.dataset.duration, 720),
      delay: toNumber(item.dataset.delay, 0),
      loop: item.dataset.loop === "true",
    });
  });

  document.querySelectorAll("[data-animate-trigger='hover']").forEach((item) => {
    item.addEventListener("mouseenter", () => {
      runAnimation(item, item.dataset.animate || "pulse", {
        duration: toNumber(item.dataset.duration, 520),
      });
    });
  });

  document.querySelectorAll("[data-animate-trigger='click']").forEach((item) => {
    item.addEventListener("click", () => {
      runAnimation(item, item.dataset.animate || "bounce", {
        duration: toNumber(item.dataset.duration, 520),
      });
    });
  });
}

window.SiteMotion = {
  presets: motionPresets,
  run: runAnimation,
  register: registerAnimation,
  reveal: setupAttributeAnimations,
};

const SETTINGS_KEY = "voltedge-site-settings-v1";
const PASSWORD_KEY = "voltedge-editor-password-v1";
const AUTH_KEY = "voltedge-editor-auth-v1";
const DEFAULT_EDITOR_PASSWORD = "admin2026!";
let editorSessionAuthenticated = false;

const query = (selector) => document.querySelector(selector);
const queryAll = (selector) => [...document.querySelectorAll(selector)];
const getText = (selector) => query(selector)?.textContent.trim() || "";
const setText = (selector, value) => {
  queryAll(selector).forEach((item) => {
    item.textContent = value;
  });
};

const getCssUrl = (name) =>
  getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim()
    .replace(/^url\(["']?/, "")
    .replace(/["']?\)$/, "");

function readStorage(area, key) {
  try {
    return window[area]?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

function writeStorage(area, key, value) {
  try {
    window[area]?.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function removeStorage(area, key) {
  try {
    window[area]?.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

function isEditorAuthenticated() {
  return editorSessionAuthenticated || readStorage("sessionStorage", AUTH_KEY) === "true";
}

function setEditorAuthenticated(value) {
  editorSessionAuthenticated = value;
  if (value) {
    writeStorage("sessionStorage", AUTH_KEY, "true");
    return;
  }
  removeStorage("sessionStorage", AUTH_KEY);
}

const CALC_CONFIG = {
  propertyType: {
    apartment: { label: "Квартира", baseRate: 8500 },
    house: { label: "Дом", baseRate: 10500 },
    commercial: { label: "Коммерция", baseRate: 12000 },
  },
  renovationType: {
    new: { label: "Новостройка", multiplier: 1 },
    renovation: { label: "Ремонт", multiplier: 1.12 },
  },
  package: {
    base: { label: "Base", multiplier: 1, energy: 18 },
    standard: { label: "Standard", multiplier: 1.18, energy: 34 },
    premium: { label: "Premium", multiplier: 1.42, energy: 56 },
  },
  timeline: {
    standard: { label: "Стандарт", multiplier: 1 },
    fast: { label: "Быстрее", multiplier: 1.08 },
    urgent: { label: "Срочно", multiplier: 1.16 },
  },
  extras: {
    smartHome: { label: "Умный дом", fixed: 390000, perM2: 900, energy: 16 },
    decorLight: { label: "Декоративный свет", fixed: 260000, perM2: 650, energy: 12 },
    cctv: { label: "Видеонаблюдение", fixed: 220000, perM2: 350, energy: 8 },
    commercialPower: { label: "Коммерческая нагрузка", fixed: 320000, perM2: 850, energy: 11 },
    outdoorLight: { label: "Наружный свет", fixed: 240000, perM2: 420, energy: 10 },
    evCharger: { label: "EV charger", fixed: 300000, perM2: 0, energy: 7 },
  },
};

let calculatorState = {
  propertyType: "apartment",
  area: 85,
  rooms: 3,
  renovationType: "new",
  package: "standard",
  extras: [],
  timeline: "standard",
};

let currentCalcStep = 0;
let latestCalculatorPayload = null;

const moneyFormat = new Intl.NumberFormat("ru-KZ", {
  style: "currency",
  currency: "KZT",
  maximumFractionDigits: 0,
});

const formatMoney = (value) => moneyFormat.format(value).replace("KZT", "₸").trim();
const roundPrice = (value) => Math.round(value / 5000) * 5000;

function calculateEstimate(state = calculatorState) {
  const property = CALC_CONFIG.propertyType[state.propertyType];
  const renovation = CALC_CONFIG.renovationType[state.renovationType];
  const servicePackage = CALC_CONFIG.package[state.package];
  const timeline = CALC_CONFIG.timeline[state.timeline];
  const base = state.area * property.baseRate * servicePackage.multiplier * renovation.multiplier;
  const roomComplexity = Math.max(0, state.rooms - 1) * 28000;
  const extras = state.extras.reduce((sum, key) => {
    const extra = CALC_CONFIG.extras[key];
    return sum + extra.fixed + state.area * extra.perM2;
  }, 0);
  const subtotal = base + roomComplexity + extras;

  return roundPrice(subtotal * timeline.multiplier);
}

function getEnergyLevel(state = calculatorState) {
  const servicePackage = CALC_CONFIG.package[state.package];
  const extrasEnergy = state.extras.reduce((sum, key) => sum + CALC_CONFIG.extras[key].energy, 0);
  const areaEnergy = Math.min(10, Math.round(state.area / 45));
  return Math.min(100, servicePackage.energy + extrasEnergy + areaEnergy);
}

function getCalculatorPayload() {
  const estimatedPrice = calculateEstimate(calculatorState);
  const selectedServices = calculatorState.extras.map((key) => CALC_CONFIG.extras[key].label);

  return {
    propertyType: CALC_CONFIG.propertyType[calculatorState.propertyType].label,
    propertyTypeCode: calculatorState.propertyType,
    area: calculatorState.area,
    rooms: calculatorState.rooms,
    renovationType: CALC_CONFIG.renovationType[calculatorState.renovationType].label,
    package: CALC_CONFIG.package[calculatorState.package].label,
    services: selectedServices,
    timeline: CALC_CONFIG.timeline[calculatorState.timeline].label,
    estimatedPrice,
    estimatedPriceFormatted: formatMoney(estimatedPrice),
    energyLevel: getEnergyLevel(calculatorState),
    state: clone(calculatorState),
  };
}

function updateChoiceSelection(field, value) {
  queryAll(`[data-field="${field}"]`).forEach((button) => {
    button.classList.toggle("is-selected", button.dataset.value === value);
  });
}

function updateCalculatorPayloadInputs(payload) {
  const payloadInput = query("[data-calculator-payload]");
  const priceInput = query("[data-calculator-price]");
  if (payloadInput) payloadInput.value = JSON.stringify(payload);
  if (priceInput) priceInput.value = String(payload.estimatedPrice);
}

function updateHouseVisual(payload) {
  const stage = query("[data-house-stage]");
  const model = query("[data-house-model]");
  if (!stage || !model) return;

  stage.style.setProperty("--energy", payload.energyLevel);
  stage.style.setProperty("--light-strength", (payload.energyLevel / 100).toFixed(2));
  setText("[data-energy-label]", payload.energyLevel);

  const has = (key) => calculatorState.extras.includes(key);
  stage.classList.toggle("is-smart", has("smartHome"));
  stage.classList.toggle("is-decor", has("decorLight"));
  stage.classList.toggle("is-security", has("cctv"));
  stage.classList.toggle("is-commercial", has("commercialPower") || calculatorState.propertyType === "commercial");
  stage.classList.toggle("is-outdoor", has("outdoorLight"));
  stage.classList.toggle("is-premium", calculatorState.package === "premium");

  query("[data-visual-chip='base']")?.classList.toggle("is-active", payload.energyLevel > 20);
  query("[data-visual-chip='smart']")?.classList.toggle("is-active", has("smartHome") || calculatorState.package === "premium");
  query("[data-visual-chip='decor']")?.classList.toggle(
    "is-active",
    has("decorLight") || has("outdoorLight") || calculatorState.package === "premium"
  );
  query("[data-visual-chip='security']")?.classList.toggle("is-active", has("cctv"));
}

function renderCalculator() {
  latestCalculatorPayload = getCalculatorPayload();
  const payload = latestCalculatorPayload;
  const price = query("[data-estimated-price]");

  if (price) {
    price.textContent = payload.estimatedPriceFormatted;
    price.classList.add("is-updating");
    window.setTimeout(() => price.classList.remove("is-updating"), 180);
  }

  setText("[data-area-value]", calculatorState.area);
  setText("[data-rooms-value]", calculatorState.rooms);
  setText("[data-summary-property]", payload.propertyType);
  setText("[data-summary-area]", `${payload.area} м²`);
  setText("[data-summary-package]", payload.package);
  setText("[data-summary-options]", `${payload.services.length} выбрано`);

  const progress = query("[data-calc-progress]");
  if (progress) progress.style.width = `${((currentCalcStep + 1) / 4) * 100}%`;

  updateCalculatorPayloadInputs(payload);
  updateHouseVisual(payload);
}

function showCalcStep(step) {
  currentCalcStep = Math.max(0, Math.min(3, step));
  queryAll("[data-step-panel]").forEach((panel) => {
    panel.hidden = Number(panel.dataset.stepPanel) !== currentCalcStep;
  });
  queryAll("[data-calc-step]").forEach((button) => {
    button.classList.toggle("is-active", Number(button.dataset.calcStep) === currentCalcStep);
  });
  const next = query("[data-calc-next]");
  const prev = query("[data-calc-prev]");
  if (next) next.textContent = currentCalcStep === 3 ? "К заявке" : "Дальше";
  if (prev) prev.disabled = currentCalcStep === 0;
  renderCalculator();
}

function initCalculator() {
  if (!query("[data-calculator]")) return;

  queryAll("[data-field]").forEach((control) => {
    const field = control.dataset.field;

    if (control.type === "range") {
      control.addEventListener("input", () => {
        calculatorState[field] = Number(control.value);
        renderCalculator();
      });
      return;
    }

    control.addEventListener("click", () => {
      calculatorState[field] = control.dataset.value;
      updateChoiceSelection(field, control.dataset.value);
      renderCalculator();
      runAnimation(control, "pulse", { duration: 360 });
    });
  });

  queryAll("[data-extra]").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const extras = new Set(calculatorState.extras);
      checkbox.checked ? extras.add(checkbox.value) : extras.delete(checkbox.value);
      calculatorState.extras = [...extras];
      renderCalculator();
      runAnimation("[data-house-model]", "glow", { duration: 520 });
    });
  });

  queryAll("[data-calc-step]").forEach((button) => {
    button.addEventListener("click", () => showCalcStep(Number(button.dataset.calcStep)));
  });

  query("[data-calc-next]")?.addEventListener("click", () => {
    if (currentCalcStep === 3) {
      query("#lead")?.scrollIntoView({ behavior: "smooth", block: "start" });
      setText("[data-calc-payload-status]", "Расчет прикреплен к форме заявки.");
      runAnimation(".lead-form", "glow", { duration: 700 });
      return;
    }
    showCalcStep(currentCalcStep + 1);
  });

  query("[data-calc-prev]")?.addEventListener("click", () => showCalcStep(currentCalcStep - 1));

  query("[data-attach-estimate]")?.addEventListener("click", () => {
    renderCalculator();
    setText("[data-calc-payload-status]", "Расчет прикреплен к форме заявки.");
  });

  showCalcStep(0);
}

const cssUrl = (value) => `url("${String(value || "").replaceAll('"', "%22")}")`;
const clone = (value) => JSON.parse(JSON.stringify(value));

function deepMerge(base, patch) {
  const output = clone(base);
  if (!patch || typeof patch !== "object") return output;

  Object.entries(patch).forEach(([key, value]) => {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      output[key] = deepMerge(output[key] || {}, value);
      return;
    }
    output[key] = value;
  });

  return output;
}

function getPath(source, path) {
  return path.split(".").reduce((acc, key) => (acc ? acc[key] : undefined), source);
}

function setPath(source, path, value) {
  const keys = path.split(".");
  const last = keys.pop();
  const target = keys.reduce((acc, key) => {
    acc[key] = acc[key] || {};
    return acc[key];
  }, source);
  target[last] = value;
}

function getHeroEyebrow() {
  const eyebrow = query(".hero .eyebrow");
  if (!eyebrow) return "";
  return [...eyebrow.childNodes]
    .filter((node) => node.nodeType === Node.TEXT_NODE)
    .map((node) => node.textContent)
    .join(" ")
    .trim();
}

function getDefaultSettings() {
  return {
    content: {
      brand: getText(".brand span:last-child") || "VoltEdge",
      phone: getText(".phone") || "+7 700 123 45 67",
      telegram: "#",
      whatsapp: "#",
      heroEyebrow: getHeroEyebrow() || "Алматы и Алматинская область",
      heroTitle: getText(".hero-copy h1"),
      heroText: getText(".hero-copy p"),
      primaryCta: getText(".hero-actions .button:first-child"),
      secondaryCta: getText(".hero-actions .button-ghost"),
      livePrice: getText(".panel-top strong") || "от 8 500 ₸/м²",
      finalTitle: getText(".lead-copy h2"),
      finalText: getText(".lead-copy p"),
      footerText: getText(".footer-grid span:nth-child(2)"),
      formNote: formNote?.textContent.trim() || "Ответим в течение 15 минут в рабочее время.",
    },
    style: {
      accentBlue: "#168bff",
      glowBlue: "#4db8ff",
      accentOrange: "#ff8a1f",
      radius: "8px",
      heroImage: getCssUrl("--hero-image"),
      guaranteeImage: getCssUrl("--guarantee-image"),
    },
    motion: {
      enabled: true,
      reveal: "fade-up",
      heroCopy: "fade-right",
      heroPanel: "zoom",
      duration: 720,
      parallax: 0.14,
    },
  };
}

const defaultSettings = getDefaultSettings();
let siteSettings = deepMerge(defaultSettings, loadSettings());

function loadSettings() {
  try {
    return JSON.parse(readStorage("localStorage", SETTINGS_KEY)) || {};
  } catch {
    return {};
  }
}

function saveSettings(settings) {
  return writeStorage("localStorage", SETTINGS_KEY, JSON.stringify(settings));
}

function normalizeTel(phone) {
  return `tel:${String(phone).replace(/[^\d+]/g, "")}`;
}

function setHeroEyebrow(value) {
  const eyebrow = query(".hero .eyebrow");
  if (!eyebrow) return;

  const line = document.createElement("span");
  eyebrow.replaceChildren(line, ` ${value}`);
}

function setLink(selector, url) {
  queryAll(selector).forEach((link) => {
    link.href = url || "#";
  });
}

function setIconLinkText(selector, value) {
  queryAll(selector).forEach((link) => {
    const icon = link.querySelector("svg, i");
    link.textContent = "";
    if (icon) link.append(icon);
    link.append(document.createTextNode(` ${value}`));
  });
}

function applySiteSettings(settings) {
  const { content, style, motion } = settings;
  const root = document.documentElement;

  setText(".brand span:last-child", content.brand);
  setText(".footer-grid span:first-child", `${content.brand} Алматы`);
  setText(".phone", content.phone);
  setIconLinkText(".messengers a:first-child", content.phone);
  setText(".hero-copy h1", content.heroTitle);
  setText(".hero-copy p", content.heroText);
  setText(".hero-actions .button:first-child", content.primaryCta);
  setText(".hero-actions .button-ghost", content.secondaryCta);
  setText(".panel-top strong", content.livePrice);
  setText(".lead-copy h2", content.finalTitle);
  setText(".lead-copy p", content.finalText);
  setText(".footer-grid span:nth-child(2)", content.footerText);
  setHeroEyebrow(content.heroEyebrow);

  if (formNote && !leadForm?.dataset.submitted) {
    formNote.textContent = content.formNote;
  }

  queryAll(".phone, .messengers a:first-child").forEach((link) => {
    link.href = normalizeTel(content.phone);
  });
  setLink(".messengers a:nth-child(2)", content.telegram);
  setLink(".messengers a:nth-child(3)", content.whatsapp);

  document.title = `${content.brand} Алматы | Электрика под ключ`;
  query("meta[name='description']")?.setAttribute(
    "content",
    `${content.brand}: электрика под ключ в Алматы для квартир, домов и коммерции.`
  );

  root.style.setProperty("--blue", style.accentBlue);
  root.style.setProperty("--blue-glow", style.glowBlue);
  root.style.setProperty("--orange", style.accentOrange);
  root.style.setProperty("--radius", style.radius || "8px");
  root.style.setProperty("--hero-image", cssUrl(style.heroImage));
  root.style.setProperty("--guarantee-image", cssUrl(style.guaranteeImage));

  window.__siteMotionDisabled = !motion.enabled;
  document.body.classList.toggle("motion-disabled", !motion.enabled);
  queryAll(".reveal").forEach((item) => {
    item.dataset.animate = motion.reveal;
    item.dataset.duration = motion.duration;
  });
  const heroCopy = query(".hero-copy");
  const heroPanel = query(".hero-panel");
  if (heroCopy) heroCopy.dataset.animate = motion.heroCopy;
  if (heroPanel) heroPanel.dataset.animate = motion.heroPanel;
  parallaxItems.forEach((item) => {
    item.dataset.parallax = motion.parallax;
  });
}

function initEditorPanel() {
  const shell = query("[data-editor]");
  if (!shell) return;

  const trigger = query("[data-admin-open]");
  const loginForm = query("[data-editor-login]");
  const panel = query("[data-editor-panel]");
  const loginInput = query("[data-editor-password]");
  const loginStatus = query("[data-editor-login-status]");
  const loginButton = query("[data-editor-login-submit]");
  const status = query("[data-editor-status]");
  const exportBox = query("[data-editor-export]");
  const newPassword = query("[data-new-password]");
  const fields = queryAll("[data-setting]");

  const setStatus = (message) => {
    if (status) status.textContent = message;
  };

  const showPanel = (isAuthenticated) => {
    loginForm.hidden = isAuthenticated;
    panel.hidden = !isAuthenticated;
  };

  const openEditor = () => {
    shell.hidden = false;
    document.body.classList.add("editor-active");
    fillEditor();
    showPanel(isEditorAuthenticated());
    requestAnimationFrame(() => runAnimation(panel.hidden ? loginForm : panel, "fade-left", { duration: 420 }));
  };

  const closeEditor = () => {
    shell.hidden = true;
    document.body.classList.remove("editor-active");
  };

  const fillEditor = () => {
    fields.forEach((field) => {
      const value = getPath(siteSettings, field.dataset.setting);
      field.value = typeof value === "boolean" ? String(value) : value ?? "";
    });
  };

  const readEditor = () => {
    const next = clone(siteSettings);
    fields.forEach((field) => {
      const path = field.dataset.setting;
      let value = field.value;
      if (path === "motion.enabled") value = value === "true";
      if (["motion.duration", "motion.parallax"].includes(path)) value = Number(value);
      setPath(next, path, value);
    });
    return next;
  };

  const switchTab = (name) => {
    queryAll("[data-editor-tab]").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.editorTab === name);
    });
    queryAll("[data-editor-tab-panel]").forEach((tab) => {
      tab.hidden = tab.dataset.editorTabPanel !== name;
    });
  };

  trigger?.addEventListener("click", openEditor);
  queryAll("[data-editor-close], [data-close-editor]").forEach((item) => {
    item.addEventListener("click", closeEditor);
  });

  const attemptLogin = (event) => {
    event?.preventDefault();
    loginStatus.textContent = "";
    const expectedPassword = readStorage("localStorage", PASSWORD_KEY) || DEFAULT_EDITOR_PASSWORD;
    if (loginInput.value !== expectedPassword) {
      loginStatus.textContent = "Неверный пароль.";
      runAnimation(loginForm, "shake", { duration: 420 });
      return;
    }

    setEditorAuthenticated(true);
    loginInput.value = "";
    loginStatus.textContent = "";
    showPanel(true);
    runAnimation(panel, "fade-left", { duration: 420 });
  };

  loginForm?.addEventListener("submit", attemptLogin);
  loginButton?.addEventListener("click", attemptLogin);
  loginInput?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") attemptLogin(event);
  });

  queryAll("[data-editor-tab]").forEach((button) => {
    button.addEventListener("click", () => switchTab(button.dataset.editorTab));
  });

  query("[data-save-settings]")?.addEventListener("click", () => {
    siteSettings = deepMerge(defaultSettings, readEditor());
    const persisted = saveSettings(siteSettings);
    applySiteSettings(siteSettings);
    fillEditor();
    setStatus(
      persisted
        ? "Сохранено. Настройки применены к текущей странице."
        : "Настройки применены, но preview ограничил сохранение в браузере."
    );
    runAnimation(panel, "glow", { duration: 700 });
  });

  query("[data-reset-settings]")?.addEventListener("click", () => {
    removeStorage("localStorage", SETTINGS_KEY);
    siteSettings = clone(defaultSettings);
    applySiteSettings(siteSettings);
    fillEditor();
    setStatus("Настройки сброшены к базовой версии сайта.");
  });

  query("[data-export-settings]")?.addEventListener("click", () => {
    exportBox.value = JSON.stringify(siteSettings, null, 2);
    exportBox.focus();
    setStatus("JSON настроек подготовлен для копирования.");
  });

  query("[data-import-settings]")?.addEventListener("click", () => {
    try {
      siteSettings = deepMerge(defaultSettings, JSON.parse(exportBox.value));
      saveSettings(siteSettings);
      applySiteSettings(siteSettings);
      fillEditor();
      setStatus("Импорт выполнен. Настройки применены.");
    } catch {
      setStatus("Не удалось импортировать JSON. Проверьте формат.");
    }
  });

  query("[data-change-password]")?.addEventListener("click", () => {
    const password = newPassword.value.trim();
    if (password.length < 6) {
      setStatus("Пароль должен быть не короче 6 символов.");
      return;
    }
    const persisted = writeStorage("localStorage", PASSWORD_KEY, password);
    newPassword.value = "";
    setStatus(persisted ? "Пароль для этой копии сайта изменен." : "Preview не дал сохранить пароль в браузере.");
  });

  query("[data-editor-logout]")?.addEventListener("click", () => {
    setEditorAuthenticated(false);
    showPanel(false);
    setStatus("");
  });

  query("[data-preview-motion]")?.addEventListener("click", () => {
    const target = query("[data-preview-target]")?.value || ".hero-copy";
    const animation = query("[data-preview-animation]")?.value || "pulse";
    runAnimation(target, animation, {
      duration: Number(query("[data-setting='motion.duration']")?.value || siteSettings.motion.duration),
      stagger: 90,
    });
    setStatus(`Проверка анимации: ${animation}`);
  });

  document.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "e") {
      event.preventDefault();
      openEditor();
    }
    if (event.key === "Escape" && !shell.hidden) closeEditor();
  });

  if (window.location.hash === "#edit") openEditor();
}

applySiteSettings(siteSettings);
initCalculator();
initEditorPanel();

const syncHeader = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 24);
};

syncHeader();
window.addEventListener("scroll", () => {
  syncHeader();

  parallaxItems.forEach((item) => {
    const speed = Number(item.dataset.parallax || 0);
    item.style.transform = `translateY(${window.scrollY * speed}px)`;
  });
});

menuButton?.addEventListener("click", () => {
  const isOpen = header.classList.toggle("is-open");
  document.body.classList.toggle("menu-open", isOpen);
});

document.querySelectorAll(".nav a").forEach((link) => {
  link.addEventListener("click", () => {
    header?.classList.remove("is-open");
    document.body.classList.remove("menu-open");
  });
});

setupAttributeAnimations();

leadForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  leadForm.dataset.submitted = "true";
  renderCalculator();

  const formData = new FormData(leadForm);
  const calculator = latestCalculatorPayload || getCalculatorPayload();
  const leadPayload = {
    name: formData.get("name"),
    phone: formData.get("phone"),
    contactObjectType: formData.get("object"),
    contactArea: formData.get("area"),
    calculator,
    estimatedPrice: calculator.estimatedPrice,
    estimatedPriceFormatted: calculator.estimatedPriceFormatted,
    timestamp: new Date().toISOString(),
    source: formData.get("leadSource") || "landing_calculator",
  };

  formData.set("calculatorPayload", JSON.stringify(calculator));
  formData.set("estimatedPrice", String(calculator.estimatedPrice));
  window.lastLeadPayload = leadPayload;
  console.info("Lead payload", leadPayload);

  if (formNote) {
    formNote.textContent = `Заявка подготовлена. К ней прикреплен расчет: ${calculator.estimatedPriceFormatted}.`;
  }
  runAnimation(leadForm, "glow", { duration: 900 });
  leadForm.reset();
  updateCalculatorPayloadInputs(calculator);
});
