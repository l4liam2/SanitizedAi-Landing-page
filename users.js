const apiBase = `${window.location.origin}/api/v1`;
const authGate = document.getElementById("auth-gate");
const appShell = document.getElementById("app-shell");
const authTenantInput = document.getElementById("auth-tenant");
const authTokenInput = document.getElementById("auth-token");
const authSubmit = document.getElementById("auth-submit");
const authStatus = document.getElementById("auth-status");
const logoutBtn = document.getElementById("logout-btn");
const currentTenant = document.getElementById("current-tenant");
const usersStatus = document.getElementById("users-status");
const createStatus = document.getElementById("create-status");
const userSearch = document.getElementById("user-search");
const userLimit = document.getElementById("user-limit");
const userRoleFilter = document.getElementById("user-role-filter");
const userStatusFilter = document.getElementById("user-status-filter");
const refreshUsersBtn = document.getElementById("refresh-users");
const usersBody = document.getElementById("users-body");
const usersPrev = document.getElementById("users-prev");
const usersNext = document.getElementById("users-next");
const userPaginationInfo = document.getElementById("users-pagination");
const newEmail = document.getElementById("new-email");
const newName = document.getElementById("new-name");
const newDepartment = document.getElementById("new-department");
const newRole = document.getElementById("new-role");
const newStatus = document.getElementById("new-status");
const createUserBtn = document.getElementById("create-user");
const updateUserBtn = document.getElementById("update-user");
const deleteUserBtn = document.getElementById("delete-user");
const cancelEditBtn = document.getElementById("cancel-edit");
const userFormTitle = document.getElementById("user-form-title");
const eventsBody = document.getElementById("events-body");
const eventsLimit = document.getElementById("events-limit");
const refreshEventsBtn = document.getElementById("refresh-events");
const selectedUserLabel = document.getElementById("selected-user-label");
const eventsAction = document.getElementById("events-action");
const eventsCategory = document.getElementById("events-category");
const eventsSeverityMin = document.getElementById("events-severity-min");
const eventsSeverityMax = document.getElementById("events-severity-max");
const eventsStart = document.getElementById("events-start");
const eventsEnd = document.getElementById("events-end");
const brandNameEl = document.querySelector(".brand-name");
const settingsBtn = document.getElementById("settings-btn");
const adminMenu = document.getElementById("admin-menu");
const adminMenuToggle = document.getElementById("admin-menu-toggle");

function updateUserMenu() {
  const n = localStorage.getItem("praivacy-user-name");
  const e = localStorage.getItem("praivacy-user-email");
  const nameEl = document.getElementById("menu-user-name");
  const emailEl = document.getElementById("menu-user-email");
  if (nameEl && n) nameEl.textContent = n;
  if (emailEl && e) emailEl.textContent = e;
}

function initAdminMenu() {
  const adminMenu = document.getElementById("admin-menu");
  const adminMenuToggle = document.getElementById("admin-menu-toggle");

  if (adminMenu && adminMenuToggle) {
    if (adminMenuToggle.dataset.menuInitialized === "true") {
      updateUserMenu();
      return;
    }
    adminMenuToggle.dataset.menuInitialized = "true";

    adminMenuToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      adminMenu.classList.toggle("hidden");
    });

    document.addEventListener("click", (e) => {
      if (!adminMenuToggle.contains(e.target) && !adminMenu.contains(e.target)) {
        adminMenu.classList.add("hidden");
      }
    });
    adminMenu.addEventListener("click", (e) => e.stopPropagation());

    updateUserMenu();
  }
}

const STORAGE_KEY = "praivacy-dashboard-config";
const ADMIN_TOKEN_KEY = "praivacy-admin-token";
const DISPLAY_NAME_KEY = "praivacy-display-name";

let adminToken = "";
let tenantId = "";
let selectedUserId = "";
let usersPage = 1;
let usersHasMore = false;
let tenantDisplayName = "";

