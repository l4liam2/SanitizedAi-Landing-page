const apiBase = `${window.location.origin}/api/v1`;
const authGate = document.getElementById("auth-gate");
const appShell = document.getElementById("app-shell");
const authStatus = document.getElementById("auth-status");
const authSubmit = document.getElementById("auth-submit");
const superTokenInput = document.getElementById("super-token");
const logoutBtn = document.getElementById("logout-btn");
const refreshTenantsBtn = document.getElementById("refresh-tenants");
const tenantsStatus = document.getElementById("tenants-status");
const tenantsBody = document.getElementById("tenants-body");
const tenantIdInput = document.getElementById("tenant-id");
const tenantDisplayInput = document.getElementById("tenant-display");
// const tenantLogoInput = document.getElementById("tenant-logo"); // Removed
const tenantAccentInput = document.getElementById("tenant-accent");
const saveTenantBtn = document.getElementById("save-tenant");
const deleteTenantBtn = document.getElementById("delete-tenant");
const tenantStatus = document.getElementById("tenant-status");
const saUserLimit = document.getElementById("sa-user-limit");
const saLoadUsersBtn = document.getElementById("sa-load-users");
const saUsersBody = document.getElementById("sa-users-body");
const saUserTenantSelect = document.getElementById("sa-user-tenant");
const saUserEmail = document.getElementById("sa-user-email");
const saUserName = document.getElementById("sa-user-name");
const saUserDepartment = document.getElementById("sa-user-department");
const saUserRole = document.getElementById("sa-user-role");
const saUserStatus = document.getElementById("sa-user-status");
const saUserTemp = document.getElementById("sa-user-temp");
const saSaveUser = document.getElementById("sa-save-user");
const saDeleteUser = document.getElementById("sa-delete-user");
const saClearUser = document.getElementById("sa-clear-user");
const saResetPass = document.getElementById("sa-reset-pass");
const saUserStatusMsg = document.getElementById("sa-user-status-msg");

const footerStatus = document.getElementById("footer-status");
const toastContainer = document.getElementById("toast-container");

const navTenants = document.getElementById("nav-tenants");
const navUsers = document.getElementById("nav-users");

let superToken = "";
let selectedTenant = "";
let selectedUserId = "";
let tenantsCache = [];
const tenantIdMap = new Map();

function setStatus(el, msg, color = "#94A3B8") {
  if (!el) return;
  el.textContent = msg;
  el.style.color = color;
}

function buildHeaders() {
  const headers = { "Content-Type": "application/json" };
  if (!superToken) return headers;
  if (superToken.toLowerCase().startsWith("bearer ") || superToken.split(".").length === 3) {
    headers.Authorization = superToken.toLowerCase().startsWith("bearer ") ? superToken : `Bearer ${superToken}`;
  } else {
    headers["X-PRAI-Super-Admin-Key"] = superToken;
  }
  return headers;
}

async function fetchJson(path, opts = {}) {
  const headers = { ...buildHeaders(), ...(opts.headers || {}) };
  const resp = await fetch(path, { ...opts, headers });
  if (!resp.ok) {
    let detail = "";
    try {
      const data = await resp.json();
      detail = data && data.error ? data.error : "";
    } catch (_) {
      detail = await resp.text();
    }
    throw new Error(detail || `HTTP ${resp.status}`);
  }
  return resp.json();
}

async function validateSuperToken(token) {
  try {
    const headers = token.toLowerCase().startsWith("bearer ") || token.split(".").length === 3
      ? { Authorization: token.toLowerCase().startsWith("bearer ") ? token : `Bearer ${token}` }
      : { "X-PRAI-Super-Admin-Key": token };
    const resp = await fetch(`${apiBase}/admin/ping`, { headers });
    return resp.ok;
  } catch (_) {
    return false;
  }
}

function lock(message = "Enter super-admin token.") {
  appShell.classList.add("hidden");
  authGate.classList.remove("hidden");
  setStatus(authStatus, message);
}

function unlock() {
  authGate.classList.add("hidden");
  appShell.classList.remove("hidden");
}

