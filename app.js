const limitSelect = document.getElementById("limit");
const statusEl = document.getElementById("config-status");
const refreshBtn = document.getElementById("refresh-btn");
const eventsBody = document.getElementById("events-body");
const categoryPills = document.getElementById("category-pills");
const filterAction = document.getElementById("filter-action");
const filterCategory = document.getElementById("filter-category");
const metricTotal = document.getElementById("metric-total");
const trendTotal = document.getElementById("trend-total");
const metricBlocked = document.getElementById("metric-blocked");
const trendBlocked = document.getElementById("trend-blocked");
const metricOverrides = document.getElementById("metric-overrides");
const trendOverrides = document.getElementById("trend-overrides");
const metricReEdited = document.getElementById("metric-reedited");
const trendReEdited = document.getElementById("trend-reedited");
const metricSanitized = document.getElementById("metric-sanitized");
const trendSanitized = document.getElementById("trend-sanitized");
const metricActiveUsers = document.getElementById("metric-active-users");
const metricAvgSeverity = document.getElementById("metric-avg-severity");
const metricCategory = document.getElementById("metric-category");
const authGate = document.getElementById("auth-gate");
const authTenantInput = document.getElementById("auth-tenant");
const authEmailInput = document.getElementById("auth-email");
const authPasswordInput = document.getElementById("auth-password");
const authSubmit = document.getElementById("auth-submit");
const authStatus = document.getElementById("auth-status");
const appShell = document.getElementById("app-shell");
const logoutBtn = document.getElementById("logout-btn");
const currentTenant = document.getElementById("current-tenant");
const lastUpdated = document.getElementById("last-updated");
const autoRefresh = document.getElementById("auto-refresh");

const searchInput = document.getElementById("search-input");
const paginationInfo = document.getElementById("pagination-info");
const prevPageBtn = document.getElementById("prev-page");
const nextPageBtn = document.getElementById("next-page");
const tableHeaders = document.querySelectorAll("th.sortable");
const settingsBtn = document.getElementById("settings-btn");
const settingsDrawer = document.getElementById("settings-drawer");
const settingsClose = document.getElementById("settings-close");
const settingsSave = document.getElementById("settings-save");
const settingsTitle = document.getElementById("settings-title");
const settingsDisplayName = document.getElementById("settings-display-name");
const settingsCategoryLabels = null; // Removed
const settingsStatus = document.getElementById("settings-status");
const savedViewSelect = document.getElementById("saved-view-select");
const settingsLogoUpload = document.getElementById("settings-logo-upload");
const logoPreviewImg = document.getElementById("logo-preview-img");
const settingsFaviconUrl = document.getElementById("settings-favicon-url");
const settingsAccentColor = document.getElementById("settings-accent-color");
const settingsTheme = document.getElementById("settings-theme");
const adminMenu = document.getElementById("admin-menu");
const adminMenuToggle = document.getElementById("admin-menu-toggle");
const sensitivitySlider = null; // Removed
const sensitivityValue = null; // Removed
const saveSensitivityBtn = null; // Removed
const sensitivityStatus = null; // Removed
let uploadedLogoDataUrl = null;

const STORAGE_KEY = "praivacy-dashboard-config";
const THEME_KEY = "praivacy-theme";
const DISPLAY_NAME_KEY = "praivacy-display-name";
const apiBase = `${window.location.origin}/api/v1`;
const VIEW_KEY = "praivacy-saved-view";

let actionChart = null;
let categoryChart = null;
let cachedEvents = [];
let cachedSummary = {};
let adminToken = "";
let tenantId = "";
let refreshTimer = null;
let selectedCategory = "all";
let currentPage = 1;
let sortField = "timestamp";
let sortDir = "desc";
let tenantConfig = null;
let savedViewNameApplied = "";
let pendingSettingsHash = window.location.hash === "#settings";

function isJwtToken(value) {
  if (!value) return false;
  const raw = value.trim().replace(/^Bearer\s+/i, "");
  return raw.split(".").length === 3;
}

function extractTenantIdFromToken(token) {
  if (!isJwtToken(token)) return null;
  const raw = token.trim().replace(/^Bearer\s+/i, "");
  const parts = raw.split(".");
  if (parts.length !== 3) return null;
  try {
    const normalized = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const payload = JSON.parse(atob(padded));
    return payload?.tenantId || null;
  } catch (_) {
    return null;
  }
}

function applyTheme(theme) {
  const normalized = theme === "light" ? "light" : "dark";
  localStorage.setItem(THEME_KEY, normalized);
  document.documentElement.classList.toggle("light-mode", normalized === "light");
  if (settingsTheme) settingsTheme.value = normalized;
}

function ensureSettingsVisibleIfRequested() {
  if (pendingSettingsHash && adminToken && tenantId) {
    toggleSettings(true);
  }
}

initAdminMenu();

window.addEventListener("hashchange", () => {
  pendingSettingsHash = window.location.hash === "#settings";
  ensureSettingsVisibleIfRequested();
});

