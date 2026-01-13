const apiBase = `${window.location.origin}/api/v1`;

// DOM Elements
const policyText = document.getElementById("policy-text");
const saveBtn = document.getElementById("save-context-btn");
const saveStatus = document.getElementById("save-status");
const policyUpload = document.getElementById("policy-upload");
const authGate = document.getElementById("auth-gate");
const authTenantInput = document.getElementById("auth-tenant");
const authEmailInput = document.getElementById("auth-email");
const authPasswordInput = document.getElementById("auth-password");
const authSubmit = document.getElementById("auth-submit");
const authStatus = document.getElementById("auth-status");
const appShell = document.getElementById("app-shell");
const logoutBtn = document.getElementById("logout-btn");
const adminMenu = document.getElementById("admin-menu");
const adminMenuToggle = document.getElementById("admin-menu-toggle");
const currentTenant = document.getElementById("current-tenant");
const settingsBtn = document.getElementById("settings-btn");

// New Config Elements
const sensitivitySlider = document.getElementById("sensitivity-slider");
const sensitivityValue = document.getElementById("sensitivity-value");
const saveConfigBtn = document.getElementById("save-config-btn");
const saveConfigStatus = document.getElementById("save-config-status");

// Taxonomy Logic Elements
const taxonomyBody = document.getElementById("taxonomy-body");
const newCatKey = document.getElementById("new-cat-key");
const newCatLabel = document.getElementById("new-cat-label");
const addCatBtn = document.getElementById("add-cat-btn");

// Trigger Logic Elements
const triggerBody = document.getElementById("trigger-body");
const newTriggerKey = document.getElementById("new-trigger-key");
const newTriggerWords = document.getElementById("new-trigger-words");
const addTriggerBtn = document.getElementById("add-trigger-btn");

let adminToken = localStorage.getItem("praivacy-admin-token") || "";
let tenantId = localStorage.getItem("praivacy-tenant-id") || "";
let tenantConfig = {};
let categoryState = {}; // Stores key: label
let triggerState = {}; // Stores key: [keywords]

// Standard Detection Codes
const KNOWN_CODES = [
    { code: "email", label: "Email Address" },
    { code: "phone", label: "Phone Number" },
    { code: "credit_card", label: "Credit Card Number" },
    { code: "ssn", label: "Social Security Number (SSN)" },
    { code: "iban", label: "IBAN Bank Account" },
    { code: "api_key", label: "Generic API Key" },
    { code: "openai_key", label: "OpenAI API Key" },
    { code: "jwt", label: "JSON Web Token (JWT)" },
    { code: "aws_access_key", label: "AWS Access Key" },
    { code: "secret_value", label: "Generic Secret Value" },
    { code: "ipv4", label: "IPv4 Address" },
    { code: "salary_change", label: "Salary Change / Compensation" },
    { code: "bonus_detail", label: "Bonus Details" },
    { code: "headcount_plan", label: "Headcount Planning" },
    { code: "financial_projection", label: "Financial Projection" },
    { code: "legal_reference", label: "Legal Terms / Reference" },
    { code: "security_incident", label: "Security Incident" },
    { code: "project_codename", label: "Project Codename" },
    { code: "product_roadmap", label: "Product Roadmap" },
    { code: "internal_system", label: "Internal System Reference" },
    { code: "keyword", label: "Keyword Match" },
    { code: "custom_regex", label: "Custom Regex Match" },
    { code: "sensitive_attachment", label: "Sensitive Attachment" }
];

function applyTenantUI() {
    const display = tenantConfig.displayName || tenantId || "Sanitized Ai";

    // Update Brand Name
    const brandNameEl = document.querySelector(".brand-name");
    if (brandNameEl) {
        brandNameEl.textContent = display;
    }

    try {
        if (tenantConfig.displayName || tenantId) {
            localStorage.setItem("praivacy-display-name", display);
        }
    } catch (_) { }

    // Update Branding
    if (tenantConfig.branding?.logoUrl) {
        const logo = document.querySelector(".brand-logo");
        if (logo) logo.src = tenantConfig.branding.logoUrl;
    }

    if (tenantConfig.branding?.accentColor) {
        document.documentElement.style.setProperty("--accent", tenantConfig.branding.accentColor);
    }

    if (currentTenant) currentTenant.textContent = display;
}

