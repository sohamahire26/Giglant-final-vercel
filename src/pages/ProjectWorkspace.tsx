"use client";

import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { Trash2, Loader2, FolderOpen, MessageSquare, CheckSquare, Send, Receipt, HelpCircle, FileEdit } from "lucide-react";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Project, ProjectFile, FileComment } from "@/components/workspace/types";
import OverviewTab from "@/components/workspace/OverviewTab";
import FilesTab from "@/components/workspace/FilesTab";
import RevisionsTab from "@/components/workspace/RevisionsTab";
import DeliveryTab from "@/components/workspace/DeliveryTab";
import InvoiceTab from "@/components/workspace/InvoiceTab";
import FileRenamerTab from "@/components/workspace/FileRenamerTab";
import TutorialTour, { TourStep } from "@/components/workspace/TutorialTour";

const db = supabase as any;

const freelancerSteps: TourStep[] = [
  { title: "Welcome to Your Workspace! 🚀", desc: "This is where you manage your entire client project. Let's walk through the tools that will save you hours of work." },
  { targetId: "ws-share-card", title: "The Magic Link 🔗", desc: "This is your most important tool. Copy this link and send it to your client. They can view files and leave feedback instantly—no login required for them!" },
  { targetId: "ws-renamer-tab-btn", title: "Smart File Renamer 📝", desc: "Use our free Smart File Renamer tool to clean up messy filenames before uploading. It auto-detects document types and organizes files with proper naming." },
  { targetId: "ws-files-tab-btn", title: "Files & Feedback 📁", desc: "Upload your work here by pasting Google Drive links. Select the file type (Video/Audio gets timestamp feedback, others get standard comments). We'll generate a professional preview for your client." },
  { targetId: "ws-revisions-tab-btn", title: "Revision Checklist ✅", desc: "Once your client leaves feedback, it all appears here as an organized checklist. Mark items as resolved as you work through them." },
  { targetId: "ws-delivery-tab-btn", title: "Smart Delivery ✉️", desc: "Ready to send a draft or final version? Use this to generate professional, psychology-backed messages that make you look like a pro." },
  { targetId: "ws-invoice-tab-btn", title: "Get Paid Faster 💰", desc: "Generate polite but firm invoice messages and payment reminders. No more awkward 'where is my money' emails." },
];

const tabs = [
  { id: "overview", label: "Overview", icon: FolderOpen },
  { id: "renamer", label: "File Renamer", icon: FileEdit },
  { id: "files", label: "Files & Feedback", icon: MessageSquare },
  { id: "revisions", label: "Revisions", icon: CheckSquare },
  { id: "delivery", label: "Delivery", icon: Send },
  { id: "invoice", label: "Invoice", icon: Receipt },
];

const ProjectWorkspace = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [project, setProject] = useState<Project | null>(null);
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [comments, setComments] = useState<FileComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    // Only show tutorial if it's a newly created project
    if (location.state?.isNew) {
      setShowTutorial(true);
    }
  }, [location.state]);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      const { data: proj } = await db.from("projects").select("*").eq("id", id).single();
      if (!proj) { setLoading(false); return; }
      setProject(proj);
      const { data: f } = await db.from("project_files").select("*").eq("project_id", id).order("sort_order");
      setFiles(f || []);
      if (f?.length) {
        const { data: c } = await db.from("file_comments").select("*").in("file_id", f.map((x: ProjectFile) => x.id)).order("created_at");
        setComments(c || []);
      }
      setLoading(false);
    };
    load();
  }, [id]);

  useEffect(() => {
    if (!files.length) return;
    const channel = supabase.channel("ws-comments")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "file_comments" }, (payload) => {
        setComments(prev => prev.find(c => c.id === (payload.new as any).id) ? prev : [...prev, payload.new as FileComment]);
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [files]);

  const handleDeleteProject = async () => {
    if (!project || !confirm("Delete this project and all its data? This cannot be undone.")) return;
    await db.from("projects").delete().eq("id", project.id);
    window.location.href = "/dashboard";
  };

  const handleStartTutorial = () => {
    setTutorialStep(0);
    setShowTutorial(true);
  };

  const dismissTutorial = () => { 
    setShowTutorial(false); 
  };

  if (loading) return <Layout><div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></Layout>;

  if (!project) return (
    <Layout><div className="flex min-h-[60vh] items-center justify-center flex-col gap-4">
      <h1 className="text-2xl font-bold text-foreground">Project Not Found</h1>
      <Button asChild><Link to="/projects/new">Create New Project</Link></Button>
    </div></Layout>
  );

  return (
    <Layout>
      <SEOHead title={`${project.name} — Giglant`} description="Project workspace for managing files, feedback, delivery, and invoices." />

      {showTutorial && (
        <TutorialTour 
          steps={freelancerSteps} 
          currentStep={tutorialStep} 
          onNext={() => setTutorialStep(s => s + 1)}
          onBack={() => setTutorialStep(s => s - 1)}
          onDismiss={dismissTutorial} 
        />
      )}

      <section className="section-padding">
        <div className="container-tight">
          <div className="mb-6 flex items-center justify-between flex-wrap gap-2">
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">{project.name}</h1>
              {project.client_name && <p className="text-sm text-muted-foreground">Client: {project.client_name}</p>}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleStartTutorial} className="text-primary border-primary/30 hover:bg-primary/5">
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
                <tab.icon className="h-4 w-4" /> {tab.label}
              </button>
            ))}
          </div>

          <div className="min-h-[400px]">
            {activeTab === "overview" && <OverviewTab project={project} files={files} comments={comments} />}
            {activeTab === "renamer" && <FileRenamerTab />}
            {activeTab === "files" && <FilesTab project={project} files={files} setFiles={setFiles} comments={comments} setComments={setComments} selectedFile={selectedFile} setSelectedFile={setSelectedFile} />}
            {activeTab === "revisions" && <RevisionsTab files={files} comments={comments} setComments={setComments} />}
            {activeTab === "delivery" && <DeliveryTab project={project} />}
            {activeTab === "invoice" && <InvoiceTab project={project} />}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ProjectWorkspace;