function serializeMap(map = {}) {
  return Object.entries(map || {})
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");
}

function parseMapInput(value = "") {
  const entries = {};
  value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .forEach((line) => {
      const [key, ...rest] = line.split("=");
      if (!key || !rest.length) return;
      const val = rest.join("=").trim();
      if (!val) return;
      entries[key.trim()] = val;
    });
  return entries;
}

const DEFAULT_CATEGORY_LABELS = {
  pii: "Personal Information",
  doc_attachment: "Document Attachment",
  sexual_content: "Sexual Content",
  hate_speech: "Hate Speech",
  harassment: "Harassment",
  self_harm: "Self-Harm",
  violence: "Violence",
  illicit: "Illicit Content"
};

function labelCategory(cat) {
  if (!cat) return "—";
  // Check config first, then defaults, then fallback to Title Case
  const configured = tenantConfig?.categoryLabels?.[cat];
  if (configured) return configured;

  const def = DEFAULT_CATEGORY_LABELS[cat];
  if (def) return def;

  // Title Case fallback (pii_leak -> Pii Leak)
  return cat
    .replace(/_/g, " ")
    .replace(/\b\w/g, c => c.toUpperCase());
}

function labelHost(host) {
  if (!host) return "—";
  return tenantConfig?.hostLabels?.[host] || host;
}

function labelRule(rule) {
  if (!rule) return "—";
  return tenantConfig?.ruleLabels?.[rule] || rule;
}

function initAdminMenu() {
  if (!adminMenu || !adminMenuToggle) return;
  const closeMenu = () => adminMenu.classList.add("hidden");
  const toggleMenu = () => adminMenu.classList.toggle("hidden");
  adminMenuToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleMenu();
  });
  adminMenuToggle.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleMenu();
    }
  });
  // Prevent immediate close when clicking inside the menu
  adminMenu.addEventListener("click", (e) => e.stopPropagation());
  document.addEventListener("click", (e) => {
    if (adminMenu.contains(e.target) || adminMenuToggle.contains(e.target)) return;
    closeMenu();
  });

  // Settings Button logic
  if (settingsBtn && settingsDrawer) {
    settingsBtn.addEventListener("click", () => {
      closeMenu();
      settingsDrawer.classList.remove("hidden");
    });
  }

  // Update User Info
  const n = localStorage.getItem("praivacy-user-name");
  const e = localStorage.getItem("praivacy-user-email");
  const nameEl = document.getElementById("menu-user-name");
  const emailEl = document.getElementById("menu-user-email");
  if (nameEl && n) nameEl.textContent = n;
  if (emailEl && e) emailEl.textContent = e;
}

settingsLogoUpload?.addEventListener("change", (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    uploadedLogoDataUrl = reader.result;
    if (logoPreviewImg) logoPreviewImg.src = uploadedLogoDataUrl;
  };
  reader.readAsDataURL(file);
});

function loadSavedViewsUI() {
  if (!savedViewSelect) return;
  savedViewSelect.innerHTML = "";
  const blank = document.createElement("option");
  blank.value = "";
  blank.textContent = "Saved views";
  savedViewSelect.appendChild(blank);
  (tenantConfig?.savedViews || []).forEach((view) => {
    const opt = document.createElement("option");
    opt.value = view.name;
    opt.textContent = view.name;
    savedViewSelect.appendChild(opt);
  });
  if (savedViewNameApplied) {
    savedViewSelect.value = savedViewNameApplied;
  }
}

function applySavedView(name) {
  if (!name) return;
  const match = (tenantConfig?.savedViews || []).find((v) => v.name === name);
  if (!match) return;
  savedViewSelect.value = name;
  const { filters = {} } = match;
  filterAction.value = filters.action || "all";
  selectedCategory = filters.category || "all";
  filterCategory.value = selectedCategory;
  if (filters.search && searchInput) searchInput.value = filters.search;
  if (filters.limit && limitSelect) limitSelect.value = String(filters.limit);
  if (filters.sortField) sortField = filters.sortField;
  if (filters.sortDir) sortDir = filters.sortDir;
  updateViews();
  savedViewNameApplied = name;
  persistConfig(tenantId, limitSelect ? (Number(limitSelect.value) || 50) : 50, name);
}

function loadStoredConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (parsed.tenant) tenantId = parsed.tenant;
    if (parsed.limit && limitSelect) limitSelect.value = String(parsed.limit);
    if (parsed.savedView) savedViewNameApplied = parsed.savedView;
    const theme = localStorage.getItem(THEME_KEY) || "dark";
    applyTheme(theme);
  } catch (_) {
    // ignore
  }
}

function persistConfig(tenant, limit, savedView) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ tenant, limit, savedView: savedView || savedViewNameApplied || "" })
    );
  } catch (_) { }
}

