// Mock Chrome Extension API for Playground

window.chrome = {
    runtime: {
        getURL: (path) => {
            if (path.startsWith("src/")) {
                return `/extension-src/${path.replace("src/", "")}`;
            }
            return `/extension-src/${path}`;
        },
        sendMessage: (message, callback) => {
            console.log("[MockChrome] sendMessage:", message);
            if (message.type === "PRAIVACY_TELEMETRY_EVENT") {
                // Simulate successful telemetry logging
                if (callback) callback({ ok: true });
            }
        },
        onMessage: {
            addListener: (callback) => {
                console.log("[MockChrome] onMessage listener added");
            }
        },
        getManifest: () => ({ version: "1.6.0-playground" })
    },
    storage: {
        local: {
            get: (keys, callback) => {
                const data = JSON.parse(localStorage.getItem("praivacy_mock_storage") || "{}");
                if (!keys) {
                    callback(data);
                    return;
                }
                const result = {};
                const keyList = Array.isArray(keys) ? keys : [keys];
                keyList.forEach(k => {
                    result[k] = data[k];
                });
                // Default policy if not present
                if (!result.policy) {
                    result.policy = {
                        sensitivityThreshold: 1.2,
                        mlEnabled: false,
                        customKeywords: [],
                        customRegexes: []
                    };
                }
                callback(result);
            },
            set: (items, callback) => {
                const data = JSON.parse(localStorage.getItem("praivacy_mock_storage") || "{}");
                Object.assign(data, items);
                localStorage.setItem("praivacy_mock_storage", JSON.stringify(data));
                console.log("[MockChrome] storage set:", items);

                // Trigger onChanged
                if (window.chrome.storage.onChanged._listeners) {
                    const changes = {};
                    Object.keys(items).forEach(k => {
                        changes[k] = { newValue: items[k] };
                    });
                    window.chrome.storage.onChanged._listeners.forEach(l => l(changes, "local"));
                }

                if (callback) callback();
            }
        },
        onChanged: {
            _listeners: [],
            addListener: (callback) => {
                window.chrome.storage.onChanged._listeners.push(callback);
            }
        }
    },
    alarms: {
        create: (name, info) => console.log(`[MockChrome] Alarm created: ${name}`, info),
        onAlarm: {
            addListener: () => { }
        }
    }
};

console.log("Mock Chrome API initialized");
