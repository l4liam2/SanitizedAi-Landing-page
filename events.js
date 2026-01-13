const limitSelect = document.getElementById("limit");
const statusEl = document.getElementById("config-status");
const refreshBtn = document.getElementById("refresh-btn");
const exportBtn = document.getElementById("export-btn");
const exportXlsxBtn = document.getElementById("export-xlsx-btn");
const eventsBody = document.getElementById("events-body");
const reportsBody = document.getElementById("reports-body");
const filterAction = document.getElementById("filter-action");
const filterCategory = document.getElementById("filter-category");
const startDateInput = document.getElementById("start-date");
const endDateInput = document.getElementById("end-date");
const authGate = document.getElementById("auth-gate");
const authTenantInput = document.getElementById("auth-tenant");
const authEmailInput = document.getElementById("auth-email");
const authPasswordInput = document.getElementById("auth-password");
const authSubmit = document.getElementById("auth-submit");
const authStatus = document.getElementById("auth-status");
const appShell = document.getElementById("app-shell");
const logoutBtn = document.getElementById("logout-btn");
const currentTenant = document.getElementById("current-tenant");
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
const settingsCategoryLabels = document.getElementById("settings-category-labels");
const settingsStatus = document.getElementById("settings-status");
const savedViewSelect = document.getElementById("saved-view-select");
const settingsLogoUpload = document.getElementById("settings-logo-upload");
const logoPreviewImg = document.getElementById("logo-preview-img");
const settingsFaviconUrl = document.getElementById("settings-favicon-url");
const settingsAccentColor = document.getElementById("settings-accent-color");
const settingsTheme = document.getElementById("settings-theme");
const adminMenu = document.getElementById("admin-menu");
const adminMenuToggle = document.getElementById("admin-menu-toggle");
let uploadedLogoDataUrl = null;

const STORAGE_KEY = "praivacy-dashboard-config";
const THEME_KEY = "praivacy-theme";
const DISPLAY_NAME_KEY = "praivacy-display-name";
const apiBase = `${window.location.origin}/api/v1`;
const VIEW_KEY = "praivacy-saved-view";
let cachedEvents = [];
let adminToken = "";
let tenantId = "";
let currentPage = 1;
let sortField = "timestamp";
let sortDir = "desc";
let tenantConfig = null;
let savedViewNameApplied = "";
let pendingSettingsHash = window.location.hash === "#settings";
let socket = null;

function setupSocket() {
  if (socket) {
    if (tenantId) socket.emit("join_tenant", tenantId);
    return;
  }
  if (!window.io) return;

  socket = window.io();

  socket.on("connect", () => {
    if (tenantId) {
      socket.emit("join_tenant", tenantId);
    }
  });

  socket.on("telemetry_new_events", (newEvents) => {
    if (!newEvents || !newEvents.length) return;

    // Add to cache
    const existingIds = new Set(cachedEvents.map((e) => e.id));
    const uniqueNew = newEvents.filter((e) => !existingIds.has(e.id));

    if (uniqueNew.length > 0) {
      cachedEvents.unshift(...uniqueNew);

      // Update UI if on first page
      if (currentPage === 1) {
        updateTableView();
      }

      // Flash status
      statusEl.textContent = `Live: +${uniqueNew.length} event(s)`;
      statusEl.style.color = "#34D399";
      setTimeout(() => {
        if (statusEl.textContent.startsWith("Live:")) {
          statusEl.textContent = `Updated ${new Date().toLocaleTimeString()}`;
          statusEl.style.color = "#94A3B8";
        }
      }, 3000);
    }
  });
}

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

initAdminMenu();