function applyTenantLabel(label) {
  tenantDisplayName = label || tenantId || "";
  if (currentTenant) currentTenant.textContent = tenantDisplayName || "—";
  if (brandNameEl && tenantDisplayName) brandNameEl.textContent = tenantDisplayName;
  try {
    localStorage.setItem(DISPLAY_NAME_KEY, tenantDisplayName);
  } catch (_) { }
}

function isJwtToken(token = "") {
  const parts = token.trim().split(".");
  return parts.length === 3;
}

function buildHeaders() {
  const headers = {};
  if (!adminToken) return headers;
  if (adminToken.toLowerCase().startsWith("bearer ") || isJwtToken(adminToken)) {
    headers.Authorization = adminToken.toLowerCase().startsWith("bearer ") ? adminToken : `Bearer ${adminToken}`;
  } else {
    headers["X-PRAI-Admin-Key"] = adminToken;
  }
  return headers;
}

async function fetchJson(path, opts = {}) {
  const headers = { "Content-Type": "application/json", ...(opts.headers || {}), ...buildHeaders() };
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

async function validateToken(candidate) {
  const headers = {};
  if (!candidate) return false;
  if (candidate.toLowerCase().startsWith("bearer ") || isJwtToken(candidate)) {
    headers.Authorization = candidate.toLowerCase().startsWith("bearer ") ? candidate : `Bearer ${candidate}`;
  } else {
    headers["X-PRAI-Admin-Key"] = candidate;
  }
  try {
    const resp = await fetch(`${apiBase}/admin/ping`, { headers });
    if (!resp.ok) return false;
    const data = await resp.json();
    return Boolean(data && data.ok);
  } catch (_) {
    return false;
  }
}

function lockDashboard(message = "Enter credentials to continue.") {
  appShell.classList.add("hidden");
  authGate.classList.remove("hidden");
  authStatus.textContent = message;
  authStatus.style.color = "#94A3B8";
}

function unlockDashboard() {
  authGate.classList.add("hidden");
  appShell.classList.remove("hidden");
  applyTenantLabel(tenantDisplayName || tenantId);
  initAdminMenu();
}



async function loadTenantDisplayName() {
  if (!tenantId || !adminToken) return;
  try {
    const resp = await fetchJson(`${apiBase}/admin/tenants/${encodeURIComponent(tenantId)}/config`);
    const cfg = resp?.config || {};
    const name = cfg.displayName || tenantId;

    applyTenantLabel(name);

    // Apply logo if available
    if (cfg.branding?.logoUrl) {
      const logoEl = document.querySelector(".brand-logo");
      if (logoEl) logoEl.src = cfg.branding.logoUrl;
    }

  } catch (_) {
    applyTenantLabel(tenantId);
  }
}

function persistTenant(tenant) {
  const raw = localStorage.getItem(STORAGE_KEY);
  let parsed = {};
  if (raw) {
    try {
      parsed = JSON.parse(raw) || {};
    } catch (_) {
      parsed = {};
    }
  }
  parsed.tenant = tenant;
  if (tenantDisplayName) parsed.displayName = tenantDisplayName;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
}

function setStatus(el, msg, color = "#94A3B8") {
  if (!el) return;
  el.textContent = msg;
  el.style.color = color;
}

async function loadUsers() {
  if (!tenantId || !adminToken) return;
  setStatus(usersStatus, "Loading users…");
  try {
    const params = new URLSearchParams();
    params.set("limit", userLimit.value || "50");
    params.set("page", String(usersPage));
    if (userSearch.value.trim()) {
      params.set("search", userSearch.value.trim());
    }
    if (userRoleFilter && userRoleFilter.value !== "all") {
      params.set("role", userRoleFilter.value);
    }
    if (userStatusFilter && userStatusFilter.value !== "all") {
      params.set("status", userStatusFilter.value);
    }
    const data = await fetchJson(
      `${apiBase}/admin/tenants/${encodeURIComponent(tenantId)}/users?${params.toString()}`
    );
    renderUsers(data.users || []);
    usersHasMore = Boolean(data.hasMore);
    updateUsersPager(data.count || 0);
    setStatus(usersStatus, `Loaded ${data.count || 0} users.`, "#22C55E");
  } catch (err) {
    setStatus(usersStatus, `Failed to load users: ${err.message}`, "#F87171");
  }
}

function updateUsersPager(count) {
  if (userPaginationInfo) {
    userPaginationInfo.textContent = `Page ${usersPage}${usersHasMore ? " (more available)" : ""}`;
  }
  if (usersPrev) usersPrev.disabled = usersPage <= 1;
  if (usersNext) usersNext.disabled = !usersHasMore || count === 0;
}

function renderUsers(users = []) {
  usersBody.innerHTML = "";
  if (!users.length) {
    usersBody.innerHTML =
      '<tr><td colspan="6" class="placeholder">No users found. Try another search.</td></tr>';
    return;
  }
  users.forEach((user) => {
    const tr = document.createElement("tr");
    tr.classList.add("clickable");
    tr.innerHTML = `
      <td>${user.email || "—"}</td>
      <td>${user.name || "—"}</td>
      <td>${user.department || "—"}</td>
      <td>${user.role || "user"}</td>
      <td>${user.status || "unknown"}</td>
      <td>${user.createdAt ? new Date(user.createdAt).toLocaleString() : "—"}</td>
    `;
    tr.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      selectUser(user);
    });
    tr.addEventListener("click", () => selectUser(user));
    usersBody.appendChild(tr);
  });
}

