const apiBase = `${window.location.origin}/api/v1`;
const authGate = document.getElementById("auth-gate");
const authTenantInput = document.getElementById("auth-tenant");
const authEmailInput = document.getElementById("auth-email");
const authPasswordInput = document.getElementById("auth-password");
const authSubmit = document.getElementById("auth-submit");
const authStatus = document.getElementById("auth-status");
const appShell = document.getElementById("app-shell");
const logoutBtn = document.getElementById("logout-btn");
const adminMenuToggle = document.getElementById("admin-menu-toggle");
const adminMenu = document.getElementById("admin-menu");
const refreshBtn = document.getElementById("refresh-btn");

// DOM elements for data
const riskScoreVal = document.getElementById("risk-score-val");
const riskScoreBar = document.getElementById("risk-score-bar");
const riskDesc = document.getElementById("risk-desc");
const velocityVal = document.getElementById("velocity-val");
const velocityTrend = document.getElementById("velocity-trend");
const totalEventsVal = document.getElementById("total-events-val");
const blockedCountVal = document.getElementById("blocked-count");
const riskHighVal = document.getElementById("risk-high-val");
const riskMedVal = document.getElementById("risk-med-val");
const riskLowVal = document.getElementById("risk-low-val");
const riskyUsersBody = document.getElementById("risky-users-body");
const deptBody = document.getElementById("dept-body");
const hostBody = document.getElementById("host-body");

let adminToken = "";
let tenantId = "";
let tenantConfig = null;

// Auth Logic
function isJwtToken(value) {
    if (!value) return false;
    const raw = value.trim().replace(/^Bearer\s+/i, "");
    return raw.split(".").length === 3;
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

function applyTenantConfigUI() {
    if (!tenantConfig) return;
    // Brand name
    const brandNameEl = document.querySelector(".brand-name");
    if (brandNameEl) {
        brandNameEl.textContent = tenantConfig.displayName || tenantId || "Sanitized Ai";
    }

    // Cache display name
    try {
        localStorage.setItem("praivacy-display-name", tenantConfig.displayName || tenantId || "");
    } catch (_) { }

    // Logo
    if (tenantConfig.branding?.logoUrl) {
        const logo = document.querySelector(".brand-logo");
        if (logo) logo.src = tenantConfig.branding.logoUrl;
    }
    // Favicon
    if (tenantConfig.branding?.faviconUrl) {
        let link = document.querySelector("link[rel~='icon']");
        if (!link) {
            link = document.createElement("link");
            link.rel = "icon";
            document.head.appendChild(link);
        }
        link.href = tenantConfig.branding.faviconUrl;
    }
    // Accent color
    if (tenantConfig.branding?.accentColor) {
        document.documentElement.style.setProperty("--accent", tenantConfig.branding.accentColor);
    }
}

async function loadTenantConfig() {
    if (!tenantId || !adminToken) return;
    try {
        const resp = await fetchJson(`${apiBase}/admin/tenants/${encodeURIComponent(tenantId)}/config`);
        tenantConfig = resp.config || {};
        applyTenantConfigUI();
    } catch (err) {
        console.warn("[PrAIvacy] Failed to load tenant config", err);
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
            throw new Error("Invalid credentials");
        }
        const data = await resp.json();
        if (data.token) {
            adminToken = data.token;
            tenantId = data.tenantId || tenant;
            localStorage.setItem("praivacy-admin-token", adminToken);
            localStorage.setItem("praivacy-tenant-id", tenantId);

            if (data.name) localStorage.setItem("praivacy-user-name", data.name);
            if (data.email) localStorage.setItem("praivacy-user-email", data.email);

            authStatus.textContent = "Success!";
            authStatus.style.color = "#34D399";
            unlockDashboard();
            // Load both data and config
            loadTenantConfig();
            loadData();
        }
    } catch (err) {
        authStatus.textContent = err.message;
        authStatus.style.color = "#F87171";
    }
}

function unlockDashboard() {
    authGate.classList.add("hidden");
    appShell.classList.remove("hidden");
    initAdminMenu();
}

