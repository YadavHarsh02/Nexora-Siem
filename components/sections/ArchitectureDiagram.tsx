import Image from "next/image";
import RevealWrapper from "@/components/ui/RevealWrapper";

export default function ArchitectureDiagram() {
  return (
    <section className="py-stack-xl bg-background border-t border-outline-variant">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop text-center">
        <RevealWrapper className="mb-16">
          <p className="type-telemetry-sm text-on-surface-variant uppercase tracking-[0.3em] mb-4">
            SYSTEM TOPOLOGY
          </p>
          <h2 className="type-headline-md">END-TO-END TELEMETRY PIPELINE</h2>
        </RevealWrapper>

        <RevealWrapper delay={200}>
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuC9h_U39P95kd1--EK03V7pA9H5PAwYIePTQ3vpIo_ALtBDGsg4LF0D6PD-Qs9d2HCGAGUS6cDM3GwuP3BjZETm18wAPgatVsR98n3NRMXBIpglkeZyIIa7HwOxkZDlBPHb9RCGtmvB28Qzx4ha1k6p0X0n-0e-rkqsIx-2NlhCkgYcQYmjM0EPs52YlDFtCTpN_E11wLpIdNbsg7KfoJpnG6qF6yPftZy5PsooPCbN50bXQsohYDHamTFvUyD7fSWGTJdyDNF-_Q"
            alt="Technical architecture diagram showing the data flow from Windows endpoints through Winlog forwarders to Elasticsearch cloud and the detection engine"
            width={1440}
            height={810}
            className="w-full h-auto max-w-5xl mx-auto"
          />
        </RevealWrapper>
      </div>
    </section>
  );
}
