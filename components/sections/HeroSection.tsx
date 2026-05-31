import Link from "next/link";
import RevealWrapper from "@/components/ui/RevealWrapper";
import StatBlock from "@/components/ui/StatBlock";
import AntigravityVisual from "@/components/ui/AntigravityVisual";

const heroStats = [
  { label: "Active Endpoints", value: "14.8K+" },
  { label: "Events Processed / Sec", value: "2.4M+" },
  { label: "Threats Correlated", value: "99.9%" },
];

export default function HeroSection() {
  return (
    <section className="relative min-h-screen pt-32 pb-10 md:pb-16 flex flex-col items-center justify-end overflow-hidden">
      {/* Interactive Antigravity background */}
      <AntigravityVisual />


      <div className="relative z-10 w-full px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Headline */}
        <RevealWrapper className="lg:col-span-8">
          <h1 className="font-mono text-[32px] md:text-[44px] lg:text-[52px] font-light leading-[1.1] tracking-tight text-white mb-6 uppercase">
            REAL-TIME ENDPOINT.
            <br />
            THREAT MONITORING.
          </h1>
          <p className="font-body text-sm md:text-base text-white/60 mb-10 max-w-lg leading-relaxed">
            Collect Windows event telemetry, stream logs into Elasticsearch,
            correlate suspicious activity, and visualize attacks through a
            SOC-style dashboard.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/dashboard" className="inline-block">
              <button className="px-8 py-3.5 bg-white text-black font-mono text-xs tracking-[0.15em] font-semibold rounded-[6px] hover:bg-white/90 transition-all active:scale-95 cursor-pointer">
                GET STARTED
              </button>
            </Link>
            <button className="px-8 py-3.5 bg-white/10 hover:bg-white/15 text-white font-mono text-xs tracking-[0.15em] font-semibold rounded-[6px] border border-white/5 transition-all active:scale-95 cursor-pointer">
              VIEW ARCHITECTURE
            </button>
          </div>
        </RevealWrapper>

        {/* Stats */}
        <RevealWrapper delay={200} className="lg:col-span-4 flex flex-col gap-10 lg:items-end lg:text-right lg:pl-16">
          {heroStats.map((stat) => (
            <StatBlock key={stat.label} {...stat} />
          ))}
        </RevealWrapper>
      </div>
    </section>
  );
}
