import type { Capability } from "@/types";

export const capabilities: Capability[] = [
  {
    id: "endpoint-telemetry",
    icon: "terminal",
    title: "Endpoint Telemetry",
    description:
      "Capture rich kernel-level data including process creation, file system changes, and network activity.",
  },
  {
    id: "secure-data-transmission",
    icon: "vpn_lock",
    title: "Secure Data Transmission",
    description:
      "Encrypted streaming of raw telemetry into the Nexora Elasticsearch cloud cluster with zero packet loss.",
  },
  {
    id: "threat-detection",
    icon: "security",
    title: "Threat Detection",
    description:
      "Pre-configured rulesets for MITRE ATT&CK patterns and custom behavioral analysis scripts.",
  },
  {
    id: "centralized-logging",
    icon: "cloud_sync",
    title: "Centralized Logging",
    description:
      "Scalable storage for historical log data with blazing-fast search capabilities powered by Elasticsearch.",
  },
  {
    id: "realtime-monitoring",
    icon: "monitoring",
    title: "Real-Time Monitoring",
    description:
      "Live streaming dashboards that update within milliseconds of an event occurrence on the endpoint.",
  },
  {
    id: "soc-dashboard",
    icon: "dashboard_customize",
    title: "SOC Dashboard",
    description:
      "Bespoke visualizations for security teams to prioritize alerts and manage incident workflows.",
  },
];
