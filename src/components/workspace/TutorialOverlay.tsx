import { Button } from "@/components/ui/button";

interface Step { title: string; desc: string; }

interface Props {
  steps: Step[];
  currentStep: number;
  setCurrentStep: (s: number) => void;
  onDismiss: () => void;
}

const TutorialOverlay = ({ steps, currentStep, setCurrentStep, onDismiss }: Props) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-sm">
    <div className="mx-4 max-w-md rounded-2xl border border-border bg-card p-8 text-center">
      <h2 className="font-display text-xl font-bold text-foreground">{steps[currentStep].title}</h2>
      <p className="mt-3 text-sm text-muted-foreground">{steps[currentStep].desc}</p>
      <div className="mt-6 flex items-center justify-between">
        <button onClick={onDismiss} className="text-sm text-muted-foreground hover:text-foreground">Skip</button>
        <div className="flex gap-1">{steps.map((_, i) => <div key={i} className={`h-1.5 w-6 rounded-full ${i === currentStep ? "bg-primary" : "bg-border"}`} />)}</div>
        {currentStep < steps.length - 1
          ? <Button size="sm" onClick={() => setCurrentStep(currentStep + 1)}>Next</Button>
          : <Button size="sm" onClick={onDismiss}>Get Started</Button>}
      </div>
    </div>
  </div>
);

export default TutorialOverlay;
