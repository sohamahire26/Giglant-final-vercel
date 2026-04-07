"use client";

import { useState, useLayoutEffect, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, X, Sparkles } from "lucide-react";

export interface TourStep {
  targetId?: string;
  title: string;
  desc: string;
}

interface Props {
  steps: TourStep[];
  currentStep: number;
  onNext: () => void;
  onBack: () => void;
  onDismiss: () => void;
}

const TutorialTour = ({ steps, currentStep, onNext, onBack, onDismiss }: Props) => {
  const [coords, setCoords] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const [tipPosition, setTipPosition] = useState<"top" | "bottom">("bottom");
  const tipRef = useRef<HTMLDivElement>(null);
  const step = steps[currentStep];

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const updateCoords = () => {
    if (!step.targetId) {
      setCoords(null);
      return;
    }
    const el = document.getElementById(step.targetId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => {
        const rect = el.getBoundingClientRect();
        setCoords({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
        const isBottomHalf = rect.top + rect.height / 2 > window.innerHeight / 2;
        setTipPosition(isBottomHalf ? "top" : "bottom");
      }, 400);
    } else {
      setCoords(null);
    }
  };

  useLayoutEffect(() => {
    updateCoords();
    window.addEventListener("resize", updateCoords);
    return () => window.removeEventListener("resize", updateCoords);
  }, [currentStep, step.targetId]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <AnimatePresence>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 pointer-events-auto"
          style={{
            clipPath: coords 
              ? `polygon(0% 0%, 0% 100%, ${coords.left - 8}px 100%, ${coords.left - 8}px ${coords.top - 8}px, ${coords.left + coords.width + 8}px ${coords.top - 8}px, ${coords.left + coords.width + 8}px ${coords.top + coords.height + 8}px, ${coords.left - 8}px ${coords.top + coords.height + 8}px, ${coords.left - 8}px 100%, 100% 100%, 100% 0%)`
              : "none"
          }}
          onClick={onDismiss}
        />
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          ref={tipRef}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ 
            opacity: 1, scale: 1, y: 0, position: "fixed",
            top: coords ? (tipPosition === "bottom" ? Math.min(coords.top + coords.height + 24, window.innerHeight - 300) : "auto") : "50%",
            bottom: coords ? (tipPosition === "top" ? (window.innerHeight - coords.top) + 24 : "auto") : "auto",
            left: "50%", translateX: "-50%",
          }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="z-[101] w-[90vw] max-w-[380px] rounded-2xl border border-border bg-card p-6 shadow-2xl pointer-events-auto"
        >
          <button onClick={onDismiss} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground">
            <X size={18} />
          </button>
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">{currentStep + 1}</div>
            <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
              {step.title} {currentStep === 0 && <Sparkles className="h-4 w-4 text-amber-500" />}
            </h3>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
          <div className="mt-8 flex flex-col gap-4">
            <div className="text-right">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Step {currentStep + 1} of {steps.length}</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onBack} disabled={currentStep === 0} className="flex-1">
                <ChevronLeft size={16} className="mr-1" /> Back
              </Button>
              <Button size="sm" onClick={currentStep === steps.length - 1 ? onDismiss : onNext} className="flex-1">
                {currentStep === steps.length - 1 ? "Finish Tour" : "Next Step"}
                {currentStep < steps.length - 1 && <ChevronRight size={16} className="ml-1" />}
              </Button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default TutorialTour;