function openInlineEdit(user) {
  // Deprecated/Removed in favor of form selection
  selectUser(user);
}

function clearUserForm() {
  selectedUserId = "";
  newEmail.value = "";
  newEmail.disabled = false; // Enable email for new users
  newName.value = "";
  newDepartment.value = "";
  newRole.value = "user";
  newStatus.value = "active";

  createUserBtn.classList.remove("hidden");
  updateUserBtn.classList.add("hidden");
  if (deleteUserBtn) deleteUserBtn.classList.add("hidden");
  cancelEditBtn.classList.add("hidden");
  if (userFormTitle) userFormTitle.textContent = "Create user";

  selectedUserLabel.textContent = "no user selected";
  eventsBody.innerHTML = '<tr><td colspan="6" class="placeholder">Select a user to view events.</td></tr>';
  setStatus(createStatus, "");
}

async function createUser() {
  if (!tenantId || !adminToken) {
    setStatus(createStatus, "Login first.", "#F87171");
    return;
  }
  const email = newEmail.value.trim();
  if (!email) {
    setStatus(createStatus, "Email required.", "#F87171");
    return;
  }
  const payload = {
    email,
    name: newName.value.trim() || undefined,
    department: newDepartment.value.trim() || undefined,
    role: newRole.value,
    status: newStatus.value
  };
  setStatus(createStatus, "Creating…");
  try {
    await fetchJson(`${apiBase}/admin/tenants/${encodeURIComponent(tenantId)}/users`, {
      method: "POST",
      body: JSON.stringify(payload)
    });
    setStatus(createStatus, "User saved.", "#22C55E");
    await loadUsers();
    clearUserForm();
  } catch (err) {
    setStatus(createStatus, `Create failed: ${err.message}`, "#F87171");
  }
}

async function saveSelectedUser() {
  if (!tenantId || !adminToken || !selectedUserId) {
    setStatus(createStatus, "Select user first.", "#F87171");
    return;
  }
  const payload = {
    name: newName.value.trim() || undefined,
    department: newDepartment.value.trim() || undefined,
    role: newRole.value,
    status: newStatus.value
  };
  // Note: Email cannot be updated via this endpoint usually, as it's the ID/key in many systems, 
  // but if backend supports it, we'd need to send it. Assuming immutable email for now or handled separately.

  updateUser(selectedUserId, payload);
}

async function updateUser(userId, patch) {
  if (!tenantId || !adminToken || !userId) return;

  setStatus(createStatus, "Updating…");
  try {
    await fetchJson(`${apiBase}/admin/tenants/${encodeURIComponent(tenantId)}/users/${encodeURIComponent(userId)}`, {
      method: "PATCH",
      body: JSON.stringify(patch)
    });
    setStatus(createStatus, "User updated.", "#22C55E");
    await loadUsers();
    if (selectedUserId === userId) {
      loadUserEvents();
    }
  } catch (err) {
    setStatus(createStatus, `Update failed: ${err.message}`, "#F87171");
  }
}

