"use client";

import { useEffect, useState } from "react";
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
  ArrowLeft
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

type SupportTicket = {
  id: string;
  type: 'bug' | 'feedback' | 'contact';
  subject: string;
  message: string;
  reply: string | null;
  status: string;
  tags: string[];
  is_read_by_user: boolean;
  created_at: string;
  updated_at: string;
};

const SupportPage = () => {
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!session && !user) {
      navigate("/login");
    }
  }, [session, user, navigate]);

  const { data: tickets, isLoading } = useQuery({
    queryKey: ["support_tickets", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as SupportTicket[];
    },
    enabled: !!user,
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (ticketId: string) => {
      const { error } = await supabase
        .from("support_tickets")
        .update({ is_read_by_user: true })
        .eq("id", ticketId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["support_tickets"] });
      queryClient.invalidateQueries({ queryKey: ["unread_support_count"] });
    },
  });

  const toggleExpand = (ticket: SupportTicket) => {
    if (expandedId === ticket.id) {
      setExpandedId(null);
    } else {
      setExpandedId(ticket.id);
      if (!ticket.is_read_by_user && ticket.reply) {
        markAsReadMutation.mutate(ticket.id);
      }
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'bug': return <Bug className="h-4 w-4 text-red-500" />;
      case 'feedback': return <Lightbulb className="h-4 w-4 text-amber-500" />;
      default: return <MessageCircle className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusBadge = (status: string, hasReply: boolean) => {
    if (hasReply) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
          <CheckCircle2 className="h-3 w-3" />
          Replied
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
        <Clock className="h-3 w-3" />
        Pending
      </span>
    );
  };

  if (isLoading) {
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
      <SEOHead
        title="Support History — Giglant"
        description="View your support tickets and messages with the Giglant team."
      />
      <section className="section-padding">
        <div className="container-tight max-w-4xl">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <Link to="/contact" className="mb-4 flex items-center text-sm text-muted-foreground hover:text-primary">
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back to Contact
              </Link>
              <h1 className="font-display text-3xl font-bold text-foreground">Support History</h1>
              <p className="mt-2 text-muted-foreground">Track your bug reports, feedback, and inquiries.</p>
            </div>
            <Link to="/contact">
              <Button>New Ticket</Button>
            </Link>
          </div>

          {!tickets || tickets.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <MessageSquare className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground">No tickets yet</h3>
              <p className="mt-2 text-muted-foreground">When you send us a message, it will appear here.</p>
              <Link to="/contact" className="mt-6 inline-block">
                <Button variant="outline">Send your first message</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <div 
                  key={ticket.id}
                  className={cn(
                    "overflow-hidden rounded-xl border transition-all duration-200",
                    expandedId === ticket.id ? "border-primary ring-1 ring-primary/20" : "border-border bg-card hover:border-primary/50",
                    !ticket.is_read_by_user && ticket.reply && "border-blue-500 bg-blue-50/30"
                  )}
                >
                  <button
                    onClick={() => toggleExpand(ticket)}
                    className="flex w-full items-center justify-between p-5 text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                        {getTypeIcon(ticket.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground">{ticket.subject}</h3>
                          {getStatusBadge(ticket.status, !!ticket.reply)}
                          {!ticket.is_read_by_user && ticket.reply && (
                            <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                          )}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {format(new Date(ticket.created_at), "MMM d, yyyy • h:mm a")}
                        </p>
                      </div>
                    </div>
                    {expandedId === ticket.id ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </button>

                  {expandedId === ticket.id && (
                    <div className="border-t border-border bg-muted/30 p-5">
                      <div className="mb-6">
                        <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Your Message</h4>
                        <div className="rounded-lg bg-background p-4 text-sm text-foreground shadow-sm">
                          {ticket.message}
                        </div>
                      </div>

                      {ticket.reply ? (
                        <div>
                          <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-primary">Giglant Team Reply</h4>
                          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm text-foreground shadow-sm">
                            {ticket.reply}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground italic">
                          <AlertCircle className="h-4 w-4" />
                          Waiting for a response from our team...
                        </div>
                      )}

                      {ticket.tags && ticket.tags.length > 0 && (
                        <div className="mt-6 flex flex-wrap gap-2">
                          {ticket.tags.map((tag) => (
                            <span key={tag} className="rounded bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground uppercase">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default SupportPage;