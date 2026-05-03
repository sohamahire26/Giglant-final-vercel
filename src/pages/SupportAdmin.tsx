"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp,
  MessageCircle,
  Bug,
  Lightbulb,
  Loader2,
  ArrowLeft,
  Send,
  User,
  Search,
  Filter
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const OWNER_EMAIL = "Sohamahire26@gmail.com";

type SupportTicket = {
  id: string;
  user_id: string;
  type: 'bug' | 'feedback' | 'contact';
  subject: string;
  message: string;
  reply: string | null;
  status: string;
  tags: string[];
  is_read_by_user: boolean;
  created_at: string;
  updated_at: string;
  profiles?: {
    first_name: string | null;
    last_name: string | null;
  };
};

const SupportAdmin = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const isOwner = profile?.is_admin || user?.email?.toLowerCase() === OWNER_EMAIL.toLowerCase();

  useEffect(() => {
    if (!authLoading && !isOwner) {
      navigate("/dashboard");
    }
  }, [authLoading, isOwner, navigate]);

  const { data: tickets, isLoading } = useQuery({
    queryKey: ["admin_support_tickets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("support_tickets")
        .select(`
          *,
          profiles (
            first_name,
            last_name
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as SupportTicket[];
    },
    enabled: isOwner,
  });

  const replyMutation = useMutation({
    mutationFn: async ({ ticketId, reply }: { ticketId: string; reply: string }) => {
      const { error } = await supabase
        .from("support_tickets")
        .update({ 
          reply, 
          status: 'replied',
          is_read_by_user: false,
          updated_at: new Date().toISOString()
        })
        .eq("id", ticketId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_support_tickets"] });
      toast.success("Reply sent successfully!");
      setReplyText("");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to send reply.");
    }
  });

  const handleReply = (ticketId: string) => {
    if (!replyText.trim()) return;
    replyMutation.mutate({ ticketId, reply: replyText.trim() });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'bug': return <Bug className="h-4 w-4 text-red-500" />;
      case 'feedback': return <Lightbulb className="h-4 w-4 text-amber-500" />;
      default: return <MessageCircle className="h-4 w-4 text-blue-500" />;
    }
  };

  const filteredTickets = tickets?.filter(t => {
    const matchesFilter = filter === "all" || t.type === filter || (filter === "pending" && !t.reply);
    const matchesSearch = t.subject.toLowerCase().includes(search.toLowerCase()) || 
                         t.message.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (authLoading || isLoading) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEOHead title="Support Admin — Giglant" description="Manage user support tickets." />
      <section className="section-padding">
        <div className="container-tight">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-primary">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="font-display text-3xl font-bold">Support Admin</h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search tickets..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="rounded-lg border border-border bg-card py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none"
                />
              </div>
              <select 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="rounded-lg border border-border bg-card px-3 py-2 text-sm focus:border-primary focus:outline-none"
              >
                <option value="all">All Types</option>
                <option value="pending">Pending Only</option>
                <option value="bug">Bugs</option>
                <option value="feedback">Feedback</option>
                <option value="contact">Contact</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {filteredTickets?.map((ticket) => (
              <div 
                key={ticket.id}
                className={cn(
                  "overflow-hidden rounded-xl border transition-all duration-200",
                  expandedId === ticket.id ? "border-primary ring-1 ring-primary/20" : "border-border bg-card hover:border-primary/50",
                  !ticket.reply && "border-amber-200 bg-amber-50/30"
                )}
              >
                <button
                  onClick={() => {
                    setExpandedId(expandedId === ticket.id ? null : ticket.id);
                    if (ticket.reply) setReplyText(ticket.reply);
                    else setReplyText("");
                  }}
                  className="flex w-full items-center justify-between p-5 text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                      {getTypeIcon(ticket.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">{ticket.subject}</h3>
                        {!ticket.reply ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-700">
                            Pending
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-700">
                            Replied
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        From: {ticket.profiles?.first_name || 'User'} • {format(new Date(ticket.created_at), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                  {expandedId === ticket.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>

                {expandedId === ticket.id && (
                  <div className="border-t border-border bg-muted/30 p-5">
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-2">
                        <User size={14} className="text-muted-foreground" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">User Message</h4>
                      </div>
                      <div className="rounded-lg bg-background p-4 text-sm text-foreground shadow-sm">
                        {ticket.message}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <MessageSquare size={14} className="text-primary" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-primary">Admin Reply</h4>
                      </div>
                      <Textarea 
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Type your response here..."
                        className="min-h-[120px] bg-background"
                      />
                      <div className="flex justify-end">
                        <Button 
                          onClick={() => handleReply(ticket.id)}
                          disabled={replyMutation.isPending || !replyText.trim()}
                          className="gap-2"
                        >
                          {replyMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                          {ticket.reply ? "Update Reply" : "Send Reply"}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {filteredTickets?.length === 0 && (
              <div className="py-20 text-center border border-dashed rounded-2xl">
                <p className="text-muted-foreground">No tickets found matching your criteria.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default SupportAdmin;