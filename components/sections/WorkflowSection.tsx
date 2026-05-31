import RevealWrapper from "@/components/ui/RevealWrapper";
import WorkflowStepRow from "@/components/ui/WorkflowStep";
import { workflowSteps } from "@/data/workflow";

export default function WorkflowSection() {
  return (
    <section className="py-stack-xl bg-background border-y border-outline-variant">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <RevealWrapper>
            <p className="type-telemetry-sm text-on-surface-variant uppercase tracking-[0.3em] mb-4">
              SYSTEM PIPELINE
            </p>
            <h2 className="type-headline-md">HOW NEXORA WORKS</h2>
          </RevealWrapper>

          <RevealWrapper delay={100}>
            <p className="type-telemetry-md text-on-surface-variant">
              [ PIPELINE_STATUS: ACTIVE ]
            </p>
          </RevealWrapper>
        </div>

        {/* Steps */}
        <div>
          {workflowSteps.map((step, i) => (
            <WorkflowStepRow
              key={step.number}
              step={step}
              isLast={i === workflowSteps.length - 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
