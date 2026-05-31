"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// Types matching API structure
interface MitreAttack {
  technique_id: string;
  technique: string;
  tactic: string;
}

interface Alert {
  alert_type: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRIT" | string;
  description: string;
  timestamp: string;
  source_ip: string;
  username: string;
  event_count: number;
  mitre_attack?: MitreAttack;
  risk_score: number;
  priority?: string;
  nexora_user_id?: string;
}

interface AttackChain {
  chain_type: string;
  source: string;
  events: string[];
  severity: string;
  description: string;
}

interface MLAnalysis {
  prediction: "malicious" | "benign" | string;
  confidence: number;
}

interface Metrics {
  total_alerts: number;
  high_risk_pct: number;
  medium_risk_pct: number;
  ml_prediction: string;
  ml_confidence: number;
  soc_health_score: number;
}
interface RawEvent {
  timestamp: string;
  event_type: string;
  username: string;
  source_ip: string;
  message: string;
}

interface DashboardData {
  user_id: string;
  event_count: number;
  alerts: Alert[];
  attack_chains: AttackChain[];
  ml_analysis: MLAnalysis | null;
  metrics: Metrics | null;
  raw_events: RawEvent[];
}

// Premium Mock Data for Offline/Demo Fallback
const MOCK_DASHBOARD_DATA: DashboardData = {
  user_id: "demo_user",
  event_count: 14248,
  alerts: [
    {
      alert_type: "brute_force_attack",
      severity: "HIGH",
      description: "Repeated failed login attempts detected against root from 192.168.1.45",
      timestamp: "May 31 16:04:12",
      source_ip: "192.168.1.45",
      username: "root",
      event_count: 12,
      mitre_attack: { technique_id: "T1110", technique: "Brute Force", tactic: "Credential Access" },
      risk_score: 85,
      priority: "HIGH"
    },
    {
      alert_type: "known_malicious_ip",
      severity: "HIGH",
      description: "Connection request from known Tor exit node IP 185.220.101.5",
      timestamp: "May 31 15:58:33",
      source_ip: "185.220.101.5",
      username: "unknown",
      event_count: 1,
      mitre_attack: { technique_id: "T1090", technique: "Proxy", tactic: "Command and Control" },
      risk_score: 90,
      priority: "HIGH"
    },
    {
      alert_type: "invalid_user_attempt",
      severity: "MEDIUM",
      description: "Login attempt with invalid user 'admin' from 10.0.0.12",
      timestamp: "May 31 15:42:19",
      source_ip: "10.0.0.12",
      username: "admin",
      event_count: 1,
      mitre_attack: { technique_id: "T1589", technique: "Gather Victim Identity Information", tactic: "Reconnaissance" },
      risk_score: 55,
      priority: "MEDIUM"
    },
    {
      alert_type: "sudo_activity",
      severity: "LOW",
      description: "Sudo command execution '/usr/bin/apt-get update' by user security_service",
      timestamp: "May 31 15:30:10",
      source_ip: "127.0.0.1",
      username: "security_service",
      event_count: 1,
      mitre_attack: { technique_id: "T1548", technique: "Abuse Elevation Control Mechanism", tactic: "Privilege Escalation" },
      risk_score: 25,
      priority: "LOW"
    }
  ],
  attack_chains: [
    {
      chain_type: "privilege_escalation",
      source: "127.0.0.1_security_service",
      events: ["failed_login", "sudo_command"],
      severity: "HIGH",
      description: "Failed login followed by successful sudo command"
    },
    {
      chain_type: "brute_force_sequence",
      source: "192.168.1.45_root",
      events: ["failed_login", "failed_login", "failed_login", "failed_login"],
      severity: "MEDIUM",
      description: "Repeated failed login sequence"
    }
  ],
  ml_analysis: {
    prediction: "malicious",
    confidence: 84.75
  },
  metrics: {
    total_alerts: 4,
    high_risk_pct: 50.0,
    medium_risk_pct: 25.0,
    ml_prediction: "malicious",
    ml_confidence: 84.75,
    soc_health_score: 72.4
  },
  raw_events: [
    {
      timestamp: "2026-05-31T04:52:18.905Z",
      event_type: "windows_event",
      username: "HARSSSHHH$",
      source_ip: "unknown",
      message: "A user's local group membership was enumerated. Subject: Security ID: S-1-5-1-..."
    },
    {
      timestamp: "2026-05-31T04:52:18.904Z",
      event_type: "windows_event",
      username: "HARSSSHHH$",
      source_ip: "unknown",
      message: "A user's local group membership was enumerated. Subject: Security ID: S-1-5-1-..."
    },
    {
      timestamp: "2026-05-31T04:52:18.903Z",
      event_type: "windows_event",
      username: "HARSSSHHH$",
      source_ip: "unknown",
      message: "A user's local group membership was enumerated. Subject: Security ID: S-1-5-1-..."
    },
    {
      timestamp: "2026-05-31T04:52:18.902Z",
      event_type: "windows_event",
      username: "HARSSSHHH$",
      source_ip: "unknown",
      message: "A user's local group membership was enumerated. Subject: Security ID: S-1-5-1-..."
    }
  ]
};

