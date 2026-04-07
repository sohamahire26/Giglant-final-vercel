"use client";

import { useState, useEffect, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, X } from "lucide-react";

export interface TourStep {
  targetId?: string; // CSS ID to point to
  title: string;
  desc: string;
  position?: "top" | "bottom" | "left" | "right";
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
  const step = steps[currentStep];

  // Update spotlight position based on target element
  const updateCoords = () => {
    if (!step.targetId) {
      setCoords(null);
      return;
    }
    const el = document.getElementById(step.targetId);
    if (el) {
      const rect = el.getBoundingClientRect();
      setCoords({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height,
      });
    } else {
      setCoords(null);
    }
  };

  useLayoutEffect(() => {
    updateCoords();
    window.addEventListener("resize", updateCoords);
    window.addEventListener("scroll", updateCoords);
    return () => {
      window.removeEventListener("resize", updateCoords);
      window.removeEventListener("scroll", updateCoords);
    };
  }, [currentStep, step.targetId]);

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {/* Spotlight Overlay */}
      <AnimatePresence>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 pointer-events-auto"
          style={{
            clipPath: coords 
              ? `polygon(0% 0%, 0% 100%, ${coords.left}px 100%, ${coords.left}px ${coords.top}px, ${coords.left + coords.width}px ${coords.top}px, ${coords.left + coords.width}px ${coords.top + coords.height}px, ${coords.left}px ${coords.top + coords.height}px, ${coords.left}px 100%, 100% 100%, 100% 0%)`
              : "none"
          }}
          onClick={onDismiss}
        />
      </AnimatePresence>

      {/* Tooltip Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ 
            opacity: 1, 
            scale: 1, 
            y: 0,
            top: coords ? coords.top + coords.height + 20 : "50%",
            left: coords ? coords.left + (coords.width / 2) : "50%",
            translateX: "-50%",
            translateY: coords ? "0" : "-50%",
          }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="absolute pointer-events-auto w-[320px] rounded-2xl border border-border bg-card p-6 shadow-2xl"
        >
          <button onClick={onDismiss} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground">
            <X size={16} />
          </button>
          
          <div className="mb-1 flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
              {currentStep + 1}
            </span>
            <h3 className="font-display text-sm font-bold text-foreground">{step.title}</h3>
          </div>
          
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{step.desc}</p>
          
          <div className="mt-6 flex items-center justify-between">
            <div className="flex gap-1">
              {steps.map((_, i) => (
                <div key={i} className={`h-1 w-4 rounded-full transition-colors ${i === currentStep ? "bg-primary" : "bg-border"}`} />
              ))}
            </div>
            
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button variant="ghost" size="sm" onClick={onBack} className="h-8 px-2">
                  <ChevronLeft size={16} />
                </Button>
              )}
              <Button size="sm" onClick={currentStep === steps.length - 1 ? onDismiss : onNext} className="h-8">
                {currentStep === steps.length - 1 ? "Finish" : "Next"}
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