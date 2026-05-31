import RevealWrapper from "@/components/ui/RevealWrapper";

export default function FinalCTA() {
  return (
    <section className="py-32 bg-background border-t border-outline-variant relative">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop text-center">
        <RevealWrapper>
          <h2 className="type-headline-lg-mobile md:type-display-lg mb-6 tracking-tighter">
            MONITOR. CORRELATE. DETECT.
          </h2>
          <p className="type-body-lg text-on-surface-variant max-w-2xl mx-auto mb-12">
            Transform raw endpoint telemetry into actionable security
            intelligence. Secure your infrastructure with the next generation
            of cloud-native SIEM.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <button className="px-12 py-5 bg-primary text-background type-telemetry-sm font-bold uppercase tracking-[0.2em] hover:opacity-90 transition-all">
              GET STARTED
            </button>
            <button className="px-12 py-5 border border-outline-variant text-primary type-telemetry-sm font-bold uppercase tracking-[0.2em] hover:border-on-surface transition-all">
              OPEN DASHBOARD
            </button>
          </div>
        </RevealWrapper>
      </div>
    </section>
  );
}
