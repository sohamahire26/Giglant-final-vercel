"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  title?: string;
  subtitle?: string;
  items: FAQItem[];
  className?: string;
  plain?: boolean; // New prop to skip section/container wrappers
}

const FAQSection = ({ title = "Frequently Asked Questions", subtitle, items, className, plain = false }: FAQSectionProps) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const content = (
    <div className={cn("mx-auto space-y-3", !plain && "max-w-3xl")}>
      {(title || subtitle) && (
        <div className={cn("mb-8", !plain ? "text-center" : "text-left")}>
          {title && <h2 className={cn("font-display font-bold text-foreground", !plain ? "text-3xl md:text-4xl" : "text-xl")}>{title}</h2>}
          {subtitle && <p className="mt-2 text-muted-foreground">{subtitle}</p>}
        </div>
      )}
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="rounded-xl border border-border bg-card overflow-hidden transition-all hover:border-primary/30">
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="flex w-full items-center justify-between px-6 py-4 text-left"
            >
              <span className="pr-4 font-medium text-foreground text-sm md:text-base">{item.question}</span>
              <ChevronDown
                className={cn(
                  "h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200",
                  openIndex === i && "rotate-180 text-primary"
                )}
              />
            </button>
            <AnimatePresence initial={false}>
              {openIndex === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                >
                  <div className="border-t border-border px-6 py-4 text-sm leading-relaxed text-muted-foreground bg-muted/5">
                    {item.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );

  if (plain) {
    return <div className={className}>{content}</div>;
  }

  return (
    <section className={cn("section-padding", className)}>
      <div className="container-tight">
        {content}
      </div>
    </section>
  );
};

export default FAQSection;