function applyTenantConfigUI() {
  if (!tenantConfig) return;
  if (settingsTitle) settingsTitle.textContent = `Configure ${tenantConfig.displayName || tenantId}`;
  if (settingsDisplayName) settingsDisplayName.value = tenantConfig.displayName || tenantId;
  if (settingsCategoryLabels) settingsCategoryLabels.value = serializeMap(tenantConfig.categoryLabels);
  if (settingsFaviconUrl) settingsFaviconUrl.value = tenantConfig.branding?.faviconUrl || "";
  if (settingsAccentColor) settingsAccentColor.value = tenantConfig.branding?.accentColor || "";
  if (settingsTheme) settingsTheme.value = localStorage.getItem(THEME_KEY) || "dark";
  if (tenantConfig.branding?.accentColor) {
    document.documentElement.style.setProperty("--accent", tenantConfig.branding.accentColor);
  }
  if (tenantConfig.branding?.logoUrl) {
    const logo = document.querySelector(".brand-logo");
    if (logo) logo.src = tenantConfig.branding.logoUrl;
    if (logoPreviewImg) logoPreviewImg.src = tenantConfig.branding.logoUrl;
  }
  if (tenantConfig.branding?.faviconUrl) {
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = tenantConfig.branding.faviconUrl;
  }
  const brandNameEl = document.querySelector(".brand-name");
  if (brandNameEl && tenantConfig.displayName) {
    brandNameEl.textContent = tenantConfig.displayName;
  }
  if (currentTenant && (tenantConfig.displayName || tenantId)) {
    currentTenant.textContent = tenantConfig.displayName || tenantId;
  }
  try {
    localStorage.setItem(DISPLAY_NAME_KEY, tenantConfig.displayName || tenantId || "");
  } catch (_) { }
  if (tenantConfig.defaults?.limit && limitSelect) {
    limitSelect.value = String(tenantConfig.defaults.limit);
  }
  // Slider listener for value display
  if (sensitivitySlider) {
    sensitivitySlider.addEventListener("input", (e) => {
      if (sensitivityValue) sensitivityValue.textContent = e.target.value;
    });
  }
  loadSavedViewsUI();
}

async function loadTenantConfig() {
  if (!tenantId || !adminToken) return;
  try {
    const resp = await fetchJson(`${apiBase}/admin/tenants/${encodeURIComponent(tenantId)}/config`, "");
    tenantConfig = resp.config || {};
    applyTenantConfigUI();
    if (savedViewNameApplied) {
      applySavedView(savedViewNameApplied);
    } else if (tenantConfig.savedViews && tenantConfig.savedViews.length) {
      applySavedView(tenantConfig.savedViews[0].name);
    }
    ensureSettingsVisibleIfRequested();
  } catch (err) {
    console.warn("[PrAIvacy] Failed to load tenant config", err);
    ensureSettingsVisibleIfRequested();
  }
}

async function fetchJson(path, adminKey) {
  const headers = {};
  if (adminToken) {
    if (adminToken.toLowerCase().startsWith("bearer ") || isJwtToken(adminToken)) {
      headers.Authorization = adminToken.toLowerCase().startsWith("bearer ")
        ? adminToken
        : `Bearer ${adminToken}`;
    } else {
      headers["X-PRAI-Admin-Key"] = adminToken;
    }
  } else if (adminKey) {
    headers["X-PRAI-Admin-Key"] = adminKey;
  }
  const response = await fetch(path, {
    headers
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `HTTP ${response.status}`);
  }
  return response.json();
}

function formatTimestamp(iso) {
  if (!iso) return "—";
  const date = new Date(iso);
  return date.toLocaleString();
}

function formatTrend(currentRaw, previousRaw, options = {}) {
  const current = Number(currentRaw) || 0;
  const previous = Number(previousRaw) || 0;

  // Backwards compatibility for the third argument being a boolean (upIsGood)
  const upIsGood = typeof options === 'boolean' ? options : (options.upIsGood || false);
  const showAsNewCount = typeof options === 'object' && options.showAsNewCount;

  if (showAsNewCount) {
    const color = "#22C55E"; // Green
    return `<span style="color: ${color}">↑ ${current} new in the last 24h</span>`;
  }

  if (previous === 0) {
    // If no previous events but we have some now, show "New" or just count
    if (current > 0) {
      const color = upIsGood ? "#22C55E" : "#EF4444";
      return `<span style="color: ${color}">↑ ${current} new</span>`;
    }
    return ""; // No previous, no current = stable zero.
  }

  const diff = current - previous;
  const pct = Math.round((diff / previous) * 100);
  const sign = diff > 0 ? "+" : "";
  const arrow = diff > 0 ? "↑" : diff < 0 ? "↓" : "→";

  // Default (upIsGood=false): Increase = Red (#EF4444), Decrease = Green (#22C55E)
  // Inverse (upIsGood=true): Increase = Green (#22C55E), Decrease = Red (#EF4444)
  let color = "#94A3B8"; // Grey for neutral
  if (diff > 0) {
    color = upIsGood ? "#22C55E" : "#EF4444";
  } else if (diff < 0) {
    color = upIsGood ? "#EF4444" : "#22C55E";
  }

  return `<span style="color: ${color}">${arrow} ${sign}${pct}% vs 24h</span>`;
}

