import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FileEdit, MessageSquare, Send, Receipt, Clock, ArrowRight, Zap, Shield, Sparkles, Users } from "lucide-react";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import FAQSection from "@/components/FAQSection";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";

const tools = [
  { name: "File Renamer", description: "Smart file renaming with auto-detection and numbering. Organize your editing pipeline instantly.", icon: FileEdit, href: "/tools/file-renamer", color: "bg-primary/10 text-primary" },
  { name: "Revision Notes Formatter", description: "Turn messy client feedback into clean, actionable revision lists for your post production workflow.", icon: MessageSquare, href: "/tools/revision-notes-formatter", color: "bg-blue-500/10 text-blue-600" },
  { name: "Delivery Message Generator", description: "Generate professional client delivery workflow messages in seconds.", icon: Send, href: "/tools/delivery-message-generator", color: "bg-emerald-500/10 text-emerald-600" },
  { name: "Invoice Message Helper", description: "Create invoice messages and payment reminders for your freelancer workflow.", icon: Receipt, href: "/tools/invoice-message-helper", color: "bg-amber-500/10 text-amber-600" },
  { name: "Timestamp Feedback Tool", description: "Upload videos, share with clients, get timestamped feedback for your video editing workflow.", icon: Clock, href: "/tools/timestamp-feedback-tool", color: "bg-purple-500/10 text-purple-600" },
];

const homeFAQ = [
  { question: "Is Giglant free to use?", answer: "Yes! All tools on Giglant are completely free. We build smart tools for video editing workflow, freelancer workflow, and content workflow — no hidden costs." },
  { question: "Are my files safe?", answer: "Absolutely. Your files are processed directly in your browser. We don't upload, store, or access any of your files — essential for secure client delivery workflow." },
  { question: "Do I need to create an account?", answer: "You can use basic tools without an account, but creating one allows you to save projects, track revisions, and manage client feedback in a private workspace." },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const Index = () => {
  const { session } = useAuth();

  return (
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
            {session ? (
              <Button variant="hero" asChild><Link to="/dashboard">Go to Dashboard</Link></Button>
            ) : (
              <Button variant="hero" asChild><Link to="/login">Get Started for Free</Link></Button>
            )}
            <Button variant="hero-outline" asChild><Link to="/tools">Explore Tools</Link></Button>
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

      <FAQSection title="Frequently Asked Questions" items={homeFAQ} />

      {/* CTA */}
      <section className="section-padding">
        <div className="container-tight">
          <div className="rounded-3xl bg-foreground p-12 text-center md:p-16">
            <h2 className="font-display text-3xl font-bold text-background md:text-4xl">Ready to Optimize Your Freelancer Workflow?</h2>
            <p className="mt-4 text-lg text-background/70">Start using Giglant's free tools for video editing workflow, post production, and client delivery.</p>
            <div className="mt-8">
              {session ? (
                <Button variant="hero" asChild><Link to="/dashboard">Go to Dashboard</Link></Button>
              ) : (
                <Button variant="hero" asChild><Link to="/login">Sign Up Now — It's Free</Link></Button>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;