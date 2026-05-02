"use client";

import { useState } from "react";
import { Mail, MessageCircle, Lightbulb, History, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import FAQSection from "@/components/FAQSection";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const contactFAQ = [
  { question: "How can I suggest a new tool for my video editing workflow?", answer: "Use the contact form below or email feedback@giglant.com! We build tools based on real freelancer workflow and editing pipeline needs." },
  { question: "How quickly do you respond?", answer: "Our support team aims to respond within 24-48 hours. For urgent matters, please use support@giglant.com." },
  { question: "Can I request custom tools for my post production workflow?", answer: "We love hearing about specific workflow challenges. Share your use case and we'll consider building tools that help optimize your video editing workflow." },
];

const ContactPage = () => {
  const { user, session } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: "contact" as "bug" | "feedback" | "contact",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("You must be logged in to send a message.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("support_tickets").insert({
        user_id: user.id,
        type: formData.type,
        subject: formData.subject,
        message: formData.message,
      });

      if (error) throw error;

      setSubmitted(true);
      toast.success("Message sent successfully!");
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast.error(error.message || "Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
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
            {session && (
              <div className="mt-6">
                <Link to="/support">
                  <Button variant="outline" className="gap-2">
                    <History className="h-4 w-4" />
                    View Support History
                  </Button>
                </Link>
              </div>
            )}
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
              <div className="mt-6 flex flex-col items-center gap-4">
                <Button onClick={() => setSubmitted(false)} variant="outline">Send another message</Button>
                <Link to="/support" className="text-sm text-primary hover:underline">View your support tickets</Link>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
              <h2 className="font-display text-2xl font-bold text-foreground mb-6">Send us a message</h2>
              {!session ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-6">Please sign in to send a message and track your support history.</p>
                  <Link to="/login">
                    <Button className="px-8">Sign In</Button>
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">Name</label>
                      <input 
                        type="text" 
                        disabled 
                        value={user?.user_metadata?.first_name ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}` : user?.email || ''} 
                        className="w-full rounded-lg border border-border bg-muted px-4 py-2.5 text-sm text-muted-foreground cursor-not-allowed" 
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
                      <input 
                        type="email" 
                        disabled 
                        value={user?.email || ''} 
                        className="w-full rounded-lg border border-border bg-muted px-4 py-2.5 text-sm text-muted-foreground cursor-not-allowed" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">Type</label>
                    <select 
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                      className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                    >
                      <option value="contact">General Inquiry</option>
                      <option value="bug">Bug Report</option>
                      <option value="feedback">Tool Suggestion / Feedback</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">Subject</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="What is this about?" 
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none" 
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">Message</label>
                    <textarea 
                      required 
                      rows={5} 
                      placeholder="How can we help your workflow?" 
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none resize-none" 
                    />
                  </div>
                  <Button type="submit" className="w-full py-6 text-lg" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Send Message"
                    )}
                  </Button>
                </form>
              )}
            </div>
          )}
        </div>
      </section>
      <FAQSection title="Contact FAQ — Freelancer Workflow" items={contactFAQ} />
    </Layout>
  );
};

export default ContactPage;