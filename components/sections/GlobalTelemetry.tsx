import Image from "next/image";
import RevealWrapper from "@/components/ui/RevealWrapper";

export default function GlobalTelemetry() {
  return (
    <section className="py-stack-xl bg-background overflow-hidden">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop grid grid-cols-1 lg:grid-cols-2 items-center gap-16">
        {/* Globe */}
        <RevealWrapper className="order-2 lg:order-1">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuB4ZRlIoSnyxNBEcVJddSJAATQeuRj0jDwz-4qTMxeS9VhKMgVrsT6dNoftfwEVtU72-ptYXdOL9314fZEQx4MVTqY5RtFIHDZvP3xZD-T41tUxar16ziHRzaWH3NukNh0loNdM807ix_qc60ylIq3eufvRu2Q8TTh8Uozofy0TrPgVJbl6VPHbppARpSnVjtCYPNJfJchGfjdeoTkXMqTcXwLAe2U2b_HosdcTc-JMPfIClk-XQZnLk-gloyqNmP7tRUGeEVJHxw"
            alt="A large rotating wireframe globe showing global connections"
            width={1200}
            height={900}
            className="w-full h-auto max-w-2xl mx-auto filter brightness-90 contrast-125"
          />
        </RevealWrapper>

        {/* Copy */}
        <RevealWrapper delay={200} className="order-1 lg:order-2">
          <p className="type-telemetry-sm text-on-surface-variant uppercase tracking-[0.3em] mb-4">
            GLOBAL NETWORK
          </p>
          <h2 className="type-headline-md mb-6">CENTRALIZED SECURITY VISIBILITY</h2>
          <p className="type-body-lg text-on-surface-variant mb-8">
            Monitor endpoint activity through a centralized cloud pipeline
            designed for real-time telemetry ingestion and threat analysis
            across disparate regions and networks.
          </p>
          <div className="grid grid-cols-2 gap-8 border-t border-outline-variant pt-8">
            <div>
              <p className="type-headline-sm font-bold">142ms</p>
              <p className="type-telemetry-sm text-on-surface-variant uppercase mt-1">
                Avg Detection Latency
              </p>
            </div>
            <div>
              <p className="type-headline-sm font-bold">42</p>
              <p className="type-telemetry-sm text-on-surface-variant uppercase mt-1">
                Data Centers
              </p>
            </div>
          </div>
        </RevealWrapper>
      </div>
    </section>
  );
}