function renderMetrics(summary) {
  metricTotal.textContent = summary.totalEvents || 0;
  if (summary.trends && trendTotal) {
    trendTotal.innerHTML = formatTrend(summary.trends.total24h, summary.trends.totalPrev24h);
  }

  metricBlocked.textContent = summary.actionCounts?.blocked || 0;
  if (summary.trends && trendBlocked) {
    trendBlocked.innerHTML = formatTrend(summary.trends.blocked24h, summary.trends.blockedPrev24h);
  }

  metricOverrides.textContent = summary.actionCounts?.override || 0;
  if (summary.trends && trendOverrides) {
    trendOverrides.innerHTML = formatTrend(summary.trends.override24h, summary.trends.overridePrev24h);
  }

  if (metricReEdited) {
    metricReEdited.textContent = summary.actionCounts?.warning || 0;
    if (summary.trends && trendReEdited) {
      trendReEdited.innerHTML = formatTrend(summary.trends.warning24h, summary.trends.warningPrev24h, { upIsGood: true, showAsNewCount: true });
    }
  }

  if (metricSanitized) {
    metricSanitized.textContent = summary.actionCounts?.sanitized || 0;
    if (summary.trends && trendSanitized) {
      trendSanitized.innerHTML = formatTrend(summary.trends.sanitized24h, summary.trends.sanitizedPrev24h, { upIsGood: true, showAsNewCount: true });
    }
  }

  if (metricActiveUsers) {
    metricActiveUsers.textContent = summary.activeUsers || 0;
  }

  if (metricAvgSeverity) {
    metricAvgSeverity.textContent = (summary.avgSeverity || 0).toFixed(2);
  }

  const topCategory = Object.entries(summary.categoryCounts || {})
    .sort((a, b) => b[1] - a[1])[0];
  metricCategory.textContent = topCategory ? `${labelCategory(topCategory[0])} (${topCategory[1]})` : "—";
}

function renderCategoryPills(data) {
  categoryPills.innerHTML = "";
  const entries = Object.entries(data || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  if (!entries.length) {
    categoryPills.innerHTML = '<span class="pill">No data</span>';
    return;
  }
  entries.forEach(([category, count]) => {
    const pill = document.createElement("span");
    pill.className = "pill";
    if (selectedCategory === category) pill.classList.add("active");
    pill.textContent = `${labelCategory(category)} · ${count}`;
    pill.addEventListener("click", () => {
      const isActive = selectedCategory === category;
      selectedCategory = isActive ? "all" : category;
      filterCategory.value = selectedCategory;
      renderCategoryPills(data);
      updateViews();
    });
    categoryPills.appendChild(pill);
  });
  if (selectedCategory !== "all") {
    const clearPill = document.createElement("span");
    clearPill.className = "pill ghost";
    clearPill.textContent = "Clear filter";
    clearPill.addEventListener("click", () => {
      selectedCategory = "all";
      filterCategory.value = "all";
      renderCategoryPills(data);
      updateViews();
    });
    categoryPills.appendChild(clearPill);
  }
}

function applyFilters(events) {
  const action = filterAction.value;
  const category = selectedCategory || filterCategory.value;
  const q = (searchInput?.value || "").trim().toLowerCase();
  return events.filter((event) => {
    const actionMatch = action === "all" || event.action === action;
    const categoryMatch = category === "all" || (event.categories || []).includes(category);
    const hay = `${event.host || ""} ${(event.rules || []).join(" ")} ${(event.categories || []).join(" ")}`.toLowerCase();
    const searchMatch = !q || hay.includes(q);
    return actionMatch && categoryMatch && searchMatch;
  });
}

function sortEvents(events) {
  if (!sortField || !sortDir) return [...events];
  return [...events].sort((a, b) => {
    const dir = sortDir === "asc" ? 1 : -1;
    switch (sortField) {
      case "host":
        return (a.host || "").localeCompare(b.host || "") * dir;
      case "action":
        return (a.action || "").localeCompare(b.action || "") * dir;
      case "categories": {
        const ac = (a.categories || []).join(", ");
        const bc = (b.categories || []).join(", ");
        return ac.localeCompare(bc) * dir;
      }
      case "rules": {
        const ar = (a.rules || []).join(", ");
        const br = (b.rules || []).join(", ");
        return ar.localeCompare(br) * dir;
      }
      case "severity":
        return ((a.severity || 0) - (b.severity || 0)) * dir;
      default:
        return (new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()) * dir;
    }
  });
}

function paginateEvents(events) {
  if (paginationInfo) {
    paginationInfo.textContent = `${events.length} events`;
  }
  if (prevPageBtn && nextPageBtn) {
    prevPageBtn.style.display = "none";
    nextPageBtn.style.display = "none";
  }
  return [...events];
}

function computeSummaryFromEvents(events) {
  const summary = {
    totalEvents: events.length,
    actionCounts: {},
    categoryCounts: {},
    ruleCounts: {},
    latestEvent: events[0] || null,
    // New metrics
    activeUsers: new Set(events.map(e => e.userId).filter(Boolean)).size,
    avgSeverity: events.length ? (events.reduce((acc, e) => acc + (Number(e.severity) || 0), 0) / events.length) : 0,
    trends: cachedSummary.trends // Use global trends
  };
  events.forEach((event) => {
    summary.actionCounts[event.action] = (summary.actionCounts[event.action] || 0) + 1;
    (event.categories || []).forEach((cat) => {
      summary.categoryCounts[cat] = (summary.categoryCounts[cat] || 0) + 1;
    });
    (event.rules || []).forEach((rule) => {
      summary.ruleCounts[rule] = (summary.ruleCounts[rule] || 0) + 1;
    });
  });
  return summary;
}

function updateViews() {
  const filtered = sortEvents(applyFilters(cachedEvents));
  const page = paginateEvents(filtered);
  renderEvents(page);
  // const derivedSummary = computeSummaryFromEvents(filtered);
  // Use server-side summary for correct total counts (fixes 50-event cap)
  renderMetrics(cachedSummary);
  renderCharts(cachedSummary);
  const ts = new Date().toLocaleTimeString();
  statusEl.textContent = `Updated ${ts}`;
  statusEl.style.color = "#34D399";
  lastUpdated.textContent = `Last updated: ${ts}`;
}

function renderEvents(events) {
  eventsBody.innerHTML = "";
  if (!events.length) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 6;
    cell.className = "placeholder";
    cell.textContent = "No events yet.";
    row.appendChild(cell);
    eventsBody.appendChild(row);
    return;
  }

  events.forEach((event) => {
    const row = document.createElement("tr");
    const cells = [
      formatTimestamp(event.timestamp),
      labelHost(event.host),
      event.action || "—",
      (event.categories || []).map((c) => labelCategory(c)).join(", ") || "—",
      (event.rules || []).map((r) => labelRule(r)).join(", ") || "—",
      event.severity?.toFixed ? event.severity.toFixed(2) : event.severity || "—"
    ];
    cells.forEach((value) => {
      const cell = document.createElement("td");
      cell.textContent = value;
      row.appendChild(cell);
    });
    eventsBody.appendChild(row);
  });
}

