"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface RawEvent {
  timestamp: string;
  event_type: string;
  username: string;
  source_ip: string;
  message: string;
}

const MOCK_RAW_EVENTS: RawEvent[] = [
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
];

// Add some more mock events to demonstrate a longer list
for (let i = 0; i < 25; i++) {
  MOCK_RAW_EVENTS.push({
    timestamp: new Date(Date.now() - i * 15000).toISOString(),
    event_type: "windows_event",
    username: "SYSTEM",
    source_ip: "127.0.0.1",
    message: `System background activity trace ${i}`
  });
}

const API_BASE_URL = "http://127.0.0.1:8000";
const WS_BASE_URL = "ws://127.0.0.1:8000";

export default function EventLogs() {
  const [events, setEvents] = useState<RawEvent[]>(MOCK_RAW_EVENTS);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [backendOnline, setBackendOnline] = useState<boolean>(false);

  const fetchLogs = async () => {
    if (isDemoMode) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/live/dashboard`);
      if (res.ok) {
        const payload = await res.json();
        setBackendOnline(true);
        if (payload.raw_events) {
          setEvents(payload.raw_events);
        }
      } else {
        setBackendOnline(false);
        setEvents(MOCK_RAW_EVENTS);
      }
    } catch (err) {
      console.warn("Backend API offline, using Demo Mode", err);
      setBackendOnline(false);
      setEvents(MOCK_RAW_EVENTS);
    }
  };

  useEffect(() => {
    if (isDemoMode) {
      setEvents(MOCK_RAW_EVENTS);
      return;
    }

    fetchLogs();

    let socket: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;

    const connectWebSocket = () => {
      if (isDemoMode) return;
      try {
        socket = new WebSocket(`${WS_BASE_URL}/ws/live-alerts`);

        socket.onopen = () => {
          setBackendOnline(true);
          socket?.send("frontend_connected");
        };

        socket.onmessage = () => {
          // Refresh logs when new alerts/events arrive
          fetchLogs();
        };

        socket.onclose = () => {
          reconnectTimeout = setTimeout(connectWebSocket, 5000);
        };

        socket.onerror = () => {
          socket?.close();
        };
      } catch (err) {
        reconnectTimeout = setTimeout(connectWebSocket, 5000);
      }
    };

    connectWebSocket();

    // Polling fallback
    const pollingInterval = setInterval(() => {
      if (!socket || socket.readyState !== WebSocket.OPEN) {
        fetchLogs();
      }
    }, 8000);

    return () => {
      clearInterval(pollingInterval);
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (socket) {
        socket.onopen = null;
        socket.onmessage = null;
        socket.onerror = null;
        socket.onclose = null;
        socket.close();
      }
    };
  }, [isDemoMode]);

  return (
    <div className="min-h-screen bg-black text-white font-body py-10 selection:bg-white selection:text-black">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        
        {/* Navigation Breadcrumb */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 pb-6 border-b border-outline-variant">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link href="/dashboard" className="font-mono text-xs tracking-widest text-white/50 hover:text-white transition-colors uppercase">
                &larr; BACK TO DASHBOARD
              </Link>
            </div>
            <h1 className="font-mono text-2xl md:text-3xl font-light tracking-wide uppercase flex items-center gap-4">
              NEXORA SIEM <span className="text-white/20">/</span> FULL EVENT LOGS
            </h1>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => {
                if (isDemoMode) {
                  setIsDemoMode(false);
                  setTimeout(fetchLogs, 50);
                } else {
                  setIsDemoMode(true);
                  setEvents(MOCK_RAW_EVENTS);
                }
              }}
              className={`px-4 py-2 border rounded font-mono text-xs transition-colors cursor-pointer ${
                isDemoMode
                  ? "bg-white text-black border-transparent"
                  : "bg-white/5 text-white/60 border-outline-variant hover:border-outline"
              }`}
            >
              {isDemoMode ? "MODE: DEMO DATA" : "MODE: LIVE CLOUD"}
            </button>

            <div
              className={`flex items-center gap-2.5 px-4 py-2 border rounded font-mono text-xs ${
                backendOnline
                  ? "bg-emerald-500/5 text-emerald-400 border-emerald-500/20"
                  : "bg-amber-500/5 text-amber-400 border-amber-500/20"
              }`}
            >
              <span className={`w-2 h-2 rounded-full relative flex`}>
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  backendOnline ? "bg-emerald-400" : "bg-amber-400"
                }`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${
                  backendOnline ? "bg-emerald-500" : "bg-amber-500"
                }`}></span>
              </span>
              {backendOnline ? "REST_API: CONNECTED" : "DEMO_MODE: OFFLINE"}
            </div>
          </div>
        </header>

        <section className="monolith-card p-6">
          <h2 className="font-mono text-xs font-semibold tracking-wider text-white/50 mb-6 uppercase">
            Raw System Events (Log Stream) - Full History
          </h2>
          <div className="overflow-x-auto hide-scrollbar">
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
                {(!events || events.length === 0) ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-white/30">
                      No raw system events found in cache database.
                    </td>
                  </tr>
                ) : (
                  events.map((event, idx) => (
                    <tr key={idx} className="hover:bg-white/5 transition-colors group">
                      <td className="py-3.5 text-white/60 whitespace-nowrap">{event.timestamp}</td>
                      <td className="py-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider bg-white/5 text-white/70 border border-outline-variant uppercase">
                          {event.event_type}
                        </span>
                      </td>
                      <td className="py-3.5 text-white/65">{event.username}</td>
                      <td className="py-3.5 text-white/65">{event.source_ip}</td>
                      <td className="py-3.5 text-white/60">
                        {event.message}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  );
}
