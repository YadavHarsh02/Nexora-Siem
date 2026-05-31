import RevealWrapper from "@/components/ui/RevealWrapper";
import AlertRow from "@/components/ui/AlertRow";
import { recentAlerts } from "@/data/alerts";

interface MetricBarProps {
  label: string;
  value: string;
  fillClass: string;
  fillWidth: string;
}

function MetricBar({ label, value, fillClass, fillWidth }: MetricBarProps) {
  return (
    <div>
      <p className="type-telemetry-sm text-on-surface-variant uppercase mb-2">
        {label}
      </p>
      <p className="type-headline-md">{value}</p>
      <div className="w-full h-1 bg-outline-variant mt-2">
        <div className={`h-full ${fillClass} ${fillWidth}`} />
      </div>
    </div>
  );
}

export default function LiveDetectionEngine() {
  return (
    <section className="py-stack-xl bg-background relative overflow-hidden">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        <RevealWrapper className="monolith-card p-1">
          <div className="bg-black border border-outline-variant p-6 md:p-10">
            {/* Top bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b border-outline-variant pb-8">
              <div>
                <p className="type-telemetry-sm text-primary mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-error animate-pulse inline-block" />
                  LIVE THREAT FEED
                </p>
                <h3 className="type-headline-sm">SIEM COMMAND CENTER</h3>
              </div>
              <div className="flex gap-4">
                <span className="px-4 py-2 bg-surface-container border border-outline-variant type-telemetry-sm">
                  SYSTEM_READY
                </span>
                <span className="px-4 py-2 bg-surface-container border border-outline-variant type-telemetry-sm">
                  SECURE_TUNNEL: ON
                </span>
              </div>
            </div>

            {/* Content grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Alert list */}
              <div className="lg:col-span-2 space-y-4">
                <p className="type-telemetry-sm text-on-surface-variant uppercase mb-4">
                  Recent Alerts
                </p>
                {recentAlerts.map((alert) => (
                  <AlertRow key={alert.id} alert={alert} />
                ))}
              </div>

              {/* Metrics */}
              <div className="space-y-8 border-l border-outline-variant pl-8">
                <MetricBar
                  label="Events Ingested Today"
                  value="14.2M"
                  fillClass="bg-primary"
                  fillWidth="w-2/3"
                />
                <MetricBar
                  label="Correlated Incidents"
                  value="248"
                  fillClass="bg-error"
                  fillWidth="w-1/4"
                />
              </div>
            </div>
          </div>
        </RevealWrapper>
      </div>
    </section>
  );
}