function initAdminMenu() {
  if (!adminMenu || !adminMenuToggle) return;

  // Use dataset to ensure single initialization
  if (adminMenuToggle.dataset.menuInitialized === "true") {
    // Just update user info if re-called
    const n = localStorage.getItem("praivacy-user-name");
    const e = localStorage.getItem("praivacy-user-email");
    const nameEl = document.getElementById("menu-user-name");
    const emailEl = document.getElementById("menu-user-email");
    if (nameEl && n) nameEl.textContent = n;
    if (emailEl && e) emailEl.textContent = e;
    return;
  }
  adminMenuToggle.dataset.menuInitialized = "true";

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

  // User Info Display
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

function ensureSettingsVisibleIfRequested() {
  if (pendingSettingsHash && adminToken && tenantId) {
    toggleSettings(true);
  }
}

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

  // Title Case fallback
  return cat.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function labelHost(host) {
  if (!host) return "—";
  return tenantConfig?.hostLabels?.[host] || host;
}

function labelRule(rule) {
  if (!rule) return "—";
  return tenantConfig?.ruleLabels?.[rule] || rule;
}

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
  if (filters.limit) limitSelect.value = String(filters.limit);
  if (filters.sortField) sortField = filters.sortField;
  if (filters.sortDir) sortDir = filters.sortDir;
  if (filters.dateRangeDays && startDateInput && endDateInput) {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - filters.dateRangeDays);
    startDateInput.valueAsDate = start;
    endDateInput.valueAsDate = end;
  }
  updateTableView();
  savedViewNameApplied = name;
  persistConfig(tenantId, Number(limitSelect.value) || 50, name);
}

function loadStoredConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (parsed.tenant) tenantId = parsed.tenant;
    if (parsed.limit) limitSelect.value = String(parsed.limit);
    if (parsed.savedView) savedViewNameApplied = parsed.savedView;
    const theme = localStorage.getItem(THEME_KEY) || "dark";
    applyTheme(theme);
    setupSocket();
  } catch (_) { }
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
  if (tenantConfig.defaults?.dateRangeDays && startDateInput && endDateInput) {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - tenantConfig.defaults.dateRangeDays);
    startDateInput.valueAsDate = start;
    endDateInput.valueAsDate = end;
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

function applyFilters(events) {
  const action = filterAction.value;
  const category = filterCategory.value;
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
      case "userName":
        return (a.userName || a.userEmail || "").localeCompare(b.userName || b.userEmail || "") * dir;
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
  if (paginationInfo) paginationInfo.textContent = `${events.length} events`;
  if (prevPageBtn && nextPageBtn) {
    prevPageBtn.style.display = "none";
    nextPageBtn.style.display = "none";
  }
  return [...events];
}

function renderFilters(events) {
  const categories = new Set();
  events.forEach((event) => {
    (event.categories || []).forEach((cat) => categories.add(cat));
  });
  filterCategory.innerHTML = "";
  const allOpt = document.createElement("option");
  allOpt.value = "all";
  allOpt.textContent = "All";
  filterCategory.appendChild(allOpt);
  Array.from(categories).forEach((cat) => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = labelCategory(cat);
    filterCategory.appendChild(opt);
  });
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
      { text: event.userName || event.userEmail || event.userId || "—", title: event.userEmail || event.userName || event.userId || "" },
      labelHost(event.host),
      event.action || "—",
      (event.categories || []).map((c) => labelCategory(c)).join(", ") || "—",
      (event.rules || []).map((r) => labelRule(r)).join(", ") || "—",
      event.severity?.toFixed ? event.severity.toFixed(2) : event.severity || "—"
    ];
    cells.forEach((value) => {
      const cell = document.createElement("td");
      if (typeof value === "object" && value !== null) {
        cell.textContent = value.text;
        if (value.title) cell.title = value.title;
      } else {
        cell.textContent = value;
      }
      row.appendChild(cell);
    });
    eventsBody.appendChild(row);
  });
}

