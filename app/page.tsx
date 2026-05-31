import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/sections/HeroSection";
import GlobalTelemetry from "@/components/sections/GlobalTelemetry";
import WorkflowSection from "@/components/sections/WorkflowSection";
import LiveDetectionEngine from "@/components/sections/LiveDetectionEngine";
import ArchitectureDiagram from "@/components/sections/ArchitectureDiagram";
import CoreCapabilities from "@/components/sections/CoreCapabilities";
import FinalCTA from "@/components/sections/FinalCTA";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <GlobalTelemetry />
        <WorkflowSection />
        <LiveDetectionEngine />
        <ArchitectureDiagram />
        <CoreCapabilities />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