async function loadTenants() {
  setStatus(tenantsStatus, "Loading tenants…");
  try {
    const data = await fetchJson(`${apiBase}/admin/tenants`);
    tenantsCache = data.tenants || [];
    renderTenants(tenantsCache);
    populateTenantSelect();
    setStatus(tenantsStatus, `Loaded ${data.tenants?.length || 0} tenants.`, "#22C55E");
  } catch (err) {
    setStatus(tenantsStatus, `Failed to load tenants: ${err.message}`, "#F87171");
  }
}

function renderTenants(tenants = []) {
  tenantsBody.innerHTML = "";
  if (!tenants.length) {
    tenantsBody.innerHTML = '<tr><td colspan="4" class="placeholder">No tenants.</td></tr>';
    return;
  }
  tenantIdMap.clear();
  tenants.forEach((t) => {
    if (t.displayName) {
      tenantIdMap.set(t.displayName.trim().toLowerCase(), t.tenantId);
    }
    const tr = document.createElement("tr");
    tr.classList.add("clickable");
    tr.innerHTML = `
      <td>${t.tenantId}</td>
      <td>${t.displayName || t.tenantId}</td>
      <td>${t.hasConfig ? "Yes" : "No"}</td>
      <td>${t.hasIngestKey ? "Yes" : "No"}</td>
    `;
    tr.addEventListener("click", () => selectTenant(t));
    tenantsBody.appendChild(tr);
  });
}

function selectTenant(t) {
  selectedTenant = t.tenantId;
  tenantIdInput.value = t.tenantId;
  tenantDisplayInput.value = t.displayName || "";
  setStatus(tenantStatus, `Selected ${t.tenantId}`, "#94A3B8");
  if (saUserTenantSelect) saUserTenantSelect.value = t.tenantId;
  loadTenantConfig();
  loadTenantUsers();
}

async function loadTenantConfig() {
  if (!selectedTenant) return;
  try {
    const data = await fetchJson(`${apiBase}/admin/tenants/${encodeURIComponent(selectedTenant)}/config`);
    const cfg = data.config || {};
    tenantDisplayInput.value = cfg.displayName || tenantDisplayInput.value;
    tenantLogoInput.value = cfg.branding?.logoUrl || "";
    tenantAccentInput.value = cfg.branding?.accentColor || "";
  } catch (err) {
    setStatus(tenantStatus, `Config load failed: ${err.message}`, "#F87171");
  }
}

async function saveTenant() {
  const tenantId = tenantIdInput.value.trim();
  if (!tenantId) {
    setStatus(tenantStatus, "Tenant ID required", "#F87171");
    return;
  }
  const body = {
    tenantId,
    config: {
      displayName: tenantDisplayInput.value.trim() || undefined,
      branding: {
        logoUrl: tenantLogoInput.value.trim() || undefined,
        accentColor: tenantAccentInput.value.trim() || undefined
      }
    }
  };
  setStatus(tenantStatus, "Saving…");
  try {
    await fetchJson(`${apiBase}/admin/tenants`, { method: "POST", body: JSON.stringify(body) });
    setStatus(tenantStatus, "Tenant saved.", "#22C55E");
    loadTenants();
  } catch (err) {
    setStatus(tenantStatus, `Save failed: ${err.message}`, "#F87171");
  }
}

async function deleteTenant() {
  if (!selectedTenant) {
    setStatus(tenantStatus, "Select a tenant first.", "#F87171");
    return;
  }
  if (!confirm(`Delete tenant ${selectedTenant}?`)) return;
  setStatus(tenantStatus, "Deleting…");
  try {
    await fetchJson(`${apiBase}/admin/tenants/${encodeURIComponent(selectedTenant)}`, { method: "DELETE" });
    setStatus(tenantStatus, "Tenant deleted.", "#22C55E");
    selectedTenant = "";
    tenantIdInput.value = "";
    tenantDisplayInput.value = "";
    tenantLogoInput.value = "";
    tenantAccentInput.value = "";
    saUsersBody.innerHTML = '<tr><td colspan="6" class="placeholder">Select a tenant.</td></tr>';
    loadTenants();
  } catch (err) {
    setStatus(tenantStatus, `Delete failed: ${err.message}`, "#F87171");
  }
}