function renderReports(events) {
  if (!reportsBody) return;
  reportsBody.innerHTML = "";
  if (!events || !events.length) {
    reportsBody.innerHTML = '<tr><td colspan="5" class="placeholder">No false positive reports.</td></tr>';
    return;
  }
  events.forEach(e => {
    const row = document.createElement("tr");
    const rules = Array.isArray(e.rules) ? e.rules.join(", ") : (e.rules || "None");
    const reportedText = e.reportedText ? e.reportedText : "<em>No content</em>";

    row.innerHTML = `
      <td>
        <div style="font-weight: 500">${e.userName || "Unknown"}</div>
        <div class="micro">${e.userEmail || "—"}</div>
      </td>
      <td class="micro">${new Date(e.timestamp).toLocaleString()}</td>
      <td style="max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${String(reportedText).replace(/"/g, '&quot;')}">${reportedText}</td>
      <td class="micro">${rules}</td>
      <td>
        <button class="ghost small delete-btn" title="Dismiss Report" data-id="${e.id}" style="color: #F87171; padding: 4px 8px;">✕</button>
      </td>
    `;
    reportsBody.appendChild(row);
  });

  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", async (ev) => {
      const eventId = ev.target.dataset.id;
      if (!eventId || !confirm("Are you sure you want to dismiss this report?")) return;

      try {
        const resp = await fetch(`${apiBase}/tenants/${encodeURIComponent(tenantId)}/events/${encodeURIComponent(eventId)}`, {
          method: "DELETE",
          headers: {
            "Authorization": adminToken.toLowerCase().startsWith("bearer ") ? adminToken : `Bearer ${adminToken}`
          }
        });
        if (resp.ok) {
          ev.target.closest("tr").remove();
          // Optionally reload if empty
          if (!reportsBody.querySelector("tr")) {
            reportsBody.innerHTML = '<tr><td colspan="5" class="placeholder">No false positive reports.</td></tr>';
          }
        } else {
          alert("Failed to delete report");
        }
      } catch (err) {
        console.error("Delete failed", err);
        alert("Delete failed");
      }
    });
  });
}

function updateTableView() {
  const filtered = sortEvents(applyFilters(cachedEvents));
  const page = paginateEvents(filtered);
  renderEvents(page);
}

function buildQueryParams(limit) {
  const params = new URLSearchParams();
  params.set("limit", limit);
  if (startDateInput.value) params.set("start", startDateInput.value);
  if (endDateInput.value) params.set("end", endDateInput.value);
  return params.toString();
}

async function loadData() {
  const tenant = tenantId;
  const limit = Number(limitSelect.value) || 200;
  if (!tenant || !adminToken) {
    statusEl.textContent = "Login required.";
    statusEl.style.color = "#F87171";
    return;
  }
  statusEl.textContent = "Loading…";
  statusEl.style.color = "#94A3B8";
  try {
    const params = buildQueryParams(limit);
    const eventsResponse = await fetchJson(`${apiBase}/tenants/${encodeURIComponent(tenant)}/events?${params}`, "");
    cachedEvents = eventsResponse.events || [];
    renderFilters(cachedEvents);
    currentPage = 1;
    updateTableView();
    statusEl.textContent = `Updated ${new Date().toLocaleTimeString()}`;
    statusEl.style.color = "#34D399";
    persistConfig(tenant, limit);

    // Load reports separately to not block main events view
    fetchJson(`${apiBase}/tenants/${encodeURIComponent(tenant)}/events?action=false_positive_report&limit=50`, "")
      .then(resp => renderReports(resp.events))
      .catch(err => console.warn("Failed to load reports", err));
  } catch (err) {
    statusEl.textContent = `Error: ${err.message}`;
    statusEl.style.color = "#F87171";
  }
}

function exportCsv() {
  const tenant = tenantId;
  const limit = Number(limitSelect.value) || 200;
  if (!tenant || !adminToken) return;
  const params = buildQueryParams(limit);
  const url = `${apiBase}/tenants/${encodeURIComponent(tenant)}/events.csv?${params}`;
  const headers = {};
  if (adminToken.toLowerCase().startsWith("bearer ") || isJwtToken(adminToken)) {
    headers.Authorization = adminToken.toLowerCase().startsWith("bearer ") ? adminToken : `Bearer ${adminToken}`;
  } else {
    headers["X-PRAI-Admin-Key"] = adminToken;
  }
  fetch(url, { headers })
    .then((resp) => resp.blob())
    .then((blob) => {
      const href = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = href;
      a.download = `${tenant}_events.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(href);
    })
    .catch((err) => {
      statusEl.textContent = `Export failed: ${err.message}`;
      statusEl.style.color = "#F87171";
    });
}

function exportXlsx() {
  const tenant = tenantId;
  const limit = Number(limitSelect.value) || 200;
  if (!tenant || !adminToken) return;
  const params = buildQueryParams(limit);
  const url = `${apiBase}/tenants/${encodeURIComponent(tenant)}/events.csv?${params}`;
  const headers = {};
  if (adminToken.toLowerCase().startsWith("bearer ") || isJwtToken(adminToken)) {
    headers.Authorization = adminToken.toLowerCase().startsWith("bearer ") ? adminToken : `Bearer ${adminToken}`;
  } else {
    headers["X-PRAI-Admin-Key"] = adminToken;
  }
  fetch(url, { headers })
    .then((resp) => resp.blob())
    .then((blob) => {
      const href = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = href;
      a.download = `${tenant}_events.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(href);
    })
    .catch((err) => {
      statusEl.textContent = `Export failed: ${err.message}`;
      statusEl.style.color = "#F87171";
    });
}


