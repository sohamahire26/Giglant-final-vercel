import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import FAQSection from "@/components/FAQSection";
import logo from "@/assets/logo.png";

const aboutFAQ = [
  { question: "Why was Giglant built?", answer: "Giglant was created to solve the 'messy' parts of freelancing—vague feedback, disorganized files, and awkward payment requests. We want to give creators professional tools that just work." },
  { question: "Who is Giglant for?", answer: "It's built specifically for video editors, graphic designers, and digital freelancers who handle client-based projects and need a better way to manage their pipeline." },
  { question: "Is Giglant a company?", answer: "Giglant is a platform built by creators for creators. We are focused on building a suite of utilities that solve real-world post-production problems." },
  { question: "How can I contribute or suggest a tool?", answer: "We love feedback! You can use the Support page to send us suggestions. Many of our features come directly from user requests." },
];

const AboutPage = () => (
  <Layout>
    <SEOHead
      title="About Giglant — Professional Tools for Video Editing & Freelancer Workflow"
      description="Learn about Giglant's mission to build professional, free tools for video editing workflow, freelancer workflow, post production, and file management. Built for editors, designers, and creators."
    />
    <section className="section-padding">
      <div className="container-tight max-w-3xl">
        <div className="mb-8 text-center">
          <img src={logo} alt="Giglant — Video Editing Workflow Tools" className="mx-auto mb-6 h-40 w-auto" />
          <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl">About Giglant</h1>
          <p className="mt-4 text-lg text-muted-foreground">Professional tools for your video editing workflow. Work faster. Deliver better.</p>
        </div>
        <div className="space-y-6 text-muted-foreground leading-relaxed">
          <p>Giglant is a collection of professional online tools built for video editors, graphic designers, and freelancers who want to optimize their <strong className="text-foreground">video editing workflow</strong> and work more efficiently.</p>
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
          <p className="pt-4">Have questions or suggestions? Reach out to us through our support page.</p>
        </div>
      </div>
    </section>
    <FAQSection title="About Giglant — Freelancer Workflow FAQ" items={aboutFAQ} />
  </Layout>
);

export default AboutPage;