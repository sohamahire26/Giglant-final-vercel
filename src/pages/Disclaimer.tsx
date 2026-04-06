import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";

const DisclaimerPage = () => (
  <Layout>
    <SEOHead
      title="Disclaimer — Giglant Video Editing Workflow Tools"
      description="Read Giglant's disclaimer about video editing workflow tool usage, accuracy, and limitations for freelancer workflow and post production."
    />
    <section className="section-padding">
      <div className="container-tight max-w-3xl">
        <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl mb-8">Disclaimer</h1>
        <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
          <p><strong className="text-foreground">Last updated:</strong> March 2026</p>
          <h2 className="font-display text-xl font-bold text-foreground">General Disclaimer</h2>
          <p>The video editing workflow tools and information provided by Giglant are for general productivity purposes. While we strive for accuracy in our editing pipeline and content workflow tools, we make no guarantees about the completeness or reliability of results.</p>
          <h2 className="font-display text-xl font-bold text-foreground">File Processing</h2>
          <p>Our file management workflow tools process files in your browser. While we design for accuracy, always verify renamed files and generated messages before using them in your client delivery workflow.</p>
          <h2 className="font-display text-xl font-bold text-foreground">External Links</h2>
          <p>Our website may contain links to external sites relevant to video editing workflow and freelancer workflow. We're not responsible for their content or practices.</p>
          <h2 className="font-display text-xl font-bold text-foreground">Professional Advice</h2>
          <p>Giglant's post production workflow tools are not a substitute for professional advice. For legal, financial, or specialized matters in your freelancer workflow, consult a qualified professional.</p>
        </div>
      </div>
    </section>
  </Layout>
);

export default DisclaimerPage;