refreshBtn.addEventListener("click", () => loadData());
limitSelect.addEventListener("change", () => {
  currentPage = 1;
  loadData();
});
exportBtn.addEventListener("click", () => exportCsv());
exportXlsxBtn.addEventListener("click", () => exportXlsx());
filterAction.addEventListener("change", () => {
  currentPage = 1;
  updateTableView();
});
filterCategory.addEventListener("change", () => {
  currentPage = 1;
  updateTableView();
});
if (searchInput) {
  searchInput.addEventListener("input", () => {
    currentPage = 1;
    updateTableView();
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
      updateTableView();
    });
  });
  applySortClasses();
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
    categoryLabels: parseMapInput(settingsCategoryLabels.value),
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
    currentTenant.textContent = tenantConfig?.displayName || tenantId || "—";
    if (tenantConfig.defaults?.limit) {
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
  filterAction.value = filters.action || "all";
  selectedCategory = filters.category || "all";
  filterCategory.value = selectedCategory;
  if (filters.search && searchInput) searchInput.value = filters.search;
  if (filters.limit) limitSelect.value = String(filters.limit);
  if (filters.sortField) sortField = filters.sortField;
  if (filters.sortDir) sortDir = filters.sortDir;
  if (filters.dateRangeDays && startDateInput && endDateInput) {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - filters.dateRangeDays);
    startDateInput.valueAsDate = start;
    endDateInput.valueAsDate = end;
  }
  updateTableView();
  savedViewNameApplied = name;
  persistConfig(tenantId, Number(limitSelect.value) || 50, name);
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
    tenantId = canonicalTenantId;
    setupSocket();
    localStorage.setItem("praivacy-admin-token", adminToken);
    persistConfig(canonicalTenantId, Number(limitSelect.value) || 50);
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
  authTenantInput.value = "";
  authEmailInput.value = "";
  authPasswordInput.value = "";
  currentTenant.textContent = "—";
  lockDashboard("Logged out. Enter credentials to continue.");
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
    persistConfig(tenantId, Number(limitSelect.value) || 50, savedViewNameApplied || "");
  }
  if (storedToken && tenantId) {
    adminToken = storedToken;
    authTenantInput.value = tenantId;
    unlockDashboard();
    unlockDashboard();
    initAdminMenu();

    // Auto-fetch user info if missing
    if (!localStorage.getItem("praivacy-user-name")) {
      try {
        const me = await fetchJson(`${apiBase}/admin/me`, adminToken);
        if (me.name) localStorage.setItem("praivacy-user-name", me.name);
        if (me.email) localStorage.setItem("praivacy-user-email", me.email);
        const nameEl = document.getElementById("menu-user-name");
        const emailEl = document.getElementById("menu-user-email");
        if (nameEl && me.name) nameEl.textContent = me.name;
        if (emailEl && me.email) emailEl.textContent = me.email;
      } catch (_) { }
    }

    await loadTenantConfig();
    loadData();
    // Do a background ping but do NOT force logout on failure; surface status instead.
    validateToken(storedToken).then((ok) => {
      if (!ok) {
        statusEl.textContent = "Session may be invalid. Reload data or re-enter admin key.";
        statusEl.style.color = "#F87171";
      }
    });
    if (window.location.hash === "#settings") {
      toggleSettings(true);
    }
    return;
  }
  lockDashboard();
})();
