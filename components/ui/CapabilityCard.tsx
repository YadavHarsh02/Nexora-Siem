import type { Capability } from "@/types";
import RevealWrapper from "./RevealWrapper";
import DandelionVisual from "./DandelionVisual";

interface CapabilityCardProps {
  capability: Capability;
  delay?: number;
}

export default function CapabilityCard({
  capability,
  delay = 0,
}: CapabilityCardProps) {
  const isSecureTransmission = capability.id === "secure-data-transmission";

  return (
    <RevealWrapper delay={delay} className="monolith-card p-8">
      {isSecureTransmission ? (
        <div className="w-full h-32 mb-6 relative overflow-hidden flex items-center justify-center border border-outline-variant/30 bg-black/40 rounded">
          <DandelionVisual />
        </div>
      ) : (
        <span className="material-symbols-outlined text-primary text-3xl mb-6 block">
          {capability.icon}
        </span>
      )}
      <h4 className="type-headline-sm mb-4">{capability.title}</h4>
      <p className="text-on-surface-variant type-body-md">
        {capability.description}
      </p>
    </RevealWrapper>
  );
}
