"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, Link, useLocation, Navigate, useNavigate } from "react-router-dom";
import { Trash2, Loader2, FolderOpen, MessageSquare, CheckSquare, Send, Receipt, HelpCircle, FileEdit, RefreshCw, Lock, Sparkles, AlertTriangle, Clock, MessageCircle } from "lucide-react";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Project, ProjectFile, FileComment } from "@/components/workspace/types";
import { isProjectLocked, getRenewalStatus, getDeletionRemaining } from "@/components/workspace/types";
import OverviewTab from "@/components/workspace/OverviewTab";
import FilesTab from "@/components/workspace/FilesTab";
import RevisionsTab from "@/components/workspace/RevisionsTab";
import DeliveryTab from "@/components/workspace/DeliveryTab";
import InvoiceTab from "@/components/workspace/InvoiceTab";
import FileRenamerTab from "@/components/workspace/FileRenamerTab";
import TutorialTour, { TourStep } from "@/components/workspace/TutorialTour";
import { useAuth } from "@/components/AuthProvider";

const freelancerSteps: TourStep[] = [
  { title: "Welcome to Your Workspace! 🚀", desc: "This is where you manage your entire client project. Let's walk through the tools that will save you hours of work." },
  { targetId: "ws-share-card", title: "The Magic Link 🔗", desc: "This is your most important tool. Copy this link and send it to your client. They can view files and leave feedback instantly—no login required for them!" },
  { targetId: "ws-renamer-tab-btn", title: "File Renamer 📝", desc: "Use our free File Renamer tool to clean up messy filenames before uploading. It cleans up formatting and organizes files with proper naming." },
  { targetId: "ws-files-tab-btn", title: "Files & Feedback 📁", desc: "Upload your work here by pasting Google Drive links. Select the file type (Video/Audio gets timestamp feedback, others get standard comments). We'll generate a professional preview for your client." },
  { targetId: "ws-revisions-tab-btn", title: "Revision Checklist ✅", desc: "Once your client leaves feedback, it all appears here as an organized checklist. Mark items as resolved as you work through them." },
  { targetId: "ws-delivery-tab-btn", title: "Delivery Assistant ✉️", desc: "Ready to send a draft or final version? Use this to generate professional messages that make you look like a pro." },
  { targetId: "ws-invoice-tab-btn", title: "Invoice Generator 💰", desc: "Generate polite but firm invoice requests and reminders. No more awkward 'where is my money' emails." },
];

const tabs = [
  { id: "overview", label: "Overview", icon: FolderOpen },
  { id: "renamer", label: "File Renamer", icon: FileEdit },
  { id: "files", label: "Files & Feedback", icon: MessageSquare },
  { id: "revisions", label: "Revisions", icon: CheckSquare },
  { id: "delivery", label: "Delivery", icon: Send },
  { id: "invoice", label: "Invoice", icon: Receipt, isPro: true },
];