async function deleteUser() {
  if (!tenantId || !adminToken || !selectedUserId) return;
  if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;

  setStatus(createStatus, "Deleting...", "#F87171");
  try {
    await fetchJson(
      `${apiBase}/admin/tenants/${encodeURIComponent(tenantId)}/users/${encodeURIComponent(selectedUserId)}`,
      { method: "DELETE" }
    );
    setStatus(createStatus, "User deleted.", "#22C55E");
    await loadUsers();
    clearUserForm();
  } catch (err) {
    setStatus(createStatus, `Delete failed: ${err.message}`, "#F87171");
  }
}

function renderEvents(events = []) {
  eventsBody.innerHTML = "";
  if (!events.length) {
    eventsBody.innerHTML = '<tr><td colspan="6" class="placeholder">No events for this user.</td></tr>';
    return;
  }
  events.forEach((evt) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${evt.timestamp ? new Date(evt.timestamp).toLocaleString() : "—"}</td>
      <td>${evt.action || "—"}</td>
      <td>${Array.isArray(evt.categories) ? evt.categories.join(", ") : "—"}</td>
      <td>${Array.isArray(evt.rules) ? evt.rules.join(", ") : "—"}</td>
      <td>${evt.severity ?? "—"}</td>
      <td>${evt.installId || evt.userHash || "—"}</td>
    `;
    eventsBody.appendChild(tr);
  });
}

async function loadUserEvents() {
  if (!tenantId || !adminToken || !selectedUserId) return;
  setStatus(usersStatus, `Loading events for ${selectedUserId}…`);
  try {
    const params = new URLSearchParams();
    params.set("limit", eventsLimit.value || "25");
    if (eventsAction && eventsAction.value !== "all") {
      params.set("action", eventsAction.value);
    }
    if (eventsSeverityMin && eventsSeverityMin.value) {
      params.set("severityMin", eventsSeverityMin.value);
    }
    if (eventsSeverityMax && eventsSeverityMax.value) {
      params.set("severityMax", eventsSeverityMax.value);
    }
    if (eventsCategory && eventsCategory.value.trim()) {
      params.set("category", eventsCategory.value.trim());
    }
    if (eventsStart && eventsStart.value) {
      params.set("start", eventsStart.value);
    }
    if (eventsEnd && eventsEnd.value) {
      params.set("end", eventsEnd.value);
    }
    const data = await fetchJson(
      `${apiBase}/admin/tenants/${encodeURIComponent(tenantId)}/users/${encodeURIComponent(
        selectedUserId
      )}/events?${params.toString()}`
    );
    renderEvents(data.events || []);
    setStatus(usersStatus, `Loaded ${data.count || 0} events for ${selectedUserId}.`, "#22C55E");
  } catch (err) {
    setStatus(usersStatus, `Failed to load events: ${err.message}`, "#F87171");
  }
}

function selectUser(user) {
  selectedUserId = user.id || user.email || "";

  // Populate form
  newEmail.value = user.email || "";
  newEmail.disabled = true; // Cannot edit email usually
  newName.value = user.name || "";
  newDepartment.value = user.department || "";
  newRole.value = user.role || "user";
  newStatus.value = user.status || "active";

  // Update UI state
  createUserBtn.classList.add("hidden");
  updateUserBtn.classList.remove("hidden");
  if (deleteUserBtn) deleteUserBtn.classList.remove("hidden");
  cancelEditBtn.classList.remove("hidden");
  if (userFormTitle) userFormTitle.textContent = `Edit User: ${user.email}`;
  setStatus(createStatus, "");

  selectedUserLabel.textContent = user.email || user.id || "unknown user";
  loadUserEvents();
}

const authEmailInput = document.getElementById("auth-email");
const authPasswordInput = document.getElementById("auth-password");

async function loginAdmin(tenantId, email, password) {
  try {
    const resp = await fetch(`${apiBase}/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenantId, email, password })
    });
    if (!resp.ok) {
      const data = await resp.json();
      throw new Error(data.error || "Login failed");
    }
    return await resp.json();
  } catch (err) {
    throw err;
  }
}

