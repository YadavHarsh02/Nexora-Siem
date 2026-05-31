export type AlertSeverity = "HIGH" | "MED" | "CRIT";

export interface Alert {
  id: string;
  severity: AlertSeverity;
  message: string;
  source: string;
}

export interface Capability {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export interface WorkflowStep {
  number: string;
  title: string;
  description: string;
}

export interface StatItem {
  label: string;
  value: string;
  borderLeft?: boolean;
}

export interface NavLink {
  label: string;
  href: string;
  active?: boolean;
}
