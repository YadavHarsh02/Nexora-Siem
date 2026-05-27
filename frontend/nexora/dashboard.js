let severityChart;
let typeChart;

let previousAlertCount = 0;

function apiBase() {
    const config = window.NEXORA_CONFIG || {};
    return config.API_URL || "http://127.0.0.1:8000";
}

async function authHeaders() {
    return { "Content-Type": "application/json" };
}

// =========================
// LOAD DASHBOARD (live pipeline from Elastic)
// =========================

async function loadDashboard() {

    try {

        const response = await fetch(
            `${apiBase()}/api/v1/live/dashboard`,
            { headers: await authHeaders() }
        );

        if (response.status === 401) {
            console.log("Sign in required for live dashboard");
            return;
        }

        const data = await response.json();

        const alerts = data.alerts || [];

        updateStats(alerts);

        renderCharts(alerts);

        renderTable(alerts);

        renderMitre(alerts);

        renderThreatIntel(alerts);

        updateTicker(alerts);

        triggerLivePopup(alerts);

        if (data.attack_chains) {
            renderCorrelation(data.attack_chains);
        }

        if (data.event_count === 0 && data.message) {
            console.log(data.message);
        }

    } catch (error) {

        console.log(
            "Dashboard load error:",
            error
        );

    }

}

// =========================
// LOAD CORRELATION CHAINS (legacy fallback)
// =========================

async function loadCorrelationChains() {

    try {

        const response = await fetch(
            `${apiBase()}/correlation/chains`,
            { headers: await authHeaders() }
        );

        const data = await response.json();

        const chains = data.chains || [];

        renderCorrelation(chains);

    } catch (error) {

        console.log(
            "Correlation fetch error:",
            error
        );

    }

}

// =========================
// UPDATE STATS
// =========================

function updateStats(alerts) {

    const total = alerts.length;

    const high = alerts.filter(
        a => (a.severity || "").toUpperCase() === "HIGH"
    ).length;

    const medium = alerts.filter(
        a => (a.severity || "").toUpperCase() === "MEDIUM"
    ).length;

    const low = alerts.filter(
        a => (a.severity || "").toUpperCase() === "LOW"
    ).length;

    document.getElementById(
        "totalAlerts"
    ).innerText = total;

    document.getElementById(
        "highAlerts"
    ).innerText = high;

    document.getElementById(
        "mediumAlerts"
    ).innerText = medium;

    document.getElementById(
        "lowAlerts"
    ).innerText = low;

}

// =========================
// RENDER CHARTS
// =========================

function renderCharts(alerts) {

    const high = alerts.filter(
        a => (a.severity || "").toUpperCase() === "HIGH"
    ).length;

    const medium = alerts.filter(
        a => (a.severity || "").toUpperCase() === "MEDIUM"
    ).length;

    const low = alerts.filter(
        a => (a.severity || "").toUpperCase() === "LOW"
    ).length;

    // ALERT TYPES

    const typeMap = {};

    alerts.forEach(alert => {

        const type =
            alert.alert_type || "unknown";

        if (!typeMap[type]) {
            typeMap[type] = 0;
        }

        typeMap[type] += 1;

    });

    // DESTROY OLD

    if (severityChart) {
        severityChart.destroy();
    }

    if (typeChart) {
        typeChart.destroy();
    }

    // SEVERITY CHART

    severityChart = new Chart(

        document.getElementById(
            "severityChart"
        ),

        {
            type: "doughnut",

            data: {

                labels: [
                    "HIGH",
                    "MEDIUM",
                    "LOW"
                ],

                datasets: [{
                    data: [
                        high,
                        medium,
                        low
                    ],
                    backgroundColor: [
                        "#dc2626",
                        "#f59e0b",
                        "#2563eb"
                    ]
                }]
            }
        }
    );

    // TYPE CHART

    typeChart = new Chart(

        document.getElementById(
            "typeChart"
        ),

        {
            type: "bar",

            data: {

                labels: Object.keys(typeMap),

                datasets: [{
                    label: "Alerts",
                    data: Object.values(typeMap),
                    backgroundColor: "#38bdf8"
                }]
            }
        }
    );

}

// =========================
// RENDER ALERT TABLE
// =========================

function renderTable(alerts) {

    const table = document.getElementById(
        "alertsTable"
    );

    table.innerHTML = "";

    alerts.forEach(alert => {

        const severity =
            (alert.severity || "LOW").toUpperCase();

        const row = `

            <tr>

                <td>
                    ${alert.timestamp || "-"}
                </td>

                <td>
                    ${alert.alert_type || "-"}
                </td>

                <td>

                    <span class="severity ${severity}">
                        ${severity}
                    </span>

                </td>

                <td>
                    ${alert.source_ip || "-"}
                </td>

                <td>
                    ${alert.username || "-"}
                </td>

                <td>

                    <button onclick='showModal(${JSON.stringify(alert)})'>
                        Investigate
                    </button>

                </td>

            </tr>

        `;

        table.innerHTML += row;

    });

}

// =========================
// MITRE PANEL
// =========================

