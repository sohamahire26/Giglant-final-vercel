"use client";

import { useState } from "react";
import { Mail, MessageCircle, Lightbulb } from "lucide-react";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import FAQSection from "@/components/FAQSection";
import { Button } from "@/components/ui/button";

const contactFAQ = [
  { question: "How can I suggest a new tool for my video editing workflow?", answer: "Use the contact form below or email feedback@giglant.com! We build tools based on real freelancer workflow and editing pipeline needs." },
  { question: "How quickly do you respond?", answer: "Our support team aims to respond within 24-48 hours. For urgent matters, please use support@giglant.com." },
  { question: "Can I request custom tools for my post production workflow?", answer: "We love hearing about specific workflow challenges. Share your use case and we'll consider building tools that help optimize your video editing workflow." },
];

const ContactPage = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <Layout>
      <SEOHead
        title="Contact Giglant — Video Editing Workflow & Freelancer Tools Support"
        description="Have a question about our video editing workflow tools? Suggest a new tool for your freelancer workflow or post production pipeline. Contact the Giglant team."
      />
      <section className="section-padding">
        <div className="container-tight max-w-4xl">
          <div className="mb-12 text-center">
            <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl">Get in Touch</h1>
            <p className="mt-4 text-lg text-muted-foreground">We're here to help you optimize your freelancer workflow.</p>
          </div>

          <div className="mb-12 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Mail className="h-6 w-6" />
              </div>
              <h3 className="font-display font-semibold text-foreground">Support</h3>
              <p className="mt-2 text-sm text-muted-foreground">support@giglant.com</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10 text-blue-600">
                <Lightbulb className="h-6 w-6" />
              </div>
              <h3 className="font-display font-semibold text-foreground">Suggestions</h3>
              <p className="mt-2 text-sm text-muted-foreground">feedback@giglant.com</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                <MessageCircle className="h-6 w-6" />
              </div>
              <h3 className="font-display font-semibold text-foreground">General</h3>
              <p className="mt-2 text-sm text-muted-foreground">hello@giglant.com</p>
            </div>
          </div>

          {submitted ? (
            <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-sm">
              <h2 className="font-display text-2xl font-bold text-foreground">Message Sent!</h2>
              <p className="mt-3 text-muted-foreground">Thanks for reaching out. Our team will get back to you shortly.</p>
              <Button onClick={() => setSubmitted(false)} variant="outline" className="mt-6">Send another message</Button>
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
              <h2 className="font-display text-2xl font-bold text-foreground mb-6">Send us a message</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">Name</label>
                    <input type="text" required placeholder="Your name" className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
                    <input type="email" required placeholder="you@email.com" className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none" />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Subject</label>
                  <select className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none">
                    <option>General Inquiry</option>
                    <option>Technical Support</option>
                    <option>Tool Suggestion</option>
                    <option>Partnership</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Message</label>
                  <textarea required rows={5} placeholder="How can we help your workflow?" className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none resize-none" />
                </div>
                <Button type="submit" className="w-full py-6 text-lg">Send Message</Button>
              </form>
            </div>
          )}
        </div>
      </section>
      <FAQSection title="Contact FAQ — Freelancer Workflow" items={contactFAQ} />
    </Layout>
  );
};

export default ContactPage;