function renderFilters(summary) {
  const catEntries = Object.keys(summary.categoryCounts || {});
  filterCategory.innerHTML = "";
  const allOpt = document.createElement("option");
  allOpt.value = "all";
  allOpt.textContent = "All";
  filterCategory.appendChild(allOpt);
  catEntries.forEach((cat) => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = labelCategory(cat);
    filterCategory.appendChild(opt);
  });
  filterCategory.value = selectedCategory || "all";
}

function renderCharts(summary) {
  const actionsCtx = document.getElementById("chart-actions");
  const catsCtx = document.getElementById("chart-categories");
  const actionEntries = Object.entries(summary.actionCounts || {});
  const catEntries = Object.entries(summary.categoryCounts || {}).sort((a, b) => b[1] - a[1]).slice(0, 8);

  if (actionChart) actionChart.destroy();
  if (categoryChart) categoryChart.destroy();

  actionChart = new Chart(actionsCtx, {
    type: "doughnut",
    data: {
      labels: actionEntries.map(([k]) => k),
      datasets: [
        {
          data: actionEntries.map(([, v]) => v),
          backgroundColor: actionEntries.map(([k]) => {
            if (k === "blocked") return "#EF4444";
            if (k === "override") return "#F59E0B";
            if (k === "warning") return "#3B82F6";
            if (k === "sanitized") return "#64748B";
            return "#94A3B8";
          })
        }
      ]
    },
    options: {
      plugins: {
        legend: { position: "bottom" }
      }
    }
  });

  categoryChart = new Chart(catsCtx, {
    type: "bar",
    data: {
      labels: catEntries.map(([k]) => labelCategory(k)),
      datasets: [
        {
          label: "Count",
          data: catEntries.map(([, v]) => v),
          backgroundColor: "#3B82F6"
        }
      ]
    },
    options: {
      indexAxis: "y",
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: { grid: { color: "rgba(148,163,184,0.2)" } },
        y: { grid: { display: false } }
      }
    }
  });
}