// Initialize
const cachedName = localStorage.getItem("praivacy-display-name");
if (cachedName) {
    const brandNameEl = document.querySelector(".brand-name");
    if (brandNameEl) brandNameEl.textContent = cachedName;
}

checkAuth();

async function fetchJson(url, options = {}) {
    const headers = options.headers || {};
    if (adminToken) {
        headers["Authorization"] = adminToken.startsWith("Bearer ") ? adminToken : `Bearer ${adminToken}`;
    }
    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
        let errData;
        try { errData = await res.json(); } catch (_) { }
        throw new Error((errData && errData.error) || `HTTP ${res.status}`);
    }
    return res.json();
}

async function checkAuth() {
    if (!adminToken || !tenantId) {
        showAuth();
        return;
    }
    try {
        // Ensure user info is loaded
        if (!localStorage.getItem("praivacy-user-name")) {
            try {
                const me = await fetchJson(`${apiBase}/admin/me`);
                if (me.name) localStorage.setItem("praivacy-user-name", me.name);
                if (me.email) localStorage.setItem("praivacy-user-email", me.email);
                updateUserMenu();
            } catch (_) { }
        } else {
            updateUserMenu();
        }

        await loadContext();
        unlockDashboard();
    } catch (err) {
        console.warn("Auth check failed:", err);
        showAuth();
    }
}

function showAuth() {
    if (authGate) authGate.classList.remove("hidden");
    if (appShell) appShell.classList.add("hidden");
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
}

function unlockDashboard() {
    authGate.classList.add("hidden");
    appShell.classList.remove("hidden");
    initAdminMenu();
    if (currentTenant) currentTenant.textContent = tenantId;
}

// Logic Functions
function updateCodeSuggestions() {
    const datalist = document.getElementById("code-suggestions");
    if (!datalist) return;
    datalist.innerHTML = "";
    const usedKeys = new Set(Object.keys(categoryState));
    KNOWN_CODES.forEach(item => {
        if (!usedKeys.has(item.code)) {
            const opt = document.createElement("option");
            opt.value = item.code;
            opt.label = item.label;
            datalist.appendChild(opt);
        }
    });
}

function updateTriggerSuggestions() {
    const datalist = document.getElementById("trigger-suggestions");
    if (!datalist) return;
    datalist.innerHTML = "";
    Object.keys(categoryState).forEach(key => {
        const opt = document.createElement("option");
        opt.value = key;
        datalist.appendChild(opt);
    });
}

