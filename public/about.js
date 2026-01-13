const STORAGE_KEY = "praivacy-dashboard-config";

const logoutBtn = document.getElementById("logout-btn");
const settingsBtn = document.getElementById("settings-btn");
const brandNameEl = document.querySelector(".brand-name");
const brandLogoEl = document.querySelector(".brand-logo");
const adminMenu = document.getElementById("admin-menu");
const adminMenuToggle = document.getElementById("admin-menu-toggle");

function getStoredTenant() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed.tenant || null;
  } catch (_) {
    return null;
  }
}

function ensureAuth() {
  const token = localStorage.getItem("praivacy-admin-token");
  const tenant = getStoredTenant();
  if (!token || !tenant) {
    window.location.href = "/index.html";
  }

  // Self-heal user info
  if (!localStorage.getItem("praivacy-user-name")) {
    const headers = {};
    const auth = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    headers["Authorization"] = auth;
    fetch(`/api/v1/admin/me`, { headers })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          if (data.name) localStorage.setItem("praivacy-user-name", data.name);
          if (data.email) localStorage.setItem("praivacy-user-email", data.email);
          updateUserMenu();
        }
      })
      .catch(() => { });
  }
}

async function applyBranding() {
  const tenant = getStoredTenant();
  const adminToken = localStorage.getItem("praivacy-admin-token");
  if (!tenant || !adminToken) return;
  const headers = {};
  if (adminToken.toLowerCase().startsWith("bearer ") || adminToken.split(".").length === 3) {
    headers.Authorization = adminToken.toLowerCase().startsWith("bearer ") ? adminToken : `Bearer ${adminToken}`;
  } else {
    headers["X-PRAI-Admin-Key"] = adminToken;
  }
  try {
    const resp = await fetch(`/api/v1/admin/tenants/${encodeURIComponent(tenant)}/config`, { headers });
    if (!resp.ok) return;
    const data = await resp.json();
    const config = data.config || {};
    if (brandNameEl && (config.displayName || tenant)) {
      brandNameEl.textContent = config.displayName || tenant;
    }
    if (brandLogoEl && config.branding?.logoUrl) {
      brandLogoEl.src = config.branding.logoUrl;
    }
  } catch (_) {
    // best effort
  }
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
  adminMenu.addEventListener("click", (e) => e.stopPropagation());
  document.addEventListener("click", (e) => {
    if (adminMenu.contains(e.target) || adminMenuToggle.contains(e.target)) return;
    closeMenu();
  });

  // Update User Info
  const n = localStorage.getItem("praivacy-user-name");
  const e = localStorage.getItem("praivacy-user-email");
  const nameEl = document.getElementById("menu-user-name");
  const emailEl = document.getElementById("menu-user-email");
  if (nameEl && n) nameEl.textContent = n;
  if (emailEl && e) emailEl.textContent = e;
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("praivacy-admin-token");
    localStorage.removeItem(STORAGE_KEY);
    window.location.href = "/index.html";
  });
}

if (settingsBtn) {
  settingsBtn.addEventListener("click", () => {
    window.location.href = "/index.html#settings";
  });
}

ensureAuth();
applyBranding();
initAdminMenu();