async function loadData() {
  const tenant = tenantId;
  const limit = limitSelect ? (Number(limitSelect.value) || 50) : 50;
  if (!tenant || !adminToken) {
    statusEl.textContent = "Login required.";
    statusEl.style.color = "#F87171";
    return;
  }
  statusEl.textContent = "Loading…";
  statusEl.style.color = "#94A3B8";
  try {
    const [summary, eventsResponse] = await Promise.all([
      fetchJson(`${apiBase}/tenants/${encodeURIComponent(tenant)}/summary`, ""),
      fetchJson(`${apiBase}/tenants/${encodeURIComponent(tenant)}/events?limit=${limit}`, "")
    ]);
    cachedSummary = summary;
    cachedEvents = eventsResponse.events || [];
    currentPage = 1;
    selectedCategory = "all";
    renderCategoryPills(summary.categoryCounts);
    renderFilters(summary);
    updateViews();
    persistConfig(tenant, limit);
  } catch (err) {
    statusEl.textContent = `Error: ${err.message}`;
    lastUpdated.textContent = "Last updated: error";
    statusEl.style.color = "#F87171";
  }
}

if (refreshBtn) refreshBtn.addEventListener("click", () => loadData());
if (limitSelect) limitSelect.addEventListener("change", () => {
  currentPage = 1;
  loadData();
});
filterAction.addEventListener("change", () => updateViews());
filterCategory.addEventListener("change", (e) => {
  selectedCategory = e.target.value;
  renderCategoryPills(cachedSummary.categoryCounts || {});
  updateViews();
});
if (searchInput) {
  searchInput.addEventListener("input", () => {
    currentPage = 1;
    updateViews();
  });
}
if (prevPageBtn && nextPageBtn) {
  prevPageBtn.style.display = "none";
  nextPageBtn.style.display = "none";
}
if (tableHeaders?.length) {
  const applySortClasses = () => {
    tableHeaders.forEach((node) => node.classList.remove("sorted-asc", "sorted-desc"));
    if (sortField && sortDir) {
      tableHeaders.forEach((node) => {
        if (node.dataset.field === sortField) {
          node.classList.add(sortDir === "asc" ? "sorted-asc" : "sorted-desc");
        }
      });
    }
  };
  tableHeaders.forEach((th) => {
    th.addEventListener("click", () => {
      const field = th.dataset.field;
      if (!field) return;
      if (sortField === field) {
        if (sortDir === "asc") {
          sortDir = "desc";
        } else if (sortDir === "desc") {
          sortField = null;
          sortDir = null;
        } else {
          sortDir = "asc";
        }
      } else {
        sortField = field;
        sortDir = field === "timestamp" ? "desc" : "asc";
      }
      currentPage = 1;
      applySortClasses();
      updateViews();
    });
  });
  applySortClasses();
}

// Auto-refresh logic (enabled by default now that toggle is removed)
function startAutoRefresh() {
  if (refreshTimer) clearInterval(refreshTimer);
  refreshTimer = setInterval(() => {
    loadData();
  }, 5000);
}

if (autoRefresh) {
  autoRefresh.addEventListener("change", () => {
    if (refreshTimer) {
      clearInterval(refreshTimer);
      refreshTimer = null;
    }
    if (autoRefresh.checked) {
      startAutoRefresh();
    }
  });
} else {
  // If control is missing, default to auto-refreshing
  startAutoRefresh();
}

function toggleSettings(open) {
  if (!settingsDrawer) return;
  if (open) {
    settingsDrawer.classList.remove("hidden");
    applyTenantConfigUI();
    pendingSettingsHash = false;
  } else {
    settingsDrawer.classList.add("hidden");
    settingsStatus.textContent = "";
  }
}

async function saveSettings() {
  if (!tenantId || !adminToken) return;
  settingsStatus.textContent = "Saving…";
  settingsStatus.style.color = "#94A3B8";
  const patch = {
    displayName: settingsDisplayName.value.trim() || undefined,
    defaults: {},
    savedViews: tenantConfig?.savedViews || [],
    branding: {
      logoUrl: uploadedLogoDataUrl || tenantConfig?.branding?.logoUrl,
      accentColor: tenantConfig?.branding?.accentColor,
      faviconUrl: tenantConfig?.branding?.faviconUrl
    }
  };
  const favVal = (settingsFaviconUrl?.value || "").trim();
  const accentVal = (settingsAccentColor?.value || "").trim();
  if (favVal) patch.branding.faviconUrl = favVal;
  if (accentVal) patch.branding.accentColor = accentVal;
  try {
    const resp = await fetchJson(`${apiBase}/admin/tenants/${encodeURIComponent(tenantId)}/config`, "");
    tenantConfig = resp.config || {};
    tenantConfig = { ...tenantConfig, ...patch, defaults: { ...(tenantConfig.defaults || {}), ...(patch.defaults || {}) } };
    const saveResp = await fetch(`${apiBase}/admin/tenants/${encodeURIComponent(tenantId)}/config`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(adminToken.toLowerCase().startsWith("bearer ") || isJwtToken(adminToken)
          ? { Authorization: adminToken.toLowerCase().startsWith("bearer ") ? adminToken : `Bearer ${adminToken}` }
          : { "X-PRAI-Admin-Key": adminToken })
      },
      body: JSON.stringify(patch)
    });
    if (!saveResp.ok) {
      const txt = await saveResp.text();
      throw new Error(txt || "Save failed");
    }
    const saved = await saveResp.json();
    tenantConfig = saved.config;
    applyTenantConfigUI();
    settingsStatus.textContent = "Saved.";
    settingsStatus.style.color = "#34D399";
    if (currentTenant) currentTenant.textContent = tenantConfig?.displayName || tenantId || "—";
    if (tenantConfig.defaults?.limit && limitSelect) {
      limitSelect.value = String(tenantConfig.defaults.limit);
      loadData();
    }
  } catch (err) {
    settingsStatus.textContent = `Error: ${err.message}`;
    settingsStatus.style.color = "#F87171";
  }
}

