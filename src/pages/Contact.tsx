"use client";

import { useState, useEffect } from "react";
import { Mail, MessageCircle, Lightbulb, Loader2, Send, Clock, CheckCircle2, Reply, AlertCircle, History } from "lucide-react";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { submitSupportMessage, getSupportMessages } from "@/lib/api";
import { Link, Navigate } from "react-router-dom";

const ContactPage = () => {
  const { user, session, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [history, setHistory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"form" | "history">("form");
  
  const [formData, setFormData] = useState({
    type: "contact",
    subject: "",
    message: ""
  });

  useEffect(() => {
    if (session && activeTab === "history") {
      fetchHistory();
    }
  }, [session, activeTab]);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const data = await getSupportMessages();
      // Filter for current user's messages (though RLS handles this, we filter locally too)
      setHistory(data.filter((m: any) => m.user_id === user?.id));
    } catch (err) {
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    
    setLoading(true);
    try {
      await submitSupportMessage({
        ...formData,
        user_id: user?.id,
        status: 'new'
      });
      
      toast({
        title: "Message Sent!",
        description: "We've received your message and will get back to you soon.",
      });
      
      setFormData({ type: "contact", subject: "", message: "" });
      setActiveTab("history");
    } catch (err: any) {
      toast({
        title: "Failed to send",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return <Layout><div className="flex py-24 justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></Layout>;
  if (!session) return <Navigate to="/login" replace />;

  return (
    <Layout>
      <SEOHead
        title="Support & Feedback — Giglant"
        description="Contact support, report bugs, or share feedback with the Giglant team."
      />
      <section className="section-padding">
        <div className="container-tight max-w-4xl">
          <div className="mb-12 text-center">
            <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl">Support & Feedback</h1>
            <p className="mt-4 text-lg text-muted-foreground">How can we help you today?</p>
          </div>

          <div className="mb-8 flex justify-center gap-2">
            <Button 
              variant={activeTab === "form" ? "default" : "outline"} 
              onClick={() => setActiveTab("form")}
              className="rounded-full px-8"
            >
              <Send className="mr-2 h-4 w-4" /> New Message
            </Button>
            <Button 
              variant={activeTab === "history" ? "default" : "outline"} 
              onClick={() => setActiveTab("history")}
              className="rounded-full px-8"
            >
              <History className="mr-2 h-4 w-4" /> My Tickets
              {history.some(m => m.status === 'replied') && (
                <span className="ml-2 flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              )}
            </Button>
          </div>

          {activeTab === "form" ? (
            <div className="rounded-3xl border border-border bg-card p-8 shadow-xl shadow-primary/5 animate-in fade-in slide-in-from-bottom-4">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Message Type</label>
                    <Select 
                      value={formData.type} 
                      onValueChange={(v) => setFormData({ ...formData, type: v })}
                    >
                      <SelectTrigger className="h-12 border-border/40 bg-muted/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="contact">General Inquiry</SelectItem>
                        <SelectItem value="bug">Bug Report</SelectItem>
                        <SelectItem value="feedback">Feature Suggestion</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Subject</label>
                    <Input 
                      required 
                      placeholder="Brief summary..." 
                      className="h-12 border-border/40 bg-muted/20"
                      value={formData.subject}
                      onChange={e => setFormData({ ...formData, subject: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Message</label>
                  <Textarea 
                    required 
                    rows={6} 
                    placeholder="Describe your issue or feedback in detail..." 
                    className="border-border/40 bg-muted/20 resize-none"
                    value={formData.message}
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>
                <Button type="submit" disabled={loading} className="w-full py-6 text-lg font-bold shadow-lg shadow-primary/20">
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                  Send Message
                </Button>
              </form>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
              {historyLoading ? (
                <div className="flex py-12 justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
              ) : history.length > 0 ? (
                history.map(msg => (
                  <div key={msg.id} className={`rounded-2xl border p-6 transition-all ${msg.status === 'replied' ? 'border-primary/30 bg-primary/5 shadow-md' : 'border-border bg-card'}`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                          msg.type === 'bug' ? 'bg-red-500/10 text-red-600' : 
                          msg.type === 'feedback' ? 'bg-blue-500/10 text-blue-600' : 
                          'bg-emerald-500/10 text-emerald-600'
                        }`}>
                          {msg.type}
                        </div>
                        <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                          msg.status === 'new' ? 'bg-amber-500 text-white' : 
                          msg.status === 'replied' ? 'bg-blue-500 text-white' : 
                          'bg-gray-500 text-white'
                        }`}>
                          {msg.status}
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground font-medium">
                        {new Date(msg.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg mb-2">{msg.subject}</h3>
                    <p className="text-sm text-muted-foreground mb-4 whitespace-pre-wrap">{msg.message}</p>
                    
                    {msg.admin_reply && (
                      <div className="mt-6 rounded-xl bg-white p-4 border border-primary/20 shadow-sm animate-in zoom-in-95">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">G</div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Giglant Support Reply</p>
                        </div>
                        <p className="text-sm text-foreground leading-relaxed italic">"{msg.admin_reply}"</p>
                        <p className="mt-2 text-[10px] text-muted-foreground">Replied on {new Date(msg.updated_at).toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-border bg-card p-20 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <History size={32} />
                  </div>
                  <h2 className="font-display text-xl font-bold text-foreground">No messages yet</h2>
                  <p className="mt-2 text-muted-foreground">Your support history will appear here.</p>
                  <Button onClick={() => setActiveTab("form")} variant="outline" className="mt-6">Send a Message</Button>
                </div>
              )}
            </div>
          )}

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <AlertCircle className="h-6 w-6" />
              </div>
              <h4 className="font-display font-bold">Bug Reports</h4>
              <p className="mt-2 text-xs text-muted-foreground">Found a glitch? Let us know and we'll fix it ASAP.</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Lightbulb className="h-6 w-6" />
              </div>
              <h4 className="font-display font-bold">Feedback</h4>
              <p className="mt-2 text-xs text-muted-foreground">Have an idea for a new tool? We're all ears.</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Mail className="h-6 w-6" />
              </div>
              <h4 className="font-display font-bold">Direct Support</h4>
              <p className="mt-2 text-xs text-muted-foreground">Need help with your account or projects?</p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ContactPage;