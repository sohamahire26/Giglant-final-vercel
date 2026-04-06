import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import FAQSection from "@/components/FAQSection";
import logo from "@/assets/logo.png";

const aboutFAQ = [
  { question: "Who built Giglant?", answer: "Giglant is built by creators for creators. We understand the daily challenges in video editing workflow and freelancer workflow because we've been there." },
  { question: "Is Giglant a company?", answer: "Giglant is a growing platform of free tools built for post production workflow, content workflow, and file management. We're focused on building useful utilities before anything else." },
  { question: "How can I suggest a tool?", answer: "Visit our Contact page or email feedback@giglant.com! We build tools based on real freelancer workflow needs — from editing pipeline tools to client delivery workflow solutions." },
  { question: "What workflows does Giglant support?", answer: "Giglant supports video editing workflow, freelancer workflow, file management workflow, post production workflow, client delivery workflow, video export workflow, editing pipeline management, and content workflow optimization." },
];

const AboutPage = () => (
  <Layout>
    <SEOHead
      title="About Giglant — Smart Tools for Video Editing & Freelancer Workflow"
      description="Learn about Giglant's mission to build smart, free tools for video editing workflow, freelancer workflow, post production, and file management. Built for editors, designers, and creators."
    />
    <section className="section-padding">
      <div className="container-tight max-w-3xl">
        <div className="mb-8 text-center">
          <img src={logo} alt="Giglant — Video Editing Workflow Tools" className="mx-auto mb-6 h-40 w-auto" />
          <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl">About Giglant</h1>
          <p className="mt-4 text-lg text-muted-foreground">Smart tools for your video editing workflow. Work faster. Deliver better.</p>
        </div>
        <div className="space-y-6 text-muted-foreground leading-relaxed">
          <p>Giglant is a collection of smart online tools built for video editors, graphic designers, and freelancers who want to optimize their <strong className="text-foreground">video editing workflow</strong> and work more efficiently.</p>
          <p>We provide simple workflow utilities like file renaming tools, video review platforms, and editing support tools designed to remove repetitive work from your <strong className="text-foreground">editing pipeline</strong> and save time in your <strong className="text-foreground">post production workflow</strong>.</p>
          <p>Giglant focuses on practical tools that help creators manage files, speed up editing tasks, streamline <strong className="text-foreground">client delivery workflow</strong>, and improve their daily <strong className="text-foreground">content workflow</strong>. The platform is built to grow with more useful tools for freelancers, creators, and digital professionals.</p>
          <h2 className="font-display text-2xl font-bold text-foreground pt-4">Our Mission</h2>
          <p>We believe freelancers deserve better tools for their <strong className="text-foreground">freelancer workflow</strong> — tools that are free, fast, private, and designed around real workflows. Not generic utilities, but solutions to the problems creators face daily in their <strong className="text-foreground">video export workflow</strong> and <strong className="text-foreground">file management workflow</strong>.</p>
          <h2 className="font-display text-2xl font-bold text-foreground pt-4">Our Values</h2>
          <ul className="list-disc list-inside space-y-2">
            <li><strong className="text-foreground">Privacy First</strong> — Your files never leave your browser. Essential for secure <strong>client delivery workflow</strong>.</li>
            <li><strong className="text-foreground">Speed</strong> — No signups, no downloads, no friction in your <strong>editing pipeline</strong>.</li>
            <li><strong className="text-foreground">Real Workflows</strong> — Every tool solves a real <strong>post production workflow</strong> problem.</li>
            <li><strong className="text-foreground">Creator-Focused</strong> — Built by and for the creative community's <strong>content workflow</strong>.</li>
          </ul>
          <p className="pt-4">Have questions or suggestions? Reach out to us at <a href="mailto:hello@giglant.com" className="text-primary hover:underline">hello@giglant.com</a>.</p>
        </div>
      </div>
    </section>
    <FAQSection title="About Giglant — Freelancer Workflow FAQ" items={aboutFAQ} />
  </Layout>
);

export default AboutPage;