async function handleAuth() {
  const tenant = authTenantInput.value.trim();
  const email = authEmailInput.value.trim();
  const password = authPasswordInput.value.trim();

  if (!tenant || !email || !password) {
    setStatus(authStatus, "All fields required.", "#F87171");
    return;
  }
  setStatus(authStatus, "Authenticating…", "#94A3B8");

  try {
    const data = await loginAdmin(tenant, email, password);
    adminToken = data.token; // JWT
    tenantId = data.tenantId; // Normalized tenant ID

    localStorage.setItem(ADMIN_TOKEN_KEY, adminToken);
    localStorage.setItem(ADMIN_TOKEN_KEY, adminToken);
    persistTenant(tenantId);

    if (data.name) localStorage.setItem("praivacy-user-name", data.name);
    if (data.email) localStorage.setItem("praivacy-user-email", data.email);
    updateUserMenu();

    await loadTenantDisplayName();
    unlockDashboard();
    setStatus(authStatus, "");
    loadUsers();
  } catch (err) {
    setStatus(authStatus, `Login failed: ${err.message}`, "#F87171");
  }
}

authSubmit?.addEventListener("click", handleAuth);

[authTenantInput, authEmailInput, authPasswordInput].forEach(input => {
  input?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAuth();
    }
  });
});

logoutBtn?.addEventListener("click", () => {
  adminToken = "";
  tenantId = "";
  selectedUserId = "";
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(STORAGE_KEY);
  lockDashboard("Logged out. Enter credentials to continue.");
});

if (settingsBtn) {
  settingsBtn.addEventListener("click", () => {
    window.location.href = "/app.html#settings";
  });
}

refreshUsersBtn?.addEventListener("click", loadUsers);
const importUsersBtn = document.getElementById("import-users-btn");
const importUsersFile = document.getElementById("import-users-file");

createUserBtn?.addEventListener("click", createUser);

// CSV Config
const REQUIRED_HEADERS = ["email"];
const OPTIONAL_HEADERS = ["name", "role", "status", "department", "password"];

importUsersBtn?.addEventListener("click", () => {
  importUsersFile.click();
});

importUsersFile?.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // Reset input so same file can be selected again
  e.target.value = "";

  if (file.size > 1024 * 1024) { // 1MB limit check
    setStatus(createStatus, "File too large (max 1MB).", "#F87171");
    return;
  }

  const reader = new FileReader();
  reader.onload = async (event) => {
    try {
      const text = event.target.result;
      const users = parseCSV(text);
      if (users.length === 0) {
        setStatus(createStatus, "No valid users found in CSV.", "#F87171");
        return;
      }
      await bulkCreateUsers(users);
    } catch (err) {
      setStatus(createStatus, `Import failed: ${err.message}`, "#F87171");
    }
  };
  reader.readAsText(file);
});

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(line => line.trim());
  if (lines.length < 2) throw new Error("CSV must have headers and at least one row.");

  // Normalize headers
  const rawHeaders = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/[\"']/g, ""));

  // Header Mapping Config
  const COLUMN_MAP = {
    email: ["email", "e-mail", "email address", "e-mail address", "mail", "user email", "user e-mail", "emailaddress"],
    name: ["name", "full name", "fullname", "display name", "user name", "username", "first name"], // simple mapping
    department: ["department", "dept", "division", "team", "unit", "group"],
    role: ["role", "roles", "account type", "permission", "access level"],
    status: ["status", "state", "account status", "active"],
    password: ["password", "pass", "pwd", "temp password", "temporary password", "user password"]
  };

  // Resolve headers to keys
  const headers = rawHeaders.map(raw => {
    for (const [key, aliases] of Object.entries(COLUMN_MAP)) {
      if (aliases.includes(raw)) return key;
    }
    return raw; // keep unknown headers as is
  });

  // Verify required headers
  if (!headers.includes("email")) {
    throw new Error(`Missing required 'email' column. found: ${rawHeaders.join(", ")}`);
  }

  const result = [];

  for (let i = 1; i < lines.length; i++) {
    // Handle simple CSV: no quotes/escaping supported for simplicity, user instructions should specify this
    const values = lines[i].split(",").map(v => v.trim());

    // Skip empty lines or mismatched col counts (lenient)
    if (values.length < headers.length) continue;

    const user = {
      role: "user",
      status: "active"
    };

    headers.forEach((header, index) => {
      const val = values[index];
      if (!val) return;

      // Map known fields
      if (["email", "name", "department", "password"].includes(header)) {
        user[header] = val;
      }

      if (header === "role") {
        const r = val.toLowerCase();
        if (["admin", "user"].includes(r)) user.role = r;
      }
      if (header === "status") {
        const s = val.toLowerCase();
        if (["active", "disabled"].includes(s)) user.status = s;
      }
    });

    if (user.email && user.email.includes("@")) {
      result.push(user);
    }
  }
  return result;
}