const API_BASE_URL = "http://127.0.0.1:8000";
const WS_BASE_URL = "ws://127.0.0.1:8000";

export default function SocDashboard() {
  const [data, setData] = useState<DashboardData>(MOCK_DASHBOARD_DATA);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [backendOnline, setBackendOnline] = useState<boolean>(false);
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [searchResult, setSearchResult] = useState<Alert[] | null>(null);
  const [hunting, setHunting] = useState<boolean>(false);

  const prevAlertCount = useRef<number>(0);
  const wsRef = useRef<WebSocket | null>(null);

  // Fetch live dashboard data
  const fetchDashboardData = async () => {
    if (isDemoMode) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/live/dashboard`);
      if (res.ok) {
        const payload = await res.json();
        setBackendOnline(true);
        if (payload.alerts) {
          setData(payload);
          triggerAlarmSound(payload.alerts);
        }
      } else {
        setBackendOnline(false);
        setData(MOCK_DASHBOARD_DATA);
      }
    } catch (err) {
      console.warn("Backend API offline, using Demo Mode", err);
      setBackendOnline(false);
      setData(MOCK_DASHBOARD_DATA);
    }
  };

  // Play alarm sound if new high alerts are received
  const triggerAlarmSound = (alerts: Alert[]) => {
    if (alerts.length > prevAlertCount.current) {
      const latest = alerts[0];
      const severityStr = String(latest.severity).toUpperCase();
      if ((severityStr === "HIGH" || severityStr === "CRIT") && soundEnabled) {
        const audio = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");
        audio.volume = 0.2;
        audio.play().catch((e) => console.log("Audio play blocked", e));
      }
    }
    prevAlertCount.current = alerts.length;
  };

  // WebSocket Live alerts listener
  useEffect(() => {
    if (isDemoMode) {
      setData(MOCK_DASHBOARD_DATA);
      setWsConnected(false);
      return;
    }

    fetchDashboardData();

    let socket: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;

    const connectWebSocket = () => {
      if (isDemoMode) return;
      try {
        socket = new WebSocket(`${WS_BASE_URL}/ws/live-alerts`);
        wsRef.current = socket;

        socket.onopen = () => {
          setWsConnected(true);
          setBackendOnline(true);
          console.log("[WS] SOC Connected to alert broker");
          socket?.send("frontend_connected");
        };

        socket.onmessage = (event) => {
          console.log("[WS] Received live event update:", event.data);
          fetchDashboardData();
        };

        socket.onclose = () => {
          setWsConnected(false);
          console.log("[WS] Connection lost, retrying in 5 seconds...");
          reconnectTimeout = setTimeout(connectWebSocket, 5000);
        };

        socket.onerror = (err) => {
          setWsConnected(false);
          socket?.close();
        };
      } catch (err) {
        setWsConnected(false);
        reconnectTimeout = setTimeout(connectWebSocket, 5000);
      }
    };

    connectWebSocket();

    // Set up polling interval in case WS fails or is disconnected
    const pollingInterval = setInterval(() => {
      if (!socket || socket.readyState !== WebSocket.OPEN) {
        fetchDashboardData();
      }
    }, 8000);

    return () => {
      clearInterval(pollingInterval);
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (socket) {
        socket.onopen = null;
        socket.onmessage = null;
        socket.onerror = null;
        socket.onclose = null;
        socket.close();
      }
      wsRef.current = null;
    };
  }, [isDemoMode]);

  // Handle Threat Hunt console query
  const handleHunt = async (queryStr: string) => {
    setSearchQuery(queryStr);
    if (!queryStr.trim()) {
      setSearchResult(null);
      return;
    }

    if (!backendOnline) {
      // In-memory mock search fallback
      setHunting(true);
      setTimeout(() => {
        const queryLower = queryStr.toLowerCase();
        const filtered = data.alerts.filter(
          (a) =>
            a.alert_type.toLowerCase().includes(queryLower) ||
            a.description.toLowerCase().includes(queryLower) ||
            a.username.toLowerCase().includes(queryLower) ||
            a.source_ip.toLowerCase().includes(queryLower) ||
            a.severity.toLowerCase().includes(queryLower)
        );
        setSearchResult(filtered);
        setHunting(false);
      }, 300);
      return;
    }

    setHunting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/hunt/query?q=${encodeURIComponent(queryStr)}`);
      if (res.ok) {
        const payload = await res.json();
        setSearchResult(payload.results || []);
      } else {
        setSearchResult([]);
      }
    } catch (err) {
      console.error("Hunt query request failed", err);
      setSearchResult([]);
    } finally {
      setHunting(false);
    }
  };

  // Download Winlogbeat yml config file
  const handleDownloadConnector = async () => {
    setDownloading(true);
    try {
      const url = backendOnline
        ? `${API_BASE_URL}/api/v1/connector/winlogbeat.yml`
        : "data:text/yaml;charset=utf-8," + encodeURIComponent("winlogbeat:\n  output.elasticsearch:\n    hosts: ['localhost:9200']\n  nexora_user_id: 'demo_user'");

      const link = document.createElement("a");
      link.href = url;
      link.download = "nexora-winlogbeat-config.yml";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert("Connector download failed. Backend might be offline.");
    } finally {
      setDownloading(false);
    }
  };

  // Simulated Alert Action Handlers
  const handleBlockIP = (ip: string) => {
    window.alert(`Source IP ${ip} blocked on boundary firewalls successfully.`);
    setSelectedAlert(null);
  };

  const handleEscalateAlert = (alertObj: Alert) => {
    window.alert(`Incident escalated to Tier-2 incident handlers. Reference Ticket: INC-${Math.floor(100000 + Math.random() * 900000)}`);
    setSelectedAlert(null);
  };

  // Severity style helper mapping
  const getSeverityStyle = (severity: string) => {
    const s = String(severity).toUpperCase();
    switch (s) {
      case "HIGH":
      case "CRIT":
        return {
          badge: "bg-red-500/10 text-red-400 border border-red-500/35",
          bg: "bg-red-500",
          text: "text-red-400",
        };
      case "MEDIUM":
      case "MED":
        return {
          badge: "bg-amber-500/10 text-amber-400 border border-amber-500/35",
          bg: "bg-amber-500",
          text: "text-amber-400",
        };
      default:
        return {
          badge: "bg-blue-500/10 text-blue-400 border border-blue-500/35",
          bg: "bg-blue-500",
          text: "text-blue-400",
        };
    }
  };

  // SVG Chart calculation helpers
  const alertsToDisplay = searchResult !== null ? searchResult : data.alerts;

  // Count alert types
  const typeMap: Record<string, number> = {};
  alertsToDisplay.forEach((a) => {
    const t = a.alert_type || "unknown";
    typeMap[t] = (typeMap[t] || 0) + 1;
  });
  const typeLabels = Object.keys(typeMap);
  const typeCounts = Object.values(typeMap);
  const maxTypeCount = typeCounts.length > 0 ? Math.max(...typeCounts) : 1;

  // Count severities
  const highCount = alertsToDisplay.filter((a) => ["HIGH", "CRIT"].includes(a.severity.toUpperCase())).length;
  const medCount = alertsToDisplay.filter((a) => ["MEDIUM", "MED"].includes(a.severity.toUpperCase())).length;
  const lowCount = alertsToDisplay.filter((a) => ["LOW"].includes(a.severity.toUpperCase())).length;
  const totalSeverityCount = highCount + medCount + lowCount || 1;

  // Custom SVG doughnut calculations
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const highOffset = circumference - (highCount / totalSeverityCount) * circumference;
  const medOffset = circumference - (medCount / totalSeverityCount) * circumference;
  const lowOffset = circumference - (lowCount / totalSeverityCount) * circumference;

  return (
    <div className="min-h-screen bg-black text-white font-body py-10 selection:bg-white selection:text-black">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">

        {/* Navigation Breadcrumb */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 pb-6 border-b border-outline-variant">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link href="/" className="font-mono text-xs tracking-widest text-white/50 hover:text-white transition-colors uppercase">
                &larr; BACK TO PLATFORM
              </Link>
            </div>
            <h1 className="font-mono text-2xl md:text-3xl font-light tracking-wide uppercase flex items-center gap-4">
              NEXORA SIEM <span className="text-white/20">/</span> SOC DASHBOARD
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Audio alarm sound toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              id="btn-sound-toggle"
              className={`p-2 rounded border border-outline-variant hover:border-outline transition-colors ${soundEnabled ? "text-primary bg-white/5" : "text-white/35"
                }`}
              title="Toggle Audio Alarm Trigger"
            >
              {soundEnabled ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M12 18.75V5.25L7.75 9.5H4.5v5h3.25L12 18.75z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
              )}
            </button>

            {/* Ingestion Agent Config Downloader */}
            <button
              id="btn-download-config"
              onClick={handleDownloadConnector}
              disabled={downloading}
              className="px-4 py-2 bg-white text-black font-mono text-xs tracking-wider font-semibold rounded hover:bg-white/90 transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              {downloading ? "GENERATING..." : "DOWNLOAD WINLOGBEAT CONFIG"}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>

            {/* Demo mode / Live cloud toggle */}
            <button
              onClick={() => {
                if (isDemoMode) {
                  setIsDemoMode(false);
                  // Trigger immediate fetch
                  setTimeout(fetchDashboardData, 50);
                } else {
                  setIsDemoMode(true);
                  setData(MOCK_DASHBOARD_DATA);
                }
              }}
              className={`px-4 py-2 border rounded font-mono text-xs transition-colors cursor-pointer ${isDemoMode
                  ? "bg-white text-black border-transparent"
                  : "bg-white/5 text-white/60 border-outline-variant hover:border-outline"
                }`}
            >
              {isDemoMode ? "MODE: DEMO DATA" : "MODE: LIVE CLOUD"}
            </button>

            {/* Connection Status Indicator */}
            <div
              id="status-indicator"
              className={`flex items-center gap-2.5 px-4 py-2 border rounded font-mono text-xs ${backendOnline
                  ? "bg-emerald-500/5 text-emerald-400 border-emerald-500/20"
                  : "bg-amber-500/5 text-amber-400 border-amber-500/20"
                }`}
            >
              <span className={`w-2 h-2 rounded-full relative flex`}>
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${backendOnline ? "bg-emerald-400" : "bg-amber-400"
                  }`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${backendOnline ? "bg-emerald-500" : "bg-amber-500"
                  }`}></span>
              </span>
              {backendOnline ? (wsConnected ? "SOC_TUNNEL: ONLINE" : "REST_API: CONNECTED") : "DEMO_MODE: OFFLINE"}
            </div>
          </div>
        </header>

        {/* Section 1: KPI Statistics Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">

          <div className="monolith-card p-6 flex flex-col justify-between min-h-[120px]">
            <p className="font-mono text-xs text-white/40 tracking-widest uppercase">Total Alerts</p>
            <div className="flex items-baseline justify-between mt-4">
              <span className="font-heading text-3xl font-semibold">{alertsToDisplay.length}</span>
              <span className="text-[10px] font-mono text-rose-400 px-2 py-0.5 bg-rose-500/10 border border-rose-500/20">THREATS_LOGGED</span>
            </div>
          </div>

          <div className="monolith-card p-6 flex flex-col justify-between min-h-[120px]">
            <p className="font-mono text-xs text-white/40 tracking-widest uppercase">Correlated Incidents</p>
            <div className="flex items-baseline justify-between mt-4">
              <span className="font-heading text-3xl font-semibold">{data.attack_chains.length}</span>
              <span className="text-[10px] font-mono text-white/40">ATTACK_CHAINS</span>
            </div>
          </div>

          <div className="monolith-card p-6 flex flex-col justify-between min-h-[120px]">
            <p className="font-mono text-xs text-white/40 tracking-widest uppercase">ML Threat Assessment</p>
            <div className="flex items-center justify-between mt-4">
              <div>
                <span className="font-heading text-3xl font-semibold uppercase block leading-none">
                  {data.ml_analysis?.prediction || "benign"}
                </span>
                <span className="text-[10px] font-mono text-white/40 mt-1 block">
                  {data.ml_analysis ? `${data.ml_analysis.confidence}% confidence` : "no_analysis"}
                </span>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 border ${(data.ml_analysis?.prediction === "malicious")
                  ? "text-red-400 bg-red-500/10 border-red-500/25"
                  : "text-blue-400 bg-blue-500/10 border-blue-500/25"
                }`}>
                {(data.ml_analysis?.prediction === "malicious") ? "THREAT_FOUND" : "SYSTEM_SAFE"}
              </span>
            </div>
          </div>

          <div className="monolith-card p-6 flex flex-col justify-between min-h-[120px]">
            <p className="font-mono text-xs text-white/40 tracking-widest uppercase">SOC Health Index</p>
            <div className="mt-4">
              <div className="flex items-baseline justify-between mb-2">
                <span className="font-heading text-3xl font-semibold">
                  {data.metrics ? `${data.metrics.soc_health_score}%` : "100.0%"}
                </span>
                <span className="text-[10px] font-mono text-white/40">RISK_MITIGATED</span>
              </div>
              <div className="w-full h-1 bg-outline-variant rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-1000"
                  style={{ width: `${data.metrics ? data.metrics.soc_health_score : 100}%` }}
                />
              </div>
            </div>
          </div>

        </section>

        {/* Section 2: Visual Threat Analysis (SVG Charts) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">

          {/* Doughnut Chart: Severity Distribution */}
          <div className="lg:col-span-5 monolith-card p-6">
            <h2 className="font-mono text-xs font-semibold tracking-wider text-white/50 mb-6 uppercase">Severity Distribution</h2>
            <div className="flex flex-col sm:flex-row items-center justify-around gap-8">

              <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                  {/* Base track */}
                  <circle cx="60" cy="60" r={radius} fill="transparent" stroke="#262626" strokeWidth="12" />

                  {/* High severity segment */}
                  {highCount > 0 && (
                    <circle
                      cx="60"
                      cy="60"
                      r={radius}
                      fill="transparent"
                      stroke="#f87171"
                      strokeWidth="12"
                      strokeDasharray={circumference}
                      strokeDashoffset={highOffset}
                      className="transition-all duration-1000"
                    />
                  )}

                  {/* Medium severity segment */}
                  {medCount > 0 && (
                    <circle
                      cx="60"
                      cy="60"
                      r={radius}
                      fill="transparent"
                      stroke="#fbbf24"
                      strokeWidth="12"
                      strokeDasharray={`${(medCount / totalSeverityCount) * circumference} ${circumference}`}
                      strokeDashoffset={-((highCount / totalSeverityCount) * circumference)}
                      className="transition-all duration-1000"
                    />
                  )}

                  {/* Low severity segment */}
                  {lowCount > 0 && (
                    <circle
                      cx="60"
                      cy="60"
                      r={radius}
                      fill="transparent"
                      stroke="#60a5fa"
                      strokeWidth="12"
                      strokeDasharray={`${(lowCount / totalSeverityCount) * circumference} ${circumference}`}
                      strokeDashoffset={-(((highCount + medCount) / totalSeverityCount) * circumference)}
                      className="transition-all duration-1000"
                    />
                  )}
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="font-heading text-2xl font-bold">{alertsToDisplay.length}</span>
                  <span className="font-mono text-[9px] text-white/30 uppercase tracking-widest">ALERTS</span>
                </div>
              </div>

              {/* Legends */}
              <div className="space-y-4 font-mono text-xs w-full sm:w-auto">
                <div className="flex items-center justify-between gap-6">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-red-400" />
                    <span className="text-white/60">HIGH</span>
                  </div>
                  <span className="font-bold">{highCount}</span>
                </div>
                <div className="flex items-center justify-between gap-6">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-amber-400" />
                    <span className="text-white/60">MEDIUM</span>
                  </div>
                  <span className="font-bold">{medCount}</span>
                </div>
                <div className="flex items-center justify-between gap-6">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-blue-400" />
                    <span className="text-white/60">LOW</span>
                  </div>
                  <span className="font-bold">{lowCount}</span>
                </div>
              </div>

            </div>
          </div>

          {/* Bar Chart: Alert Type Distribution */}
          <div className="lg:col-span-7 monolith-card p-6">
            <h2 className="font-mono text-xs font-semibold tracking-wider text-white/50 mb-6 uppercase">Alert Type Occurrence</h2>
            <div className="space-y-4 font-mono text-xs">
              {typeLabels.length === 0 ? (
                <div className="h-32 flex items-center justify-center text-white/30">No active alerts mapped.</div>
              ) : (
                typeLabels.map((label, idx) => {
                  const count = typeCounts[idx];
                  const percentage = (count / maxTypeCount) * 100;
                  return (
                    <div key={label} className="space-y-1.5">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-white/70 uppercase tracking-wider">{label.replace(/_/g, " ")}</span>
                        <span className="font-bold text-white/40">{count} occurrences</span>
                      </div>
                      <div className="w-full h-2 bg-outline-variant overflow-hidden">
                        <div
                          className="h-full bg-white transition-all duration-1000"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </section>

        {/* Section 3: Threat Hunt Console */}
        <section className="monolith-card p-6 mb-10">
          <h2 className="font-mono text-xs font-semibold tracking-wider text-white/50 mb-4 uppercase">Threat Hunt Console</h2>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <input
                id="hunt-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => handleHunt(e.target.value)}
                placeholder="Query parameters (e.g. source IP, username, alert_type, severity)..."
                className="w-full bg-black border border-outline-variant hover:border-outline focus:border-white focus:outline-none px-4 py-3 rounded font-mono text-xs tracking-wider transition-colors placeholder:text-white/20"
              />
              {searchQuery && (
                <button
                  onClick={() => handleHunt("")}
                  className="absolute right-3 top-3.5 text-white/40 hover:text-white font-mono text-[10px]"
                >
                  CLEAR
                </button>
              )}
            </div>

            {/* Quick pre-defined hunts */}
            <div className="flex flex-wrap gap-2.5 items-center">
              <button
                onClick={() => handleHunt("brute_force")}
                className="px-3.5 py-2.5 bg-white/5 hover:bg-white/10 border border-outline-variant rounded font-mono text-[10px] tracking-wider transition-colors uppercase"
              >
                Brute Force
              </button>
              <button
                onClick={() => handleHunt("sudo")}
                className="px-3.5 py-2.5 bg-white/5 hover:bg-white/10 border border-outline-variant rounded font-mono text-[10px] tracking-wider transition-colors uppercase"
              >
                Sudo Activity
              </button>
              <button
                onClick={() => handleHunt("invalid")}
                className="px-3.5 py-2.5 bg-white/5 hover:bg-white/10 border border-outline-variant rounded font-mono text-[10px] tracking-wider transition-colors uppercase"
              >
                Invalid Users
              </button>
              <button
                onClick={() => handleHunt("high")}
                className="px-3.5 py-2.5 bg-red-950/20 hover:bg-red-950/40 text-red-400 border border-red-500/20 rounded font-mono text-[10px] tracking-wider transition-colors uppercase"
              >
                High Severity
              </button>
            </div>
          </div>

          {hunting && (
            <div className="text-xs font-mono text-white/40 animate-pulse">Running advanced heuristics, scanning indices...</div>
          )}
        </section>

        {/* Section 4: Main Console Logs Stream & Correlation Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch lg:min-h-[400px]">

          {/* Recent Alerts Feed Table */}
          <div className="lg:col-span-8 lg:relative h-[600px] lg:h-auto">
            <div className="lg:absolute lg:inset-0 monolith-card p-6 overflow-hidden flex flex-col h-full w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-mono text-xs font-semibold tracking-wider text-white/50 uppercase">
                {searchResult !== null ? "Threat Search Results" : "Recent Threat Feed"}
              </h2>
              {searchResult !== null && (
                <button
                  onClick={() => setSearchResult(null)}
                  className="font-mono text-[10px] text-white/40 hover:text-white"
                >
                  RESET VIEW
                </button>
              )}
            </div>

            <div className="overflow-auto flex-1 hide-scrollbar">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-outline-variant pb-2 text-white/35">
                    <th className="py-3 font-normal">TIMESTAMP</th>
                    <th className="py-3 font-normal">ALERT TYPE</th>
                    <th className="py-3 font-normal">SEVERITY</th>
                    <th className="py-3 font-normal">SOURCE IP</th>
                    <th className="py-3 font-normal">USER</th>
                    <th className="py-3 font-normal text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {alertsToDisplay.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-white/30">
                        No logs or matching alert patterns found in cache database.
                      </td>
                    </tr>
                  ) : (
                    alertsToDisplay.map((alert, idx) => {
                      const { badge } = getSeverityStyle(alert.severity);
                      return (
                        <tr key={idx} className="hover:bg-white/5 transition-colors group">
                          <td className="py-3.5 text-white/60">{alert.timestamp}</td>
                          <td className="py-3.5 font-semibold text-white/95 uppercase tracking-wide">
                            {alert.alert_type.replace(/_/g, " ")}
                          </td>
                          <td className="py-3.5">
                            <span className={`px-2 py-0.5 text-[10px] font-bold tracking-wide ${badge}`}>
                              {alert.severity}
                            </span>
                          </td>
                          <td className="py-3.5 text-white/65">{alert.source_ip}</td>
                          <td className="py-3.5 text-white/65">{alert.username}</td>
                          <td className="py-3.5 text-right">
                            <button
                              onClick={() => setSelectedAlert(alert)}
                              className="px-2.5 py-1 bg-white/5 group-hover:bg-white text-white/70 group-hover:text-black border border-outline-variant group-hover:border-transparent rounded text-[10px] tracking-wider transition-all"
                            >
                              INVESTIGATE
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
          </div>

          {/* Right Sidebar: Correlated Incidents & Attack Chains */}
          <div className="lg:col-span-4 space-y-8">

            {/* Correlation chains */}
            <div className="monolith-card p-6">
              <h2 className="font-mono text-xs font-semibold tracking-wider text-white/50 mb-6 uppercase">Correlated Attack Chains</h2>
              {data.attack_chains.length === 0 ? (
                <div className="text-xs font-mono text-white/30 text-center py-6">No attack patterns aggregated.</div>
              ) : (
                <div className="space-y-6">
                  {data.attack_chains.map((chain, idx) => {
                    const style = getSeverityStyle(chain.severity);
                    return (
                      <div key={idx} className="p-4 border border-outline-variant bg-white/[0.02] rounded relative">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">{chain.chain_type.replace(/_/g, " ")}</h3>
                          <span className={`px-1.5 py-0.5 text-[9px] font-bold tracking-wide ${style.badge}`}>{chain.severity}</span>
                        </div>
                        <p className="font-sans text-xs text-white/60 mb-3">{chain.description}</p>

                        {/* Event Flow arrows */}
                        <div className="flex flex-wrap items-center gap-2 font-mono text-[9px] text-white/40">
                          {chain.events.map((e, eIdx) => (
                            <React.Fragment key={eIdx}>
                              <span className="px-1.5 py-0.5 bg-white/5 border border-outline-variant text-white/70 font-semibold">{e}</span>
                              {eIdx < chain.events.length - 1 && <span>➔</span>}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* MITRE ATT&CK Framework Map */}
            <div className="monolith-card p-6">
              <h2 className="font-mono text-xs font-semibold tracking-wider text-white/50 mb-6 uppercase">MITRE ATT&CK Mapping</h2>
              <div className="space-y-4">
                {alertsToDisplay.slice(0, 3).map((a, idx) => {
                  if (!a.mitre_attack) return null;
                  return (
                    <div key={idx} className="flex gap-4 items-start border-l-2 border-white/20 pl-4 py-1">
                      <div className="font-mono text-xs">
                        <span className="font-bold text-white/80 uppercase block tracking-wider">
                          {a.mitre_attack.technique}
                        </span>
                        <span className="text-[10px] text-white/40 mt-0.5 block font-normal">
                          {a.mitre_attack.technique_id} &bull; Tactic: {a.mitre_attack.tactic}
                        </span>
                      </div>
                    </div>
                  );
                })}
                {alertsToDisplay.filter((a) => a.mitre_attack).length === 0 && (
                  <div className="text-xs font-mono text-white/30 text-center py-4">No active threat mapped.</div>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Section 5: Raw System Events (Log Stream) */}
        <section className="monolith-card p-6 mt-10">
          <h2 className="font-mono text-xs font-semibold tracking-wider text-white/50 mb-6 uppercase">
            Raw System Events (Log Stream)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-outline-variant pb-2 text-white/35">
                  <th className="py-3 font-normal">TIMESTAMP</th>
                  <th className="py-3 font-normal">EVENT TYPE</th>
                  <th className="py-3 font-normal">USERNAME</th>
                  <th className="py-3 font-normal">SOURCE IP</th>
                  <th className="py-3 font-normal">MESSAGE / DESCRIPTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {(!data.raw_events || data.raw_events.length === 0) ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-white/30">
                      No raw system events found in cache database.
                    </td>
                  </tr>
                ) : (
                  data.raw_events.slice(0, 5).map((event, idx) => (
                    <tr key={idx} className="hover:bg-white/5 transition-colors group">
                      <td className="py-3.5 text-white/60 whitespace-nowrap">{event.timestamp}</td>
                      <td className="py-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider bg-white/5 text-white/70 border border-outline-variant uppercase">
                          {event.event_type}
                        </span>
                      </td>
                      <td className="py-3.5 text-white/65">{event.username}</td>
                      <td className="py-3.5 text-white/65">{event.source_ip}</td>
                      <td
                        className="py-3.5 text-white/60 max-w-[400px] truncate"
                        title={event.message}
                      >
                        {event.message}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {data.raw_events && data.raw_events.length > 5 && (
            <div className="mt-6 flex justify-center">
              <Link href="/event-logs" className="px-6 py-2 border border-outline-variant rounded font-mono text-xs hover:bg-white/5 transition-colors uppercase text-white/70 hover:text-white">
                Load More Events
              </Link>
            </div>
          )}
        </section>

      </div>

      {/* Investigation Details Drawer (Modal) */}
      <AnimatePresence>
        {selectedAlert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-end"
            onClick={() => setSelectedAlert(null)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.35 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md h-full bg-[#0a0a0a] border-l border-outline-variant p-8 overflow-y-auto flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center mb-8 pb-4 border-b border-outline-variant">
                  <span className="font-mono text-xs text-white/40 tracking-widest uppercase">INVESTIGATOR CONSOLE</span>
                  <button onClick={() => setSelectedAlert(null)} className="font-mono text-xs text-white/40 hover:text-white">CLOSE</button>
                </div>

                <div className="space-y-6">
                  <div>
                    <span className="font-mono text-[9px] text-white/40 tracking-wider block mb-1 uppercase">Threat Classification</span>
                    <h3 className="font-heading text-xl font-bold uppercase text-white tracking-wide">{selectedAlert.alert_type.replace(/_/g, " ")}</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-white/[0.02] border border-outline-variant">
                      <span className="font-mono text-[9px] text-white/40 block mb-1 uppercase">Severity Rating</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${getSeverityStyle(selectedAlert.severity).badge}`}>
                        {selectedAlert.severity}
                      </span>
                    </div>
                    <div className="p-3 bg-white/[0.02] border border-outline-variant">
                      <span className="font-mono text-[9px] text-white/40 block mb-1 uppercase">System Risk Score</span>
                      <span className="font-mono text-sm font-bold text-white">{selectedAlert.risk_score} / 100</span>
                    </div>
                  </div>

                  <div className="p-4 bg-white/[0.01] border border-outline-variant rounded font-mono text-xs space-y-3">
                    <div>
                      <span className="text-white/40 block text-[9px] uppercase">Incident Timestamp</span>
                      <span className="text-white/80">{selectedAlert.timestamp}</span>
                    </div>
                    <div>
                      <span className="text-white/40 block text-[9px] uppercase">Source Network IP</span>
                      <span className="text-white/80">{selectedAlert.source_ip}</span>
                    </div>
                    <div>
                      <span className="text-white/40 block text-[9px] uppercase">Associated User Principal</span>
                      <span className="text-white/80">{selectedAlert.username}</span>
                    </div>
                    <div>
                      <span className="text-white/40 block text-[9px] uppercase">Event Trigger Count</span>
                      <span className="text-white/80">{selectedAlert.event_count} telemetry lines matching pattern</span>
                    </div>
                  </div>

                  {selectedAlert.mitre_attack && (
                    <div className="p-4 border border-outline-variant bg-white/[0.02]">
                      <span className="font-mono text-[9px] text-white/40 block mb-2 uppercase">MITRE ATT&CK Alignment</span>
                      <div className="font-mono text-xs space-y-1.5">
                        <p className="font-bold text-white/85">{selectedAlert.mitre_attack.technique}</p>
                        <p className="text-[10px] text-white/50">ID: {selectedAlert.mitre_attack.technique_id}</p>
                        <p className="text-[10px] text-white/50">Tactic Category: {selectedAlert.mitre_attack.tactic}</p>
                      </div>
                    </div>
                  )}

                  <div>
                    <span className="font-mono text-[9px] text-white/40 tracking-wider block mb-1.5 uppercase">Telemetry Pattern Description</span>
                    <p className="font-sans text-xs text-white/70 leading-relaxed">{selectedAlert.description}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-10 space-y-3 pt-6 border-t border-outline-variant">
                <button
                  onClick={() => handleBlockIP(selectedAlert.source_ip)}
                  className="w-full py-2.5 bg-red-950/20 hover:bg-red-950/40 text-red-400 border border-red-500/20 hover:border-red-500/40 font-mono text-xs tracking-wider transition-colors cursor-pointer"
                >
                  BLOCK SOURCE IP
                </button>
                <button
                  onClick={() => handleEscalateAlert(selectedAlert)}
                  className="w-full py-2.5 bg-white/5 hover:bg-white text-white hover:text-black border border-outline-variant hover:border-transparent font-mono text-xs tracking-wider transition-colors cursor-pointer"
                >
                  ESCALATE INCIDENT (TIER 2)
                </button>
                <button
                  onClick={() => setSelectedAlert(null)}
                  className="w-full py-2.5 hover:bg-white/5 text-white/40 hover:text-white font-mono text-xs tracking-wider transition-colors cursor-pointer text-center"
                >
                  DISMISS INVESTIGATION
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
