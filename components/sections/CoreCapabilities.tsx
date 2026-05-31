import CapabilityCard from "@/components/ui/CapabilityCard";
import { capabilities } from "@/data/capabilities";

export default function CoreCapabilities() {
  return (
    <section className="py-stack-xl bg-background">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {capabilities.map((cap, i) => (
            <CapabilityCard key={cap.id} capability={cap} delay={i * 100} />
          ))}
        </div>
      </div>
    </section>
  );
}
