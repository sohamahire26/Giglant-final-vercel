import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FileEdit, MessageSquare, Send, Receipt, Clock, ArrowRight, Zap, Shield, Sparkles, Users } from "lucide-react";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import FAQSection from "@/components/FAQSection";
import { Button } from "@/components/ui/button";

const tools = [
  { name: "File Renamer", description: "Smart file renaming with auto-detection and numbering. Organize your editing pipeline instantly.", icon: FileEdit, href: "/tools/file-renamer", color: "bg-primary/10 text-primary" },
  { name: "Revision Notes Formatter", description: "Turn messy client feedback into clean, actionable revision lists for your post production workflow.", icon: MessageSquare, href: "/tools/revision-notes-formatter", color: "bg-blue-500/10 text-blue-600" },
  { name: "Delivery Message Generator", description: "Generate professional client delivery workflow messages in seconds.", icon: Send, href: "/tools/delivery-message-generator", color: "bg-emerald-500/10 text-emerald-600" },
  { name: "Invoice Message Helper", description: "Create invoice messages and payment reminders for your freelancer workflow.", icon: Receipt, href: "/tools/invoice-message-helper", color: "bg-amber-500/10 text-amber-600" },
  { name: "Timestamp Feedback Tool", description: "Upload videos, share with clients, get timestamped feedback for your video editing workflow.", icon: Clock, href: "/tools/timestamp-feedback-tool", color: "bg-purple-500/10 text-purple-600" },
];

const features = [
  { icon: Zap, title: "Built for Speed", description: "No signups. No downloads. Tools that respect your time and fit your editing pipeline." },
  { icon: Shield, title: "Privacy First", description: "Your files stay on your device. Nothing is uploaded — critical for client delivery workflow privacy." },
  { icon: Sparkles, title: "Smart Defaults", description: "Designed around real freelancer workflow needs — not generic utility tools." },
  { icon: Users, title: "For Creators", description: "Made specifically for video editors, designers, and freelancers in post production workflow." },
];

const audiences = [
  { title: "Video Editors", description: "Manage your video editing workflow — revisions, timestamps, and project delivery all in one place." },
  { title: "Graphic Designers", description: "Streamline your content workflow — rename assets, organize deliverables, and communicate clearly." },
  { title: "Freelancers", description: "Optimize your freelancer workflow — invoices, feedback, and client delivery made effortless." },
];

