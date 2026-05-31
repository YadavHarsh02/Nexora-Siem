import type { WorkflowStep } from "@/types";

export const workflowSteps: WorkflowStep[] = [
  {
    number: "01",
    title: "Install Winlog Forwarder",
    description:
      "Deploy lightweight agents to collect Windows event logs, authentication activity, and PowerShell telemetry directly from the kernel.",
  },
  {
    number: "02",
    title: "Forward Logs",
    description:
      "Encrypted streaming of raw telemetry into the Nexora Elasticsearch cloud cluster with zero packet loss and sub-second latency.",
  },
  {
    number: "03",
    title: "Parse & Normalize",
    description:
      "Automated translation of unstructured logs into structured ECS (Elastic Common Schema) telemetry for unified query performance.",
  },
  {
    number: "04",
    title: "Threat Correlation",
    description:
      "Heuristic analysis and behavior modeling to identify complex attack patterns, lateral movement, and privilege escalation.",
  },
  {
    number: "05",
    title: "SOC Dashboard",
    description:
      "Final visualization of attack chains, severity levels, and source IP context for rapid incident response and forensics.",
  },
];