function lockDashboard() {
    appShell.classList.add("hidden");
    authGate.classList.remove("hidden");
}

authSubmit.addEventListener("click", handleAuth);
authPasswordInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleAuth();
});

logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("praivacy-admin-token");
    localStorage.removeItem("praivacy-tenant-id");
    location.reload();
});

const settingsBtn = document.getElementById("settings-btn");
if (settingsBtn) {
    settingsBtn.addEventListener("click", () => {
        window.location.href = "/app.html#settings";
    });
}

// Loading Data
async function fetchJson(path) {
    const headers = {};
    if (adminToken.toLowerCase().startsWith("bearer ") || isJwtToken(adminToken)) {
        headers.Authorization = adminToken.toLowerCase().startsWith("bearer ")
            ? adminToken
            : `Bearer ${adminToken}`;
    } else {
        headers["X-PRAI-Admin-Key"] = adminToken;
    }
    const response = await fetch(path, { headers });
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
}

async function loadData() {
    if (!tenantId || !adminToken) return;
    refreshBtn.textContent = "Loading...";

    try {
        const data = await fetchJson(`${apiBase}/admin/tenants/${encodeURIComponent(tenantId)}/insights`);

        // 1. Risk Score
        riskScoreVal.textContent = data.riskScore;
        riskScoreBar.style.width = `${data.riskScore}%`;
        if (data.riskScore < 30) {
            riskScoreBar.style.background = "#34D399";
            riskDesc.textContent = "Low risk";
            riskDesc.className = "kpi-trend trend-down";
        } else if (data.riskScore < 70) {
            riskScoreBar.style.background = "#FBBF24";
            riskDesc.textContent = "Moderate risk";
            riskDesc.className = "kpi-trend trend-neutral";
        } else {
            riskScoreBar.style.background = "#F87171";
            riskDesc.textContent = "High risk";
            riskDesc.className = "kpi-trend trend-up";
        }

        // 2. Trend Velocity
        velocityVal.textContent = `${data.velocity > 0 ? "+" : ""}${data.velocity}%`;
        if (data.velocity > 0) {
            velocityTrend.className = "kpi-trend trend-up"; // Bad
            velocityTrend.textContent = "Increasing vs yesterday";
        } else if (data.velocity < 0) {
            velocityTrend.className = "kpi-trend trend-down"; // Good
            velocityTrend.textContent = "Decreasing vs yesterday";
        } else {
            velocityTrend.className = "kpi-trend";
            velocityTrend.textContent = "Stable";
        }

        totalEventsVal.textContent = data.stats.total30d.toLocaleString();
        blockedCountVal.textContent = data.stats.blocked30d.toLocaleString();

        // 4. User Risk Segmentation
        if (data.userRiskSegmentation && data.userRiskSegmentation.total > 0) {
            const total = data.userRiskSegmentation.total;
            const highPct = Math.round((data.userRiskSegmentation.high / total) * 100);
            const medPct = Math.round((data.userRiskSegmentation.medium / total) * 100);
            const lowPct = Math.round((data.userRiskSegmentation.low / total) * 100);

            riskHighVal.textContent = `${highPct}%`;
            riskMedVal.textContent = `${medPct}%`;
            riskLowVal.textContent = `${lowPct}%`;
        } else {
            riskHighVal.textContent = "0%";
            riskMedVal.textContent = "0%";
            riskLowVal.textContent = "0%";
        }

        // 5. Risky Users
        renderRiskyUsers(data.riskyUsers);

        // 6. Dept Insights
        renderDepartments(data.departmentInsights);

        // 7. Host Risks (formerly 6)
        renderHosts(data.riskyHosts);

    } catch (err) {
        console.error(err);
        // Show error in tables
        const errRow = `<tr><td colspan="4" class="placeholder error">Error loading data: ${err.message}</td></tr>`;
        riskyUsersBody.innerHTML = errRow;
        deptBody.innerHTML = errRow;
        hostBody.innerHTML = `<tr><td colspan="3" class="placeholder error">Error loading data: ${err.message}</td></tr>`;
        alert(`Failed to load insights: ${err.message}`);
    } finally {
        refreshBtn.textContent = "Refresh Data";
    }
}