async function loadTenantUsers() {
  const tenantChoice = resolveTenantChoice();
  if (!tenantChoice) {
    setStatus(tenantStatus, "Select a tenant first.", "#F87171");
    return;
  }
  selectedTenant = tenantChoice;
  try {
    const limit = saUserLimit.value || "25";
    const data = await fetchJson(
      `${apiBase}/admin/tenants/${encodeURIComponent(tenantChoice)}/users?limit=${encodeURIComponent(limit)}`
    );
    renderTenantUsers(data.users || []);
  } catch (err) {
    setStatus(tenantStatus, `Load users failed: ${err.message}`, "#F87171");
  }
}

function renderTenantUsers(users = []) {
  saUsersBody.innerHTML = "";
  if (!users.length) {
    saUsersBody.innerHTML = '<tr><td colspan="7" class="placeholder">No users.</td></tr>';
    return;
  }
  users.forEach((u) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${u.email || "—"}</td>
      <td>${u.name || "—"}</td>
      <td>${u.department || "—"}</td>
      <td>${u.role || "user"}</td>
      <td>${u.status || "unknown"}</td>
      <td>${u.passwordSetAt ? "Yes" : "No"}</td>
      <td>${u.passwordSetAt ? new Date(u.passwordSetAt).toLocaleString() : "—"}</td>
    `;
    tr.classList.add("clickable");
    tr.addEventListener("click", () => selectUser(u));
    saUsersBody.appendChild(tr);
  });
}

async function handleAuth() {
  const token = superTokenInput.value.trim();
  if (!token) {
    setStatus(authStatus, "Token required.", "#F87171");
    return;
  }
  setStatus(authStatus, "Validating…", "#94A3B8");
  const ok = await validateSuperToken(token);
  if (!ok) {
    setStatus(authStatus, "Invalid token.", "#F87171");
    return;
  }
  superToken = token;
  localStorage.setItem("praivacy-super-token", token);
  setStatus(authStatus, "");
  unlock();
  loadTenants();
}

authSubmit?.addEventListener("click", handleAuth);
superTokenInput?.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    handleAuth();
  }
});

logoutBtn?.addEventListener("click", () => {
  superToken = "";
  localStorage.removeItem("praivacy-super-token");
  lock("Logged out.");
});

refreshTenantsBtn?.addEventListener("click", loadTenants);
saveTenantBtn?.addEventListener("click", saveTenant);
deleteTenantBtn?.addEventListener("click", () => {
  if (!selectedTenant) {
    setStatus(tenantStatus, "Select a tenant first.", "#F87171");
    return;
  }
  const confirmed = window.confirm(`Are you sure you want to delete tenant "${selectedTenant}"? This cannot be undone.`);
  if (confirmed) deleteTenant();
});
saLoadUsersBtn?.addEventListener("click", loadTenantUsers);


const tenantLogoFile = document.getElementById("tenant-logo-file");
const logoPreviewContainer = document.getElementById("logo-preview-container");
const logoPreview = document.getElementById("logo-preview");
const clearLogoFileBtn = document.getElementById("clear-logo-file");

let currentLogoBase64 = "";

(async () => {
  const stored = localStorage.getItem("praivacy-super-token");
  if (stored && (await validateSuperToken(stored))) {
    superToken = stored;
    superTokenInput.value = stored;
    unlock();
    loadTenants();
  } else {
    lock();
  }
})();

function updateLogoPreview(src) {
  if (src) {
    logoPreview.src = src;
    logoPreviewContainer.classList.remove("hidden");
  } else {
    logoPreviewContainer.classList.add("hidden");
    logoPreview.src = "";
  }
}

tenantLogoFile?.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) { // Increased to 5MB to match server
    alert("File is too large. Max 5MB.");
    tenantLogoFile.value = "";
    return;
  }

  const reader = new FileReader();
  reader.onload = (ev) => {
    currentLogoBase64 = ev.target.result;
    updateLogoPreview(currentLogoBase64);
  };
  reader.readAsDataURL(file);
});

clearLogoFileBtn?.addEventListener("click", () => {
  tenantLogoFile.value = "";
  currentLogoBase64 = "";
  updateLogoPreview(null);
});

// Update saveTenant to use currentLogoBase64
const originalSaveTenant = saveTenant;
saveTenant = async function () {
  const tenantId = tenantIdInput.value.trim();
  if (!tenantId) {
    setStatus(tenantStatus, "Tenant ID required", "#F87171");
    return;
  }

  // Determine logo: File (Base64) only
  const logoToSave = currentLogoBase64 || "";

  const body = {
    tenantId,
    config: {
      displayName: tenantDisplayInput.value.trim() || undefined,
      branding: {
        logoUrl: logoToSave || undefined,
        accentColor: tenantAccentInput.value.trim() || undefined
      }
    }
  };
  setStatus(tenantStatus, "Saving…");
  try {
    await fetchJson(`${apiBase}/admin/tenants`, { method: "POST", body: JSON.stringify(body) });
    setStatus(tenantStatus, "Tenant saved.", "#22C55E");
    loadTenants();
  } catch (err) {
    setStatus(tenantStatus, `Save failed: ${err.message}`, "#F87171");
  }
};

// Hook into loadTenantConfig to set preview
const originalLoadConfig = loadTenantConfig;
loadTenantConfig = async function () {
  if (!selectedTenant) return;
  try {
    const data = await fetchJson(`${apiBase}/admin/tenants/${encodeURIComponent(selectedTenant)}/config`);
    const cfg = data.config || {};
    tenantDisplayInput.value = cfg.displayName || "";

    const logo = cfg.branding?.logoUrl || "";
    tenantLogoInput.value = "";
    currentLogoBase64 = logo.startsWith("data:") ? logo : ""; // Only support data URIs effectively now
    tenantLogoFile.value = "";

    tenantAccentInput.value = cfg.branding?.accentColor || "";

    updateLogoPreview(logo);

  } catch (err) {
    setStatus(tenantStatus, `Config load failed: ${err.message}`, "#F87171");
  }
};


function selectUser(user) {
  selectedUserId = user.id || user.email || "";
  saUserEmail.value = user.email || "";
  saUserName.value = user.name || "";
  saUserDepartment.value = user.department || "";
  saUserRole.value = user.role || "user";
  saUserStatus.value = user.status || "active";
  if (saUserTemp) saUserTemp.value = "";
  setStatus(saUserStatusMsg, `Selected ${user.email || selectedUserId}`);

  // Show delete button
  saDeleteUser?.classList.remove("hidden");
}

function resolveTenantChoice() {
  const val = saUserTenantSelect?.value || selectedTenant;
  if (!val) return "";
  const mapped = tenantIdMap.get(val.trim().toLowerCase());
  return mapped || val;
}

async function saveUser(forcedPatch) {
  const tenantChoice = resolveTenantChoice();
  if (!tenantChoice) {
    setStatus(saUserStatusMsg, "Select a tenant first.", "#F87171");
    return;
  }
  if (!saUserEmail.value.trim()) {
    setStatus(saUserStatusMsg, "Email required.", "#F87171");
    return;
  }
  const payload =
    forcedPatch ||
    ({
      email: saUserEmail.value.trim(),
      name: saUserName.value.trim() || undefined,
      department: saUserDepartment.value.trim() || undefined,
      role: saUserRole.value,
      status: saUserStatus.value,
      tempPassword: saUserTemp.value.trim() || undefined
    });
  setStatus(saUserStatusMsg, "Saving…");
  try {
    await fetchJson(
      `${apiBase}/admin/tenants/${encodeURIComponent(tenantChoice)}/users${selectedUserId ? "/" + encodeURIComponent(selectedUserId) : ""
      }`,
      {
        method: selectedUserId ? "PATCH" : "POST",
        body: JSON.stringify(
          selectedUserId
            ? {
              role: payload.role,
              status: payload.status,
              name: payload.name,
              department: payload.department,
              ...(payload.tempPassword ? { tempPassword: payload.tempPassword } : {})
            }
            : payload
        )
      }
    );
    setStatus(saUserStatusMsg, "User saved.", "#22C55E");
    showToast("User saved successfully.", "success");
    selectedTenant = tenantChoice;
    if (tenantIdInput) tenantIdInput.value = tenantChoice;
    loadTenantUsers();
  } catch (err) {
    setStatus(saUserStatusMsg, `Save failed: ${err.message}`, "#F87171");
    showToast(`Save failed: ${err.message}`, "error");
  }
}

async function deleteUser() {
  const tenantChoice = resolveTenantChoice();
  if (!tenantChoice || !selectedUserId) {
    setStatus(saUserStatusMsg, "Select a user first.", "#F87171");
    return;
  }
  if (!confirm(`Delete user ${saUserEmail.value || selectedUserId}?`)) return;
  setStatus(saUserStatusMsg, "Deleting…");
  try {
    await fetchJson(
      `${apiBase}/admin/tenants/${encodeURIComponent(tenantChoice)}/users/${encodeURIComponent(selectedUserId)}`,
      { method: "DELETE" }
    );
    setStatus(saUserStatusMsg, "User deleted.", "#22C55E");
    selectedUserId = "";
    saUserEmail.value = "";
    saUserName.value = "";
    saUserRole.value = "user";
    saUserStatus.value = "active";
    selectedTenant = tenantChoice;
    loadTenantUsers();
  } catch (err) {
    setStatus(saUserStatusMsg, `Delete failed: ${err.message}`, "#F87171");
  }
}


saSaveUser?.addEventListener("click", () => saveUser());


saClearUser?.addEventListener("click", clearUserSelection);
saDeleteUser?.addEventListener("click", deleteUser);
saResetPass?.addEventListener("click", () => {
  if (!selectedTenant || !selectedUserId) {
    setStatus(saUserStatusMsg, "Select a user first.", "#F87171");
    return;
  }
  const temp = prompt("Enter a temporary password (user must change on first login):");
  if (!temp || temp.length < 6) {
    setStatus(saUserStatusMsg, "Temp password must be at least 6 characters.", "#F87171");
    return;
  }
  // reuse save flow with tempPassword patch
  saveUser({ tempPassword: temp });
});

function populateTenantSelect() {
  if (!saUserTenantSelect) return;
  const current = saUserTenantSelect.value;
  saUserTenantSelect.innerHTML = "";
  const blank = document.createElement("option");
  blank.value = "";
  blank.textContent = "Select tenant";
  saUserTenantSelect.appendChild(blank);
  tenantsCache.forEach((t) => {
    const opt = document.createElement("option");
    opt.value = t.displayName || t.tenantId;
    opt.dataset.tenantId = t.tenantId;
    opt.textContent = t.displayName || t.tenantId;
    saUserTenantSelect.appendChild(opt);
  });
  if (current) {
    saUserTenantSelect.value = current;
  } else if (selectedTenant) {
    saUserTenantSelect.value = selectedTenant;
  }
}

saUserTenantSelect?.addEventListener("change", () => {
  selectedTenant = saUserTenantSelect.value || "";
  selectedUserId = "";
  saUserEmail.value = "";
  saUserName.value = "";
  saUserRole.value = "user";
  saUserStatus.value = "active";
  if (selectedTenant) {
    tenantIdInput.value = selectedTenant;
    loadTenantUsers();
  }
});

function clearUserSelection() {
  selectedUserId = "";
  saUserEmail.value = "";
  saUserName.value = "";
  saUserDepartment.value = "";
  saUserRole.value = "user";
  saUserStatus.value = "active";
  if (saUserTemp) saUserTemp.value = "";
  setStatus(saUserStatusMsg, "Form cleared. Ready to create new user.", "#94A3B8");

  // Hide delete button
  saDeleteUser?.classList.add("hidden");
}

function switchTab(tab) {
  const tenantsGroups = document.querySelectorAll(".tab-group-tenants");
  const usersGroups = document.querySelectorAll(".tab-group-users");

  if (tab === "tenants") {
    navTenants?.classList.add("active");
    navUsers?.classList.remove("active");
    tenantsGroups.forEach(el => el.classList.remove("hidden"));
    usersGroups.forEach(el => el.classList.add("hidden"));
  } else {
    navTenants?.classList.remove("active");
    navUsers?.classList.add("active");
    tenantsGroups.forEach(el => el.classList.add("hidden"));
    usersGroups.forEach(el => el.classList.remove("hidden"));
  }
}

function showToast(message, type = "success") {
  if (!toastContainer) return;

  const toast = document.createElement("div");
  toast.classList.add("toast", type);
  toast.textContent = message;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("fade-out");
    toast.addEventListener("animationend", () => {
      toast.remove();
    });
  }, 3000);
}

navTenants?.addEventListener("click", (e) => {
  e.preventDefault();
  switchTab("tenants");
});
navUsers?.addEventListener("click", (e) => {
  e.preventDefault();
  switchTab("users");
});