function renderTaxonomy() {
    if (!taxonomyBody) return;
    taxonomyBody.innerHTML = "";
    const entries = Object.entries(categoryState).sort((a, b) => a[0].localeCompare(b[0]));
    if (entries.length === 0) {
        taxonomyBody.innerHTML = `<tr><td colspan="3" class="placeholder" style="padding: 16px; font-size: 12px;">No categories defined.</td></tr>`;
    } else {
        entries.forEach(([key, label]) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td class="mono" style="color: #60a5fa;">${key}</td>
                <td>${label}</td>
                <td style="text-align: right;">
                    <button class="icon-btn delete-cat" data-key="${key}" title="Remove">×</button>
                </td>
            `;
            taxonomyBody.appendChild(row);
        });
    }
    document.querySelectorAll(".delete-cat").forEach(btn => {
        btn.addEventListener("click", (e) => removeCategory(e.currentTarget.dataset.key));
    });
    updateCodeSuggestions();
    updateTriggerSuggestions();
}

function renderTriggers() {
    if (!triggerBody) return;
    triggerBody.innerHTML = "";
    const entries = Object.entries(triggerState).sort((a, b) => a[0].localeCompare(b[0]));
    if (entries.length === 0) {
        triggerBody.innerHTML = `<tr><td colspan="3" class="placeholder" style="padding: 16px; font-size: 12px;">No custom triggers defined.</td></tr>`;
    } else {
        entries.forEach(([key, words]) => {
            const row = document.createElement("tr");
            const wordStr = (words || []).join(", ");
            row.innerHTML = `
                <td class="mono" style="color: #F472B6;">${key}</td>
                <td style="font-size: 12px; color: #94A3B8;">${wordStr}</td>
                <td style="text-align: right;">
                    <button class="icon-btn delete-trigger" data-key="${key}" title="Remove">×</button>
                </td>
            `;
            triggerBody.appendChild(row);
        });
    }
    document.querySelectorAll(".delete-trigger").forEach(btn => {
        btn.addEventListener("click", (e) => removeTrigger(e.currentTarget.dataset.key));
    });
}

function addCategory() {
    const k = (newCatKey.value || "").trim();
    const l = (newCatLabel.value || "").trim();
    if (!k || !l) return;
    categoryState[k] = l;
    newCatKey.value = "";
    newCatLabel.value = "";
    renderTaxonomy();
    newCatKey.focus();
}

function removeCategory(key) {
    if (categoryState[key]) {
        delete categoryState[key];
        renderTaxonomy();
    }
}

function addTrigger() {
    const k = (newTriggerKey.value || "").trim();
    const w = (newTriggerWords.value || "").trim();
    if (!k || !w) return;
    const keywords = w.split(",").map(s => s.trim()).filter(Boolean);
    if (!keywords.length) return;
    triggerState[k] = keywords;
    newTriggerKey.value = "";
    newTriggerWords.value = "";
    renderTriggers();
    newTriggerKey.focus();
}

function removeTrigger(key) {
    if (triggerState[key]) {
        delete triggerState[key];
        renderTriggers();
    }
}

// Data Handling
const ALLOWED_KEYS = [
    "displayName", "categoryLabels", "customKeywordsMap", "hostLabels", "ruleLabels",
    "sensitivityThreshold", "defaults", "savedViews", "branding", "policyContext"
];

function getSanitizedConfig(updates = {}) {
    const combined = { ...tenantConfig, ...updates };
    const clean = {};
    ALLOWED_KEYS.forEach(k => {
        if (combined[k] !== undefined) clean[k] = combined[k];
    });
    return clean;
}

async function loadContext() {
    if (!tenantId || !adminToken) return;
    try {
        const resp = await fetch(`${apiBase}/admin/tenants/${encodeURIComponent(tenantId)}/config`, {
            headers: { "Authorization": `Bearer ${adminToken}` }
        });
        if (!resp.ok) throw new Error("Failed to load config");
        const data = await resp.json();
        tenantConfig = data.config || {};

        if (policyText) policyText.value = tenantConfig.policyContext || "";
        if (sensitivitySlider) {
            sensitivitySlider.value = tenantConfig.sensitivityThreshold !== undefined ? tenantConfig.sensitivityThreshold : 1.2;
            if (sensitivityValue) sensitivityValue.textContent = sensitivitySlider.value;
        }

        categoryState = { ...(tenantConfig.categoryLabels || {}) };
        triggerState = { ...(tenantConfig.customKeywordsMap || {}) };
        renderTaxonomy();
        renderTriggers();
        applyTenantUI();
    } catch (err) {
        console.error(err);
        if (saveStatus) saveStatus.textContent = "Error loading context.";
    }
}

async function savePolicy() {
    if (!tenantId || !adminToken) return;
    saveBtn.disabled = true;
    saveStatus.textContent = "Saving...";
    saveStatus.style.color = "#94A3B8";
    try {
        const payload = getSanitizedConfig({ policyContext: policyText.value });
        const resp = await fetch(`${apiBase}/admin/tenants/${encodeURIComponent(tenantId)}/config`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${adminToken}`
            },
            body: JSON.stringify(payload)
        });
        if (!resp.ok) throw new Error("Failed to save");
        tenantConfig = (await resp.json()).config;
        saveStatus.textContent = "Saved.";
        saveStatus.style.color = "#34D399";
        setTimeout(() => { saveStatus.textContent = ""; }, 3000);
    } catch (err) {
        console.error(err);
        saveStatus.textContent = "Error saving.";
        saveStatus.style.color = "#EF4444";
    } finally {
        saveBtn.disabled = false;
    }
}