function renderRiskyUsers(users) {
    riskyUsersBody.innerHTML = "";
    if (!users || !users.length) {
        riskyUsersBody.innerHTML = '<tr><td colspan="4" class="placeholder">No data available.</td></tr>';
        return;
    }
    users.forEach(u => {
        const row = document.createElement("tr");
        row.innerHTML = `
      <td>
        <div style="font-weight: 500">${u.name || "Unknown"}</div>
        <div class="micro">${u.email || "—"}</div>
      </td>
      <td>${u.department || "—"}</td>
      <td>${u.eventCount}</td>
      <td style="font-family: var(--font-mono); font-weight: 700;">${Math.round(u.riskPoints)}</td>
    `;
        riskyUsersBody.appendChild(row);
    });
}

function renderDepartments(depts) {
    deptBody.innerHTML = "";
    if (!depts || !depts.length) {
        deptBody.innerHTML = '<tr><td colspan="4" class="placeholder">No department data.</td></tr>';
        return;
    }
    depts.forEach(d => {
        const row = document.createElement("tr");
        row.innerHTML = `
      <td style="font-weight: 500">${d.department}</td>
      <td>${d.activeUsers}</td>
      <td>${Number(d.avgRisk).toFixed(2)}</td>
      <td>${Math.round(d.totalRisk)}</td>
    `;
        deptBody.appendChild(row);
    });
}

function renderHosts(hosts) {
    hostBody.innerHTML = "";
    if (!hosts || !hosts.length) {
        hostBody.innerHTML = '<tr><td colspan="3" class="placeholder">No host data.</td></tr>';
        return;
    }
    hosts.forEach(h => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td style="font-weight: 500">${h.host || "Unknown"}</td>
          <td>${h.count}</td>
          <td>${Math.round(h.severity)}</td>
        `;
        hostBody.appendChild(row);
    });
}

refreshBtn.addEventListener("click", loadData);

function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
}

// Init check
(async () => {
    const t = localStorage.getItem("praivacy-admin-token");
    let tid = localStorage.getItem("praivacy-tenant-id");

    // Optimistic UI update to prevent flicker
    const cachedName = localStorage.getItem("praivacy-display-name");
    const brandNameEl = document.querySelector(".brand-name");
    if (brandNameEl) {
        if (cachedName) brandNameEl.textContent = cachedName;
        else if (tid) brandNameEl.textContent = tid;
    }

    if (t && await validateToken(t)) {
        adminToken = t;

        // Always prioritize tenantId from token to prevent mismatch
        const payload = parseJwt(t);
        if (payload && payload.tenantId) {
            // If we have a tenantId in the token, specifically use that one
            if (tid && tid.toLowerCase() !== payload.tenantId.toLowerCase()) {
                console.warn(`[PrAIvacy] correcting tenantId from ${tid} to ${payload.tenantId}`);
            }
            tid = payload.tenantId;
            localStorage.setItem("praivacy-tenant-id", tid);
        }

        if (tid) {
            tenantId = tid;
            authTenantInput.value = tenantId || "";
            unlockDashboard();
            initAdminMenu();

            // Auto-fetch user info if missing
            if (!localStorage.getItem("praivacy-user-name")) {
                try {
                    const me = await fetchJson(`${apiBase}/admin/me`);
                    if (me.name) localStorage.setItem("praivacy-user-name", me.name);
                    if (me.email) localStorage.setItem("praivacy-user-email", me.email);
                    const nameEl = document.getElementById("menu-user-name");
                    const emailEl = document.getElementById("menu-user-email");
                    if (nameEl && me.name) nameEl.textContent = me.name;
                    if (emailEl && me.email) emailEl.textContent = me.email;
                } catch (_) { }
            }

            loadTenantConfig(); // Load branding immediately
            loadData();
        } else {
            console.warn("Token valid but no tenantId found. Relogin required.");
            lockDashboard();
        }
    } else {
        lockDashboard();
    }
})();
