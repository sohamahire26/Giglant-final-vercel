import { useState } from "react";
import { Mail, MessageCircle } from "lucide-react";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import FAQSection from "@/components/FAQSection";
import { Button } from "@/components/ui/button";

const contactFAQ = [
  { question: "How can I suggest a new tool for my video editing workflow?", answer: "Use the contact form below to share your idea! We build tools based on real freelancer workflow and editing pipeline needs." },
  { question: "How quickly do you respond?", answer: "We aim to respond within 24-48 hours. For urgent matters related to your content workflow, please mention it in your message." },
  { question: "Can I request custom tools for my post production workflow?", answer: "We love hearing about specific workflow challenges. Share your use case and we'll consider building tools that help optimize your video editing workflow and client delivery workflow." },
];

const ContactPage = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <Layout>
      <SEOHead
        title="Contact Giglant — Video Editing Workflow & Freelancer Tools Support"
        description="Have a question about our video editing workflow tools? Suggest a new tool for your freelancer workflow or post production pipeline. Contact the Giglant team."
      />
      <section className="section-padding">
        <div className="container-tight max-w-2xl">
          <div className="mb-8 text-center">
            <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl">Contact Us</h1>
            <p className="mt-4 text-lg text-muted-foreground">Have a question about our video editing workflow tools? We'd love to hear from you.</p>
          </div>

          <div className="mb-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-6 text-center">
              <Mail className="mx-auto mb-3 h-8 w-8 text-primary" />
              <h3 className="font-display font-semibold text-foreground">Email</h3>
              <p className="mt-1 text-sm text-muted-foreground">hello@giglant.com</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-6 text-center">
              <MessageCircle className="mx-auto mb-3 h-8 w-8 text-primary" />
              <h3 className="font-display font-semibold text-foreground">Feedback</h3>
              <p className="mt-1 text-sm text-muted-foreground">Use the form below</p>
            </div>
          </div>

          {submitted ? (
            <div className="rounded-2xl border border-border bg-card p-12 text-center">
              <h2 className="font-display text-2xl font-bold text-foreground">Thanks for reaching out!</h2>
              <p className="mt-3 text-muted-foreground">We'll get back to you as soon as possible about your freelancer workflow needs.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-border bg-card p-6 md:p-8">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Name</label>
                <input type="text" required placeholder="Your name" className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
                <input type="email" required placeholder="you@email.com" className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Message</label>
                <textarea required rows={5} placeholder="Tell us about your video editing workflow needs..." className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none resize-none" />
              </div>
              <Button type="submit" className="w-full">Send Message</Button>
            </form>
          )}
        </div>
      </section>
      <FAQSection title="Contact FAQ — Freelancer Workflow" items={contactFAQ} />
    </Layout>
  );
};

export default ContactPage;