const homeFAQ = [
  { question: "Is Giglant free to use?", answer: "Yes! All tools on Giglant are completely free. We build smart tools for video editing workflow, freelancer workflow, and content workflow — no hidden costs." },
  { question: "Are my files safe?", answer: "Absolutely. Your files are processed directly in your browser. We don't upload, store, or access any of your files — essential for secure client delivery workflow." },
  { question: "Do I need to create an account?", answer: "No. You can use all tools without signing up. Just open the tool and start optimizing your editing pipeline." },
  { question: "What tools does Giglant offer for video editing workflow?", answer: "File Renamer with auto-numbering, Timestamp Feedback Tool for video reviews, Revision Notes Formatter, Delivery Message Generator, and Invoice Message Helper — all designed for post production workflow." },
  { question: "How does the Timestamp Feedback Tool improve my freelancer workflow?", answer: "Upload your video, share a link with your client, and receive precise timestamped comments. No more scattered feedback in emails — everything organized for your editing pipeline." },
  { question: "Is there a file size limit?", answer: "Browser-based tools have no server limits. The Timestamp Feedback Tool supports videos up to 500MB for your video export workflow." },
  { question: "Will you add more tools for content workflow?", answer: "Yes! We're constantly building new tools based on real freelancer workflow needs. Follow our blog for updates on new editing pipeline tools." },
  { question: "Can I use Giglant on mobile?", answer: "Giglant is fully responsive and works on all devices — manage your file management workflow from anywhere." },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const Index = () => (
  <Layout>
    <SEOHead
      title="Giglant — Smart Tools for Video Editing Workflow & Freelancers"
      description="Smart online tools for video editing workflow, freelancer workflow, and post production. File renaming, video review, revision tracking, and client delivery workflow tools. Free and browser-based."
    />

    {/* Hero */}
    <section className="hero-bg pattern-dots relative overflow-hidden">
      <div className="container-tight flex flex-col items-center px-4 py-20 text-center md:py-32">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }} className="mb-8">
          <video src="/animated-logo.mp4" autoPlay muted playsInline className="mx-auto h-48 w-auto md:h-[16.8rem]" />
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="font-display text-4xl font-bold leading-tight text-foreground md:text-6xl lg:text-7xl">
          Work faster.{" "}<span className="text-primary">Deliver better.</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
          Smart tools for your video editing workflow, freelancer workflow, and post production pipeline. Rename files, get timestamped video feedback, generate messages — all in your browser.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-8 flex flex-wrap gap-4">
          <Button variant="hero" asChild><Link to="/tools">Explore Tools</Link></Button>
          <Button variant="hero-outline" asChild><Link to="/about">Learn More</Link></Button>
        </motion.div>
      </div>
    </section>

    {/* Tools */}
    <section className="section-padding">
      <div className="container-tight">
        <div className="mb-12 text-center">
          <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">Tools That Fit Your Editing Pipeline</h2>
          <p className="mt-3 text-lg text-muted-foreground">Every tool solves a real problem in your video editing workflow and freelancer workflow.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool, i) => (
            <motion.div key={tool.name} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <Link to={tool.href} className="group flex flex-col rounded-2xl border border-border bg-card p-6 transition-all hover:card-shadow-hover card-shadow">
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${tool.color}`}><tool.icon className="h-6 w-6" /></div>
                <h3 className="font-display text-lg font-semibold text-foreground">{tool.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{tool.description}</p>
                <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">Try it <ArrowRight className="h-4 w-4" /></div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Features */}
    <section className="section-padding warm-surface">
      <div className="container-tight">
        <div className="mb-12 text-center">
          <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">Why Giglant for Your Content Workflow?</h2>
          <p className="mt-3 text-lg text-muted-foreground">Built different because freelancers deserve better post production workflow tools.</p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <motion.div key={f.title} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"><f.icon className="h-7 w-7" /></div>
              <h3 className="font-display text-lg font-semibold text-foreground">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Audiences */}
    <section className="section-padding">
      <div className="container-tight">
        <div className="mb-12 text-center">
          <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">Who Is This For?</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {audiences.map((a, i) => (
            <motion.div key={a.title} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
              className="rounded-2xl border border-border bg-card p-8 text-center card-shadow">
              <h3 className="font-display text-xl font-bold text-foreground">{a.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{a.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Blog */}
    <section className="section-padding warm-surface">
      <div className="container-tight text-center">
        <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">From the Blog</h2>
        <p className="mt-3 text-lg text-muted-foreground">Tips, guides, and resources for your video editing workflow and freelancer workflow.</p>
        <div className="mt-8">
          <Button variant="hero-outline" asChild>
            <Link to="/blog">Visit Blog <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </div>
      </div>
    </section>

    <FAQSection title="Frequently Asked Questions — Video Editing Workflow" subtitle="Everything you need to know about Giglant's tools for your editing pipeline." items={homeFAQ} />

    {/* CTA */}
    <section className="section-padding">
      <div className="container-tight">
        <div className="rounded-3xl bg-foreground p-12 text-center md:p-16">
          <h2 className="font-display text-3xl font-bold text-background md:text-4xl">Ready to Optimize Your Freelancer Workflow?</h2>
          <p className="mt-4 text-lg text-background/70">Start using Giglant's free tools for video editing workflow, post production, and client delivery. No signup needed.</p>
          <div className="mt-8"><Button variant="hero" asChild><Link to="/tools">Get Started — It's Free</Link></Button></div>
        </div>
      </div>
    </section>
  </Layout>
);

export default Index;
