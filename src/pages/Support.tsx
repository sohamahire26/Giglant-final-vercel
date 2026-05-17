"use client";

import { useState } from "react";
import { MessageCircle, Lightbulb, Bug, Send, Loader2, CheckCircle2 } from "lucide-react";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import FAQSection from "@/components/FAQSection";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const supportFAQ = [
  { question: "How can I suggest a new tool for my video editing workflow?", answer: "Use the form below! We build tools based on real freelancer workflow and editing pipeline needs." },
  { question: "How quickly do you respond?", answer: "Our support team aims to respond within 24-48 hours." },
  { question: "Can I request custom tools for my post production workflow?", answer: "We love hearing about specific workflow challenges. Share your use case and we'll consider building tools that help optimize your video editing workflow." },
];

const SupportPage = () => {
  const { user, session } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    type: "suggestion",
    subject: "",
    message: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      toast({ title: "Please sign in", description: "You need to be logged in to send a support message.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("support_messages")
        .insert({
          user_id: user?.id,
          type: formData.type,
          subject: formData.subject || `${formData.type.toUpperCase()} from ${user?.email}`,
          message: formData.message,
          status: "new"
        });

      if (error) throw error;
      setSubmitted(true);
      toast({ title: "Message sent!", description: "We've received your message and will get back to you soon." });
    } catch (err: any) {
      toast({ title: "Failed to send", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <SEOHead
        title="Support — Giglant Video Editing & Freelancer Tools"
        description="Get help with Giglant's tools. Report bugs, suggest features, or ask questions about your video editing workflow."
      />
      <section className="section-padding">
        <div className="container-tight max-w-4xl">
          <div className="mb-12 text-center">
            <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl">Support & Feedback</h1>
            <p className="mt-4 text-lg text-muted-foreground">Help us build the best tools for your freelancer workflow.</p>
          </div>

          <div className="mb-12 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-600">
                <Bug className="h-6 w-6" />
              </div>
              <h3 className="font-display font-semibold text-foreground">Bug Report</h3>
              <p className="mt-2 text-xs text-muted-foreground">Found a glitch? Let us know so we can fix it.</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10 text-blue-600">
                <Lightbulb className="h-6 w-6" />
              </div>
              <h3 className="font-display font-semibold text-foreground">Suggestions</h3>
              <p className="mt-2 text-xs text-muted-foreground">Have an idea for a new tool? We're listening.</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                <MessageCircle className="h-6 w-6" />
              </div>
              <h3 className="font-display font-semibold text-foreground">General</h3>
              <p className="mt-2 text-xs text-muted-foreground">Questions about your account or pricing.</p>
            </div>
          </div>

          {!session ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
              <h2 className="font-display text-2xl font-bold text-foreground">Sign in to send a message</h2>
              <p className="mt-3 text-muted-foreground">We need your email to get back to you regarding your request.</p>
              <Button asChild className="mt-6">
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          ) : submitted ? (
            <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-sm animate-in fade-in zoom-in duration-300">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h2 className="font-display text-2xl font-bold text-foreground">Message Received!</h2>
              <p className="mt-3 text-muted-foreground">Thanks for reaching out, <strong>{user?.email}</strong>. Our team will review your message shortly.</p>
              <Button onClick={() => setSubmitted(false)} variant="outline" className="mt-6">Send another message</Button>
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
              <h2 className="font-display text-2xl font-bold text-foreground mb-6">Send a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Message Type</label>
                    <select 
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                    >
                      <option value="bug">Bug Report</option>
                      <option value="suggestion">Suggestion</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Subject (Optional)</label>
                    <input 
                      type="text" 
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="Brief summary..." 
                      className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none" 
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Message</label>
                  <textarea 
                    required 
                    rows={5} 
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Describe your issue or suggestion in detail..." 
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none resize-none" 
                  />
                </div>
                <div className="flex items-center justify-between pt-2">
                  <p className="text-xs text-muted-foreground">Sending as: <span className="font-semibold text-foreground">{user?.email}</span></p>
                  <Button type="submit" disabled={loading} className="px-8">
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                    Send Message
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </section>
      <FAQSection title="Support FAQ" items={supportFAQ} />
    </Layout>
  );
};

export default SupportPage;