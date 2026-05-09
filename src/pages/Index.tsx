"use client";

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FileEdit, ArrowRight, Send, Receipt, Calendar, Clock, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import FAQSection from "@/components/FAQSection";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { getBlogPosts } from "@/lib/api";
import logo from "@/assets/logo.png";

const tools = [
  { 
    name: "File Renamer", 
    description: "Professional file renaming with numbering. Organize your editing pipeline instantly.", 
    icon: FileEdit, 
    href: "/tools/file-renamer", 
    color: "bg-primary/10 text-primary" 
  },
  { 
    name: "Delivery Assistant", 
    description: "Generate professional hand-off messages for your clients.", 
    icon: Send, 
    href: "/dashboard", 
    color: "bg-primary/10 text-primary" 
  },
  { 
    name: "Payment Generator", 
    description: "Create polite but firm payment requests and reminders.", 
    icon: Receipt, 
    href: "/tools/payment-generator", 
    color: "bg-primary/10 text-primary" 
  },
];

const homeFAQ = [
  { 
    question: "Is Giglant free to use?", 
    answer: "Yes! Basic tools like the File Renamer are completely free. For project workspaces, we offer a generous Free tier with one lifetime project, and a Pro plan for unlimited workspaces." 
  },
  { 
    question: "How does the 'Magic Link' work?", 
    answer: "When you create a project, you get a unique shareable link. Your client can open this link to view your files and leave feedback instantly—no login required for them." 
  },
  { 
    question: "Are my files stored on your servers?", 
    answer: "For browser-based tools, no. For the workspace, we only store the Google Drive links and comments. Your actual video and image files remain securely on your own Google Drive." 
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const Index = () => {
  const { session } = useAuth();
  
  const { data: recentPosts } = useQuery({
    queryKey: ["recent-posts"],
    queryFn: () => getBlogPosts(),
    select: (data) => data?.slice(0, 3) || [],
  });

  const homeJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Giglant",
    "description": "Professional tools for video editing workflow, freelancer workflow, and post production pipeline.",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };

  return (
    <Layout>
      <SEOHead
        title="Giglant — Professional Tools for Video Editing Workflow & Freelancers"
        description="Optimize your video editing workflow with Giglant. Professional tools for file renaming, video review, revision tracking, and client delivery. Free and browser-based."
        jsonLd={homeJsonLd}
      />

      {/* Hero */}
      <section className="hero-bg pattern-dots relative overflow-hidden">
        <div className="container-tight flex flex-col items-center px-4 py-20 text-center md:py-32">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 0.6 }} 
            className="mb-8 relative"
          >
            <video 
              autoPlay 
              muted 
              playsInline 
              preload="auto"
              className="mx-auto h-48 w-auto md:h-[16.8rem] pointer-events-none relative z-10" 
            >
              {/* WebM for Chrome, Firefox, Edge */}
              <source 
                src="dyad-media://media/Giglant-final-vercel/.dyad/media/fd4c21621ae033b8a35b19ce099fa7eb.webm" 
                type="video/webm" 
              />
              {/* HEVC for Safari/iOS */}
              <source 
                src="dyad-media://media/Giglant-final-vercel/.dyad/media/9259f60c60bc134d45861798c57465ed.mp4" 
                type="video/mp4; codecs='hvc1'" 
              />
              {/* Final static fallback */}
              <img 
                src={logo} 
                alt="Giglant Logo" 
                className="mx-auto h-48 w-auto md:h-[16.8rem]" 
              />
            </video>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2 }}
            className="font-display text-4xl font-bold leading-tight text-foreground md:text-6xl lg:text-7xl"
          >
            Work faster.{" "}<span className="text-primary">Deliver better.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.35 }}
            className="mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl"
          >
            Professional tools for your video editing workflow, freelancer workflow, and post production pipeline. Rename files, get timestamped video feedback, generate messages — all in your browser.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.5 }} 
            className="mt-8 flex flex-wrap gap-4"
          >
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

      {/* Recent Blog Posts Section */}
      {recentPosts && recentPosts.length > 0 && (
        <section className="section-padding bg-muted/30">
          <div className="container-tight">
            <div className="mb-12 flex items-end justify-between">
              <div>
                <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-2">
                  <Sparkles size={14} />
                  <span>Insights & Guides</span>
                </div>
                <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">Latest from the Blog</h2>
                <p className="mt-3 text-lg text-muted-foreground">Workflow tips and industry insights for creators.</p>
              </div>
              <Button asChild variant="ghost" className="hidden md:flex hover:text-primary">
                <Link to="/blog">View All Posts <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {recentPosts.map((post: any, i: number) => (
                <motion.div key={post.id} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                  <Link to={`/blog/${post.category}/${post.slug}`} className="group block overflow-hidden rounded-2xl border border-border bg-card transition-all hover:card-shadow-hover card-shadow">
                    <div className="aspect-video overflow-hidden">
                      <img src={post.cover_image_url || "/placeholder.svg"} alt={post.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    </div>
                    <div className="p-6">
                      <div className="mb-3 flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-primary">
                        {post.category.replace(/-/g, " ")}
                      </div>
                      <h3 className="font-display text-xl font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                        {post.title}
                      </h3>
                      <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(post.created_at).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {Math.ceil(post.content.split(" ").length / 200)} min read</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
            <div className="mt-10 text-center md:hidden">
              <Button asChild variant="outline" className="w-full">
                <Link to="/blog">View All Posts</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

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