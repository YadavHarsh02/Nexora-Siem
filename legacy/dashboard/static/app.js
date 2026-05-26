import { useEffect, useState } from "react";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis
} from "recharts";

function App() {

  const [alerts, setAlerts] = useState([]);
  const [search, setSearch] = useState("");

  // =========================
  // FETCH ALERTS
  // =========================

  const fetchAlerts = async () => {

    try {

      const response = await fetch(
        "http://127.0.0.1:8000/alerts/recent"
      );

      const data = await response.json();

      if (data.alerts) {
        setAlerts(data.alerts);
      }

    } catch (error) {

      console.log("Frontend fetch error:", error);

    }

  };

  // =========================
  // LIVE REFRESH
  // =========================

  useEffect(() => {

    fetchAlerts();

    const interval = setInterval(() => {

      fetchAlerts();

    }, 5000);

    return () => clearInterval(interval);

  }, []);

  // =========================
  // COUNTS
  // =========================

  const totalAlerts = alerts.length;

  const highCount = alerts.filter(
    a => a.severity?.toUpperCase() === "HIGH"
  ).length;

  const mediumCount = alerts.filter(
    a => a.severity?.toUpperCase() === "MEDIUM"
  ).length;

  const lowCount = alerts.filter(
    a => a.severity?.toUpperCase() === "LOW"
  ).length;

  // =========================
  // PIE DATA
  // =========================

  const severityData = [
    { name: "HIGH", value: highCount },
    { name: "MEDIUM", value: mediumCount },
    { name: "LOW", value: lowCount }
  ];

  const COLORS = [
    "#ff4d4f",
    "#faad14",
    "#52c41a"
  ];

  // =========================
  // BAR DATA
  // =========================

  const typeMap = {};

  alerts.forEach((alert) => {

    const type = alert.alert_type || "unknown";

    if (!typeMap[type]) {
      typeMap[type] = 0;
    }

    typeMap[type] += 1;

  });

  const typeData = Object.keys(typeMap).map((key) => ({
    type: key,
    count: typeMap[key]
  }));

  // =========================
  // THREAT HUNT
  // =========================

  const runThreatHunt = async () => {

    try {

      const response = await fetch(
        `http://127.0.0.1:8000/hunt/query?q=${search}`
      );

      const data = await response.json();

      if (data.results) {
        setAlerts(data.results);
      }

    } catch (error) {

      console.log("Threat hunt error:", error);

    }

  };

  return (

    <div className="min-h-screen bg-black text-white p-6">

      {/* HEADER */}

      <div className="flex justify-between items-center mb-8">

        <h1 className="text-4xl font-bold text-cyan-400">
          Mini SIEM Dashboard
        </h1>

        <div className="text-green-400 font-bold">
          SOC STATUS: ACTIVE
        </div>

      </div>

      {/* STATS */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">

        <div className="bg-zinc-900 p-6 rounded-xl border border-cyan-500">

          <h2 className="text-cyan-400 text-lg">
            Total Alerts
          </h2>

          <p className="text-4xl font-bold mt-2">
            {totalAlerts}
          </p>

        </div>

        <div className="bg-zinc-900 p-6 rounded-xl border border-red-500">

          <h2 className="text-red-400 text-lg">
            High Severity
          </h2>

          <p className="text-4xl font-bold mt-2">
            {highCount}
          </p>

        </div>

        <div className="bg-zinc-900 p-6 rounded-xl border border-yellow-500">

          <h2 className="text-yellow-400 text-lg">
            Medium Severity
          </h2>

          <p className="text-4xl font-bold mt-2">
            {mediumCount}
          </p>

        </div>

        <div className="bg-zinc-900 p-6 rounded-xl border border-green-500">

          <h2 className="text-green-400 text-lg">
            Low Severity
          </h2>

          <p className="text-4xl font-bold mt-2">
            {lowCount}
          </p>

        </div>

      </div>

      {/* CHARTS */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

        {/* PIE */}

        <div className="bg-zinc-900 p-6 rounded-xl">

          <h2 className="text-2xl font-bold mb-4 text-cyan-400">
            Severity Distribution
          </h2>

          <ResponsiveContainer width="100%" height={300}>

            <PieChart>

              <Pie
                data={severityData}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label
              >

                {
                  severityData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))
                }

              </Pie>

              <Tooltip />

            </PieChart>

          </ResponsiveContainer>

        </div>

        {/* BAR */}

        <div className="bg-zinc-900 p-6 rounded-xl">

          <h2 className="text-2xl font-bold mb-4 text-cyan-400">
            Alert Types
          </h2>

          <ResponsiveContainer width="100%" height={300}>

            <BarChart data={typeData}>

              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip />

              <Bar
                dataKey="count"
                fill="#06b6d4"
              />

            </BarChart>

          </ResponsiveContainer>

        </div>

      </div>

      {/* THREAT HUNT */}

      <div className="bg-zinc-900 p-6 rounded-xl mb-8">

        <h2 className="text-2xl font-bold mb-4 text-cyan-400">
          Threat Hunt
        </h2>

        <div className="flex gap-4">

          <input
            type="text"
            placeholder="Search IP / username / severity / alert type"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-black border border-cyan-500 rounded-lg p-3 text-white"
          />

          <button
            onClick={runThreatHunt}
            className="bg-cyan-500 px-6 rounded-lg font-bold text-black"
          >
            Hunt
          </button>

        </div>

      </div>

      {/* MITRE PANEL */}

      <div className="bg-zinc-900 p-6 rounded-xl mb-8">

        <h2 className="text-2xl font-bold mb-4 text-cyan-400">
          MITRE ATT&CK Activity
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {
            alerts.slice(0, 6).map((alert, index) => (

              <div
                key={index}
                className="bg-black border border-cyan-500 p-4 rounded-lg"
              >

                <h3 className="text-red-400 font-bold mb-2">
                  {alert.alert_type || "Unknown Threat"}
                </h3>

                <p className="text-sm text-zinc-300 mb-2">
                  Severity: {alert.severity || "UNKNOWN"}
                </p>

                <p className="text-sm text-zinc-400">
                  {
                    alert.mitre_attack?.technique ||
                    "T1110 Brute Force"
                  }
                </p>

                <p className="text-xs text-zinc-500 mt-2">
                  {
                    alert.mitre_attack?.tactic ||
                    "Credential Access"
                  }
                </p>

              </div>

            ))
          }

        </div>

      </div>

      {/* ALERT TABLE */}

      <div className="bg-zinc-900 rounded-xl p-6 overflow-auto">

        <h2 className="text-2xl font-bold mb-4 text-cyan-400">
          Recent Alerts
        </h2>

        <table className="w-full text-left">

          <thead>

            <tr className="border-b border-zinc-700">

              <th className="p-3">Timestamp</th>
              <th className="p-3">Alert Type</th>
              <th className="p-3">Severity</th>
              <th className="p-3">IP</th>
              <th className="p-3">User</th>

            </tr>

          </thead>

          <tbody>

            {
              alerts.map((alert, index) => (

                <tr
                  key={index}
                  className="border-b border-zinc-800 hover:bg-zinc-800"
                >

                  <td className="p-3">
                    {alert.timestamp || "-"}
                  </td>

                  <td className="p-3">
                    {alert.alert_type || "-"}
                  </td>

                  <td className="p-3">
                    {alert.severity || "-"}
                  </td>

                  <td className="p-3">
                    {alert.source_ip || "-"}
                  </td>

                  <td className="p-3">
                    {alert.username || "-"}
                  </td>

                </tr>

              ))
            }

          </tbody>

        </table>

      </div>

    </div>

  );

}

export default App;