settingsBtn?.addEventListener("click", () => {
  window.location.hash = "#settings";
  if (adminToken && tenantId) {
    toggleSettings(true);
  } else {
    pendingSettingsHash = true;
  }
});
settingsClose?.addEventListener("click", () => toggleSettings(false));
settingsSave?.addEventListener("click", () => {
  saveSettings().then(() => toggleSettings(false));
});
settingsTheme?.addEventListener("change", () => applyTheme(settingsTheme.value));

sensitivitySlider?.addEventListener("input", () => {
  if (sensitivityValue) sensitivityValue.textContent = sensitivitySlider.value;
});

saveSensitivityBtn?.addEventListener("click", async () => {
  if (!tenantId || !adminToken) return;
  sensitivityStatus.textContent = "Saving...";
  sensitivityStatus.style.color = "#94A3B8";
  const val = Number(sensitivitySlider.value);
  const patch = { sensitivityThreshold: val };
  try {
    const resp = await fetchJson(`${apiBase}/admin/tenants/${encodeURIComponent(tenantId)}/config`, "");
    let current = resp.config || {};
    current = { ...current, sensitivityThreshold: val };
    const saveResp = await fetch(`${apiBase}/admin/tenants/${encodeURIComponent(tenantId)}/config`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(adminToken.toLowerCase().startsWith("bearer ") || isJwtToken(adminToken)
          ? { Authorization: adminToken.toLowerCase().startsWith("bearer ") ? adminToken : `Bearer ${adminToken}` }
          : { "X-PRAI-Admin-Key": adminToken })
      },
      body: JSON.stringify(patch)
    });
    if (!saveResp.ok) {
      const txt = await saveResp.text();
      throw new Error(txt || "Save failed");
    }
    const saved = await saveResp.json();
    tenantConfig = saved.config;
    applyTenantConfigUI();
    sensitivityStatus.textContent = "Saved.";
    sensitivityStatus.style.color = "#34D399";
    setTimeout(() => {
      sensitivityStatus.textContent = "";
    }, 3000);
  } catch (err) {
    sensitivityStatus.textContent = `Error: ${err.message}`;
    sensitivityStatus.style.color = "#F87171";
  }
});

settingsDrawer?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    settingsSave?.click();
  }
});
savedViewSelect?.addEventListener("change", () => {
  const name = savedViewSelect.value;
  if (!name) return;
  const match = (tenantConfig?.savedViews || []).find((v) => v.name === name);
  if (!match) return;
  const { filters = {} } = match;
  if (filters.action) filterAction.value = filters.action;
  else filterAction.value = "all";
  if (filters.category) {
    filterCategory.value = filters.category;
    selectedCategory = filters.category;
  } else {
    filterCategory.value = "all";
    selectedCategory = "all";
  }
  if (filters.search && searchInput) searchInput.value = filters.search;
  if (filters.limit) limitSelect.value = String(filters.limit);
  if (filters.sortField) sortField = filters.sortField;
  if (filters.sortDir) sortDir = filters.sortDir;
  updateViews();
  savedViewNameApplied = name;
  persistConfig(tenantId, limitSelect ? (Number(limitSelect.value) || 50) : 50, name);
});

function unlockDashboard() {
  authGate.classList.add("hidden");
  appShell.classList.remove("hidden");
  currentTenant.textContent = tenantConfig?.displayName || tenantId || "—";
  initAdminMenu();
}

function lockDashboard(message = "") {
  appShell.classList.add("hidden");
  authGate.classList.remove("hidden");
  if (message) {
    authStatus.textContent = message;
    authStatus.style.color = "#F87171";
  } else {
    authStatus.textContent = "";
  }
}

async function validateToken(candidate) {
  const headers = {};
  if (!candidate) return false;
  headers.Authorization = candidate.toLowerCase().startsWith("bearer ") ? candidate : `Bearer ${candidate}`;
  try {
    const resp = await fetch(`${apiBase}/admin/ping`, { headers });
    if (!resp.ok) return false;
    const data = await resp.json();
    return Boolean(data && data.ok);
  } catch (_) {
    return false;
  }
}

