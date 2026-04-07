"use client";

import { useState, useLayoutEffect, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, X, Sparkles } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

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
  onDismiss: (neverShowAgain: boolean) => void;
}

const TutorialTour = ({ steps, currentStep, onNext, onBack, onDismiss }: Props) => {
  const [coords, setCoords] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const [neverShowAgain, setNeverShowAgain] = useState(false);
  const step = steps[currentStep];

  // Lock scroll when tutorial is active
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
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
        setCoords({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height,
        });
      }, 300);
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
          className="absolute inset-0 bg-black/70 pointer-events-auto"
          style={{
            clipPath: coords 
              ? `polygon(0% 0%, 0% 100%, ${coords.left - 8}px 100%, ${coords.left - 8}px ${coords.top - 8}px, ${coords.left + coords.width + 8}px ${coords.top - 8}px, ${coords.left + coords.width + 8}px ${coords.top + coords.height + 8}px, ${coords.left - 8}px ${coords.top + coords.height + 8}px, ${coords.left - 8}px 100%, 100% 100%, 100% 0%)`
              : "none"
          }}
          onClick={() => onDismiss(neverShowAgain)}
        />
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ 
            opacity: 1, 
            scale: 1, 
            y: 0,
            position: coords ? "absolute" : "relative",
            top: coords ? coords.top + coords.height + 24 : "auto",
            left: coords ? coords.left + (coords.width / 2) : "auto",
            translateX: coords ? "-50%" : "0",
          }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="z-[101] w-[340px] rounded-2xl border border-border bg-card p-6 shadow-2xl pointer-events-auto"
        >
          <button onClick={() => onDismiss(neverShowAgain)} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground">
            <X size={18} />
          </button>
          
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
              {currentStep + 1}
            </div>
            <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
              {step.title}
              {currentStep === 0 && <Sparkles className="h-4 w-4 text-amber-500" />}
            </h3>
          </div>
          
          <p className="text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
          
          <div className="mt-8 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="never-show" 
                  checked={neverShowAgain} 
                  onCheckedChange={(checked) => setNeverShowAgain(!!checked)} 
                />
                <label htmlFor="never-show" className="text-[11px] font-medium text-muted-foreground cursor-pointer">
                  Don't show again
                </label>
              </div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Step {currentStep + 1} of {steps.length}
              </span>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onBack} disabled={currentStep === 0} className="flex-1">
                <ChevronLeft size={16} className="mr-1" /> Back
              </Button>
              <Button size="sm" onClick={currentStep === steps.length - 1 ? () => onDismiss(neverShowAgain) : onNext} className="flex-1">
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