function renderMitre(alerts) {

    const container = document.getElementById(
        "mitreContainer"
    );

    container.innerHTML = "";

    alerts.slice(0, 6).forEach(alert => {

        const card = `

            <div class="mitre-card">

                <h3>
                    ${alert.alert_type || "Unknown"}
                </h3>

                <p>

                    ${
                        alert.mitre_attack?.technique ||
                        "T1110 Brute Force"
                    }

                </p>

                <span>

                    ${
                        alert.mitre_attack?.tactic ||
                        "Credential Access"
                    }

                </span>

            </div>

        `;

        container.innerHTML += card;

    });

}

// =========================
// THREAT INTEL PANEL
// =========================

function renderThreatIntel(alerts) {

    const container = document.getElementById(
        "intelContainer"
    );

    container.innerHTML = "";

    alerts.slice(0, 5).forEach(alert => {

        const intel = `

            <div class="intel-card">

                <h3>
                    ${alert.source_ip || "Unknown IP"}
                </h3>

                <p>
                    Suspicious activity observed
                </p>

                <span>
                    Reputation: MALICIOUS
                </span>

            </div>

        `;

        container.innerHTML += intel;

    });

}

// =========================
// CORRELATION PANEL
// =========================

function renderCorrelation(chains) {

    const container = document.getElementById(
        "correlationContainer"
    );

    container.innerHTML = "";

    if (chains.length === 0) {

        container.innerHTML = `

            <div class="correlation-card">

                <h3>
                    No attack chains detected
                </h3>

            </div>

        `;

        return;

    }

    chains.forEach(chain => {

        const events =
            chain.events?.join(" → ")
            || "Unknown Sequence";

        const card = `

            <div class="correlation-card">

                <h3>
                    ${chain.chain_type || "Unknown Chain"}
                </h3>

                <p>
                    ${chain.description || ""}
                </p>

                <div class="attack-flow">
                    ${events}
                </div>

                <span class="severity ${chain.severity}">
                    ${chain.severity}
                </span>

            </div>

        `;

        container.innerHTML += card;

    });

}

// =========================
// LIVE TICKER
// =========================

// =========================
// LIVE TICKER
// =========================

function updateTicker(alerts) {

    const ticker = document.getElementById(
        "liveTicker"
    );

    if (!ticker) return;

    const latest = alerts
        .slice(0, 5)
        .map(alert => {

            return `
                🚨 ${alert.alert_type || "Unknown Alert"}
                from
                ${alert.source_ip || "Unknown IP"}
            `;

        })
        .join("   •   ");

    ticker.innerHTML = latest;

}
// =========================
// POPUP ALERTS
// =========================

function triggerLivePopup(alerts) {

    if (alerts.length > previousAlertCount) {

        const latest = alerts[0];

        const popup = document.getElementById(
            "alertPopup"
        );

        popup.innerHTML = `

            🚨 ${latest.alert_type}
            from
            ${latest.source_ip}

        `;

        popup.classList.add("show-popup");

        document.getElementById(
            "alertSound"
        ).play();

        setTimeout(() => {

            popup.classList.remove(
                "show-popup"
            );

        }, 4000);

    }

    previousAlertCount = alerts.length;

}

// =========================
// THREAT HUNT
// =========================

async function huntSearch() {

    const query = document.getElementById(
        "huntInput"
    ).value;

    if (!query) {
        return;
    }

    try {

        const response = await fetch(
            `http://127.0.0.1:8000/hunt/query?q=${query}`
        );

        const data = await response.json();

        renderTable(data.results || []);

    } catch (error) {

        console.log(
            "Threat hunt error:",
            error
        );

    }

}

// =========================
// ALERT MODAL
// =========================

function showModal(alert) {

    const modal = document.getElementById(
        "alertModal"
    );

    const body = document.getElementById(
        "modalBody"
    );

    body.innerHTML = `

        <p><b>Alert Type:</b> ${alert.alert_type}</p>

        <p><b>Severity:</b> ${alert.severity}</p>

        <p><b>Source IP:</b> ${alert.source_ip}</p>

        <p><b>User:</b> ${alert.username}</p>

        <p><b>Timestamp:</b> ${alert.timestamp}</p>

        <hr>

        <button>
            Escalate Incident
        </button>

        <button>
            Block IP
        </button>

    `;

    modal.style.display = "flex";

}

function closeModal() {

    document.getElementById(
        "alertModal"
    ).style.display = "none";

}

// =========================
// INITIAL LOAD
// =========================

loadDashboard();

loadCorrelationChains();

// =========================
// INITIAL LOAD
// =========================

loadDashboard();

loadCorrelationChains();


// =========================
// WEBSOCKET LIVE ALERTS
// =========================

const socket = new WebSocket(
    "ws://127.0.0.1:8000/ws/live-alerts"
);

socket.onopen = () => {

    console.log(
        "[INFO] WebSocket connected"
    );

    socket.send("frontend_connected");

};

socket.onmessage = (event) => {

    console.log(
        "[LIVE ALERT]",
        event.data
    );

    // reload dashboard instantly

    loadDashboard();

    loadCorrelationChains();

};

socket.onclose = () => {

    console.log(
        "[INFO] WebSocket disconnected"
    );

};


// =========================
// FALLBACK REFRESH
// =========================

setInterval(() => {

    loadDashboard();

    loadCorrelationChains();

}, 30000);
