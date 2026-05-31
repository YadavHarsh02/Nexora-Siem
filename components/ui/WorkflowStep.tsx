import type { WorkflowStep } from "@/types";
import RevealWrapper from "./RevealWrapper";

interface WorkflowStepProps {
  step: WorkflowStep;
  isLast?: boolean;
}

export default function WorkflowStepRow({
  step,
  isLast = false,
}: WorkflowStepProps) {
  return (
    <RevealWrapper
      className={`border-t ${isLast ? "border-b" : ""} border-outline-variant py-12 flex flex-col md:grid md:grid-cols-12 gap-8`}
    >
      <div className="md:col-span-1 type-telemetry-sm text-on-surface-variant text-2xl">
        {step.number}
      </div>
      <div className="md:col-span-4 type-headline-sm uppercase tracking-tight">
        {step.title}
      </div>
      <div className="md:col-span-7 text-on-surface-variant type-body-md">
        {step.description}
      </div>
    </RevealWrapper>
  );
}