async function saveConfig() {
    if (!tenantId || !adminToken) return;
    saveConfigBtn.disabled = true;
    saveConfigStatus.textContent = "Saving...";
    saveConfigStatus.style.color = "#94A3B8";
    try {
        const payload = getSanitizedConfig({
            sensitivityThreshold: Number(sensitivitySlider.value),
            categoryLabels: categoryState,
            customKeywordsMap: triggerState
        });
        const resp = await fetch(`${apiBase}/admin/tenants/${encodeURIComponent(tenantId)}/config`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${adminToken}`
            },
            body: JSON.stringify(payload)
        });
        if (!resp.ok) throw new Error("Failed to save configuration");
        tenantConfig = (await resp.json()).config;
        saveConfigStatus.textContent = "Saved.";
        saveConfigStatus.style.color = "#34D399";
        setTimeout(() => { saveConfigStatus.textContent = ""; }, 3000);
    } catch (err) {
        console.error(err);
        saveConfigStatus.textContent = "Error saving config.";
        saveConfigStatus.style.color = "#EF4444";
    } finally {
        saveConfigBtn.disabled = false;
    }
}

// Event Listeners
if (authSubmit) {
    authSubmit.addEventListener("click", async () => {
        const t = authTenantInput.value.trim();
        const e = authEmailInput.value.trim();
        const p = authPasswordInput.value.trim();
        if (!t || !e || !p) {
            authStatus.textContent = "All fields required.";
            return;
        }
        authStatus.textContent = "Authenticating...";
        try {
            const res = await fetch(`${apiBase}/admin/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tenantId: t, email: e, password: p })
            });
            const data = await res.json();
            if (!res.ok) {
                authStatus.textContent = "Login failed: " + (data.error || "Unknown");
                return;
            }
            if (data.token) {
                adminToken = data.token;
                tenantId = t;
                localStorage.setItem("praivacy-admin-token", adminToken);
                tenantId = data.tenantId || t;
                localStorage.setItem("praivacy-tenant-id", tenantId);

                if (data.name) localStorage.setItem("praivacy-user-name", data.name);
                if (data.email) localStorage.setItem("praivacy-user-email", data.email);

                authStatus.textContent = "Success!";
                await loadContext();
                unlockDashboard();
                updateUserMenu();
            }
        } catch (err) {
            console.error(err);
            authStatus.textContent = "Network error.";
        }
    });
}

if (saveBtn) saveBtn.addEventListener("click", savePolicy);
if (saveConfigBtn) saveConfigBtn.addEventListener("click", saveConfig);

if (policyUpload) {
    policyUpload.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => { policyText.value = ev.target.result; };
        reader.readAsText(file);
    });
}

if (sensitivitySlider) {
    sensitivitySlider.addEventListener("input", (e) => {
        if (sensitivityValue) sensitivityValue.textContent = e.target.value;
    });
}

if (addCatBtn) addCatBtn.addEventListener("click", addCategory);
if (addTriggerBtn) addTriggerBtn.addEventListener("click", addTrigger);

if (newCatLabel) {
    newCatLabel.addEventListener("keydown", (e) => {
        if (e.key === "Enter") addCategory();
    });
}
if (newCatKey) {
    newCatKey.addEventListener("change", () => {
        const val = newCatKey.value;
        const known = KNOWN_CODES.find(c => c.code === val);
        if (known && !newCatLabel.value) newCatLabel.value = known.label;
    });
}

// Menu / Globals
if (adminMenuToggle && adminMenu) {
    // Remove existing clones by re-assigning
    const newToggle = adminMenuToggle.cloneNode(true);
    adminMenuToggle.parentNode.replaceChild(newToggle, adminMenuToggle);
    newToggle.addEventListener("click", (e) => {
        e.stopPropagation();
        adminMenu.classList.toggle("hidden");
    });

    document.addEventListener("click", (e) => {
        if (!newToggle.contains(e.target) && !adminMenu.contains(e.target)) {
            adminMenu.classList.add("hidden");
        }
    });

    // Prevent menu close when clicking inside
    adminMenu.addEventListener("click", (e) => e.stopPropagation());
}

if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("praivacy-admin-token");
        location.reload();
    });
}
if (settingsBtn) {
    settingsBtn.addEventListener("click", () => {
        window.location.href = "/app.html#settings";
    });
}

// User Info Display
function updateUserMenu() {
    const n = localStorage.getItem("praivacy-user-name");
    const e = localStorage.getItem("praivacy-user-email");
    const nameEl = document.getElementById("menu-user-name");
    const emailEl = document.getElementById("menu-user-email");

    if (nameEl && n) nameEl.textContent = n;
    if (emailEl && e) emailEl.textContent = e;
}
updateUserMenu();
