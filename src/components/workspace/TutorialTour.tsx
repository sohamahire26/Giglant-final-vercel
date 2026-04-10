"use client";

import { useState, useLayoutEffect, useEffect } from "react";
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
  const [tipStyle, setTipStyle] = useState<React.CSSProperties>({ opacity: 0 });
  const step = steps[currentStep];

  // Disable scrolling when tour is active
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
      setTipStyle({
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        opacity: 1,
        width: "min(400px, 90vw)",
      });
      return;
    }

    const el = document.getElementById(step.targetId);
    if (el) {
      // Scroll the element into view first
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      
      // Wait for scroll to settle
      setTimeout(() => {
        const rect = el.getBoundingClientRect();
        const padding = 8;
        const newCoords = {
          top: rect.top - padding,
          left: rect.left - padding,
          width: rect.width + padding * 2,
          height: rect.height + padding * 2,
        };
        setCoords(newCoords);

        // Calculate tooltip position
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const tooltipWidth = Math.min(380, windowWidth * 0.9);
        const tooltipHeight = 200; // Estimated height

        let top = newCoords.top + newCoords.height + 20;
        let left = newCoords.left + newCoords.width / 2 - tooltipWidth / 2;

        // Adjust if off-screen vertically
        if (top + tooltipHeight > windowHeight) {
          top = newCoords.top - tooltipHeight - 40;
        }
        
        // Ensure it's at least visible
        top = Math.max(20, Math.min(top, windowHeight - tooltipHeight - 20));
        
        // Adjust if off-screen horizontally
        left = Math.max(10, Math.min(left, windowWidth - tooltipWidth - 10));

        setTipStyle({
          position: "fixed",
          top: `${top}px`,
          left: `${left}px`,
          width: `${tooltipWidth}px`,
          opacity: 1,
        });
      }, 100);
    } else {
      // Fallback to center if element not found
      setCoords(null);
      setTipStyle({
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        opacity: 1,
        width: "min(400px, 90vw)",
      });
    }
  };

  useLayoutEffect(() => {
    updateCoords();
    window.addEventListener("resize", updateCoords);
    return () => window.removeEventListener("resize", updateCoords);
  }, [currentStep, step.targetId]);

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden pointer-events-none">
      {/* Backdrop with spotlight */}
      <div 
        className="absolute inset-0 bg-black/60 pointer-events-auto"
        onClick={onDismiss}
      />

      {/* Spotlight Highlight */}
      <AnimatePresence>
        {coords && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{
              top: coords.top,
              left: coords.left,
              width: coords.width,
              height: coords.height,
              opacity: 1,
            }}
            exit={{ opacity: 0 }}
            className="absolute z-[10000] rounded-xl border-2 border-primary shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] pointer-events-none"
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          />
        )}
      </AnimatePresence>

      {/* Tooltip */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          style={tipStyle}
          className="z-[10001] rounded-2xl border border-border bg-card p-6 shadow-2xl pointer-events-auto"
        >
          <button onClick={onDismiss} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground">
            <X size={18} />
          </button>
          
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
              {currentStep + 1}
            </div>
            <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
              {step.title} {currentStep === 0 && <Sparkles className="h-4 w-4 text-amber-500" />}
            </h3>
          </div>
          
          <p className="text-sm leading-relaxed text-muted-foreground">
            {step.desc}
          </p>
          
          <div className="mt-8 flex flex-col gap-4">
            <div className="text-right">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Step {currentStep + 1} of {steps.length}
              </span>
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