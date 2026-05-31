import type { Alert } from "@/types";

export const recentAlerts: Alert[] = [
  {
    id: "alert-1",
    severity: "HIGH",
    message: "Encoded PowerShell Execution",
    source: "10.0.0.45",
  },
  {
    id: "alert-2",
    severity: "MED",
    message: "Multiple Failed Auth Attempts",
    source: "192.168.1.12",
  },
  {
    id: "alert-3",
    severity: "CRIT",
    message: "Suspicious Process Spawn (cmd.exe)",
    source: "SEC-ADMIN-01",
  },
];