async function handleAuth() {
  const tenant = authTenantInput.value.trim();
  const email = authEmailInput.value.trim();
  const password = authPasswordInput.value.trim();
  if (!tenant || !email || !password) {
    authStatus.textContent = "Tenant, email, and password are required.";
    authStatus.style.color = "#F87171";
    return;
  }
  authStatus.textContent = "Validating…";
  authStatus.style.color = "#94A3B8";
  try {
    const resp = await fetch(`${apiBase}/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenantId: tenant, email, password })
    });
    if (!resp.ok) {
      authStatus.textContent = "Invalid credentials.";
      authStatus.style.color = "#F87171";
      return;
    }
    const data = await resp.json();
    const canonicalTenantId = data.tenantId || tenant;
    adminToken = `Bearer ${data.token}`;
    localStorage.setItem("praivacy-admin-token", adminToken);
    tenantId = canonicalTenantId;
    persistConfig(canonicalTenantId, limitSelect ? (Number(limitSelect.value) || 50) : 50);

    if (data.name) localStorage.setItem("praivacy-user-name", data.name);
    if (data.email) localStorage.setItem("praivacy-user-email", data.email);

    authTenantInput.value = canonicalTenantId;
    authStatus.textContent = "";
    unlockDashboard();
    initAdminMenu();
    await loadTenantConfig();
    if (data.requirePasswordChange) {
      const newPass = window.prompt("Temporary password used. Set a new password (min 8 chars):");
      if (newPass && newPass.length >= 8) {
        const changeResp = await fetch(`${apiBase}/admin/change-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: adminToken },
          body: JSON.stringify({ newPassword: newPass })
        });
        if (changeResp.ok) {
          const changeData = await changeResp.json();
          adminToken = `Bearer ${changeData.token}`;
          localStorage.setItem("praivacy-admin-token", adminToken);
        } else {
          authStatus.textContent = "Password change failed.";
          authStatus.style.color = "#F87171";
          return;
        }
      } else {
        authStatus.textContent = "Password change required.";
        authStatus.style.color = "#F87171";
        return;
      }
    }
    loadData();
    ensureSettingsVisibleIfRequested();
  } catch (err) {
    authStatus.textContent = "Login failed.";
    authStatus.style.color = "#F87171";
  }
}

authSubmit.addEventListener("click", handleAuth);
authPasswordInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    handleAuth();
  }
});
authTenantInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    handleAuth();
  }
});

logoutBtn.addEventListener("click", () => {
  adminToken = "";
  tenantId = "";
  localStorage.removeItem("praivacy-admin-token");
  localStorage.removeItem(STORAGE_KEY);
  location.reload();
});

loadStoredConfig();
(async () => {
  const storedToken = localStorage.getItem("praivacy-admin-token");
  const tokenTenantId = extractTenantIdFromToken(storedToken);
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed.tenant) tenantId = parsed.tenant;
      if (parsed.limit) limitSelect.value = String(parsed.limit);
    } catch (_) { }
  }
  const storedDisplay = localStorage.getItem(DISPLAY_NAME_KEY);
  if (storedDisplay) {
    const brandNameEl = document.querySelector(".brand-name");
    if (brandNameEl) brandNameEl.textContent = storedDisplay;
    if (currentTenant) currentTenant.textContent = storedDisplay;
  }
  if (tokenTenantId && tenantId !== tokenTenantId) {
    tenantId = tokenTenantId;
    persistConfig(tenantId, limitSelect ? (Number(limitSelect.value) || 50) : 50, savedViewNameApplied || "");
  }
  if (storedToken && (await validateToken(storedToken)) && tenantId) {
    adminToken = storedToken;
    unlockDashboard();
    initAdminMenu();

    // Auto-fetch user info if missing
    if (!localStorage.getItem("praivacy-user-name")) {
      try {
        const me = await fetchJson(`${apiBase}/admin/me`);
        if (me.name) localStorage.setItem("praivacy-user-name", me.name);
        if (me.email) localStorage.setItem("praivacy-user-email", me.email);
        // Re-run menu update to show fetches
        // But initAdminMenu calls updateUserMenu internally in my previous edit?
        // Let's check app.js initAdminMenu. Yes it does. So calling it again or extracting updateUserMenu globally would be cleaner.
        // But updateUserMenu is scoped inside initAdminMenu in my previous edit (step 909)?
        // Wait, step 909: "Adding updateUserMenu logic inside initAdminMenu scope".
        // So I cannot call updateUserMenu from outside!
        // Correct approach: reload the page? No.
        // I should move updateUserMenu to global scope or re-call initAdminMenu?
        // initAdminMenu adds event listeners. Calling it twice will double listeners.
        // I should have made updateUserMenu global.
        // For now, I'll inline the update logic here or just rely on next reload? The user wants it now.
        // I will manually update the DOM elements here.
        const nameEl = document.getElementById("menu-user-name");
        const emailEl = document.getElementById("menu-user-email");
        if (nameEl && me.name) nameEl.textContent = me.name;
        if (emailEl && me.email) emailEl.textContent = me.email;
      } catch (_) { }
    }

    await loadTenantConfig();
    loadData();
    if (window.location.hash === "#settings") {
      toggleSettings(true);
    }
  } else {
    lockDashboard();
  }
})();