const ProjectWorkspace = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, session, profile, loading: authLoading } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [comments, setComments] = useState<FileComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [subscription, setSubscription] = useState<any>(null);
  const { toast } = useToast();
  const pollingInterval = useRef<any>(null);

  const loadData = useCallback(async (silent = false) => {
    if (!id || !user) return;
    if (!silent) setLoading(true);
    
    try {
      const [projRes, filesRes, commentsRes, subRes] = await Promise.all([
        supabase.from("projects").select("*").eq("id", id).single(),
        supabase.from("project_files").select("*").eq("project_id", id).order("sort_order"),
        supabase.from("file_comments").select("*, project_files!inner(project_id)").eq("project_files.project_id", id).order("created_at"),
        supabase.from("subscriptions").select("*").eq("user_id", user.id).maybeSingle()
      ]);
      
      if (projRes.error) throw projRes.error;
      if (!projRes.data) { setLoading(false); return; }
      setProject(projRes.data as Project);
      setFiles(filesRes.data || []);
      setComments(commentsRes.data || []);
      setSubscription(subRes.data);
    } catch (error: any) {
      console.error("[ProjectWorkspace] Error loading data:", error);
      if (!silent) toast({ title: "Error loading project", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [id, user, toast]);

  useEffect(() => {
    if (location.state?.isNew) setShowTutorial(true);
  }, [location.state]);

  useEffect(() => {
    loadData();
    pollingInterval.current = setInterval(() => loadData(true), 30000);
    return () => { if (pollingInterval.current) clearInterval(pollingInterval.current); };
  }, [loadData]);

  const handleUpdateProject = async (updates: Partial<Project>) => {
    if (!id || !project) return;
    try {
      const { error } = await supabase.from("projects").update(updates).eq("id", id);
      if (error) throw error;
      setProject({ ...project, ...updates });
      toast({ title: "Success", description: "Project updated successfully" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
      throw err;
    }
  };

  const handleDeleteProject = async () => {
    if (!project || !confirm("Delete this project?")) return;
    try {
      const { error } = await supabase.from("projects").delete().eq("id", project.id);
      if (error) throw error;
      toast({ title: "Success", description: "Project deleted successfully" });
      navigate("/dashboard");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  if (authLoading || (loading && !project)) return <Layout><div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></Layout>;
  if (!session) return <Navigate to="/login" replace />;

  if (!project) return (
    <Layout><div className="flex min-h-[60vh] items-center justify-center flex-col gap-4">
      <h1 className="text-2xl font-bold text-foreground">Project Not Found</h1>
      <Button asChild><Link to="/projects/new">Create New Project</Link></Button>
    </div></Layout>
  );

  const planType = profile?.plan_type || 'free';
  const isPro = planType === 'pro';
  const isLocked = isProjectLocked(project, planType);
  const renewalStatus = getRenewalStatus(subscription);
  const deletionLeft = getDeletionRemaining(project, planType);

  return (
    <Layout>
      <SEOHead title={`${project.name} — Giglant`} description="Project workspace for managing files, feedback, delivery, and invoices." />

      {showTutorial && (
        <TutorialTour 
          steps={freelancerSteps} 
          currentStep={tutorialStep} 
          onNext={() => setTutorialStep(s => s + 1)}
          onBack={() => setTutorialStep(s => s - 1)}
          onDismiss={() => setShowTutorial(false)} 
        />
      )}

      <section className="section-padding">
        <div className="container-tight">
          {/* Renewal Disclaimer */}
          {isPro && renewalStatus && (
            <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <div className="text-sm">
                  <p className="font-bold text-amber-900">Subscription Renewal Notice</p>
                  <p className="text-amber-800">
                    {renewalStatus === '3d' && "Your Pro subscription renews in 3 days. Ensure your payment method is up to date."}
                    {renewalStatus === '2d' && "Your Pro subscription renews in 2 days. Don't lose access to your unlimited projects."}
                    {renewalStatus === '1d' && "Your Pro subscription renews tomorrow. Renew now to avoid project locking."}
                    {renewalStatus.startsWith('h-') && `CRITICAL: Your Pro subscription renews in ${renewalStatus.split('-')[1]} hours. Renew now!`}
                    {renewalStatus === 'expired' && "Your subscription has expired. Projects older than 7 days are now locked."}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl font-bold text-foreground">{project.name}</h1>
                {isLocked && <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white flex items-center gap-1"><Lock size={10} /> LOCKED</span>}
              </div>
              {project.client_name && <p className="text-sm text-muted-foreground">Client: {project.client_name}</p>}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => loadData()} className="text-muted-foreground border-border hover:bg-secondary">
                <RefreshCw className="mr-1 h-3 w-3" /> Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowTutorial(true)} className="text-primary border-primary/30 hover:bg-primary/5">
                <HelpCircle className="mr-1 h-3 w-3" /> Guide
              </Button>
              <Button variant="outline" size="sm" onClick={handleDeleteProject} className="text-destructive border-destructive/30 hover:bg-destructive/10">
                <Trash2 className="mr-1 h-3 w-3" /> Delete Project
              </Button>
            </div>
          </div>

          <div id="ws-tabs" className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-border bg-card p-1">
            {tabs.map(tab => (
              <button 
                key={tab.id} 
                id={`ws-${tab.id}-tab-btn`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}
              >
                <tab.icon className="h-4 w-4" /> 
                {tab.label}
                {tab.isPro && !isPro && (
                  <span className="ml-1.5 rounded bg-primary/10 px-1 py-0.5 text-[8px] font-bold text-primary">PRO</span>
                )}
              </button>
            ))}
          </div>

          <div className="relative min-h-[400px]">
            {isLocked && activeTab !== "overview" && (
              <div className="absolute inset-0 z-50 flex items-center justify-center rounded-2xl bg-background/60 backdrop-blur-sm">
                <div className="max-w-md rounded-3xl border border-amber-500/20 bg-card p-8 text-center shadow-2xl">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
                    <Lock size={32} />
                  </div>
                  <h2 className="font-display text-2xl font-bold text-foreground">Project Locked</h2>
                  <p className="mt-3 text-muted-foreground">
                    This project is locked because your {isPro ? "60-day" : "7-day"} window has ended.
                  </p>
                  <div className="mt-4 flex items-center justify-center gap-2 text-sm font-bold text-red-600">
                    <Trash2 size={16} />
                    PERMANENT DELETION IN {deletionLeft.days} {deletionLeft.days === 1 ? 'DAY' : 'DAYS'}
                  </div>
                  <div className="mt-8 flex flex-col gap-3">
                    {!isPro && (
                      <Button asChild className="w-full py-6 text-lg font-bold shadow-lg shadow-primary/20">
                        <Link to="/pricing">
                          <Sparkles className="mr-2 h-5 w-5" /> Upgrade to Pro to Unlock
                        </Link>
                      </Button>
                    )}
                    {isPro && (
                      <Button asChild className="w-full py-6 text-lg font-bold shadow-lg shadow-primary/20">
                        <Link to="/support">
                          <MessageCircle className="mr-2 h-5 w-5" /> Request Extension
                        </Link>
                      </Button>
                    )}
                    <Button variant="outline" onClick={() => setActiveTab("overview")} className="w-full">
                      View Overview & Policy
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className={isLocked && activeTab !== "overview" ? "pointer-events-none blur-[2px]" : ""}>
              {activeTab === "overview" && <OverviewTab project={project} onUpdate={handleUpdateProject} />}
              {activeTab === "renamer" && <FileRenamerTab />}
              {activeTab === "files" && <FilesTab project={project} files={files} setFiles={setFiles} comments={comments} setComments={setComments} selectedFile={selectedFile} setSelectedFile={setSelectedFile} />}
              {activeTab === "revisions" && <RevisionsTab files={files} comments={comments} setComments={setComments} />}
              {activeTab === "delivery" && <DeliveryTab project={project} />}
              {activeTab === "invoice" && <InvoiceTab project={project} />}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ProjectWorkspace;