async function bulkCreateUsers(users) {
  if (!tenantId || !adminToken) {
    setStatus(createStatus, "Login first.", "#F87171");
    return;
  }
  setStatus(createStatus, `Importing ${users.length} users...`);
  try {
    const resp = await fetchJson(`${apiBase}/admin/tenants/${encodeURIComponent(tenantId)}/users/bulk`, {
      method: "POST",
      body: JSON.stringify(users)
    });
    setStatus(createStatus, `Imported ${resp.count} users successfully.`, "#22C55E");
    await loadUsers();
  } catch (err) {
    if (err.message && err.message.includes("invalid_payload")) {
      setStatus(createStatus, "Validation error in CSV data.", "#F87171");
    } else {
      setStatus(createStatus, `Import failed: ${err.message}`, "#F87171");
    }
  }
}

updateUserBtn?.addEventListener("click", saveSelectedUser);
deleteUserBtn?.addEventListener("click", deleteUser);
cancelEditBtn?.addEventListener("click", clearUserForm);
cancelEditBtn?.addEventListener("click", clearUserForm);

refreshEventsBtn?.addEventListener("click", loadUserEvents);
userSearch?.addEventListener("search", loadUsers);
usersPrev?.addEventListener("click", () => {
  if (usersPage > 1) {
    usersPage -= 1;
    loadUsers();
  }
});
usersNext?.addEventListener("click", () => {
  usersPage += 1;
  loadUsers();
});
userRoleFilter?.addEventListener("change", () => {
  usersPage = 1;
  loadUsers();
});
userStatusFilter?.addEventListener("change", () => {
  usersPage = 1;
  loadUsers();
});
userLimit?.addEventListener("change", () => {
  usersPage = 1;
  loadUsers();
});

(async () => {
  const storedToken = localStorage.getItem(ADMIN_TOKEN_KEY);
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed.tenant) tenantId = parsed.tenant;
      if (parsed.displayName) tenantDisplayName = parsed.displayName;
    } catch (_) {
      // ignore parse errors
    }
  }
  const storedDisplay = localStorage.getItem(DISPLAY_NAME_KEY);
  if (storedDisplay && !tenantDisplayName) {
    tenantDisplayName = storedDisplay;
  }
  if (storedToken && tenantId && (await validateToken(storedToken))) {
    adminToken = storedToken;
    authTenantInput.value = tenantId;
    await loadTenantDisplayName();
    unlockDashboard();
    initAdminMenu();

    // Auto-fetch user info if missing
    if (!localStorage.getItem("praivacy-user-name")) {
      try {
        const me = await fetchJson(`${apiBase}/admin/me`);
        if (me.name) localStorage.setItem("praivacy-user-name", me.name);
        if (me.email) localStorage.setItem("praivacy-user-email", me.email);
        updateUserMenu();
      } catch (_) { }
    }

    loadUsers();
  } else {
    lockDashboard();
  }
})();
