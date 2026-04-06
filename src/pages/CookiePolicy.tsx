import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";

const CookiePolicyPage = () => (
  <Layout>
    <SEOHead
      title="Cookie Policy — Giglant Video Editing Workflow Tools"
      description="Learn about how Giglant uses cookies on its video editing workflow tools website. Minimal cookies for freelancer workflow tool functionality."
    />
    <section className="section-padding">
      <div className="container-tight max-w-3xl">
        <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl mb-8">Cookie Policy</h1>
        <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
          <p><strong className="text-foreground">Last updated:</strong> March 2026</p>
          <h2 className="font-display text-xl font-bold text-foreground">What Are Cookies?</h2>
          <p>Cookies are small text files stored on your device when you visit a website. They help our video editing workflow tools function properly and provide a better user experience for your editing pipeline.</p>
          <h2 className="font-display text-xl font-bold text-foreground">How We Use Cookies</h2>
          <p>Giglant uses only essential cookies required for basic site functionality. We do not use advertising cookies or third-party tracking cookies — your freelancer workflow stays private.</p>
          <h2 className="font-display text-xl font-bold text-foreground">Types of Cookies We Use</h2>
          <ul className="list-disc list-inside space-y-1">
            <li><strong className="text-foreground">Essential Cookies:</strong> Required for our post production workflow tools to function properly.</li>
          </ul>
          <h2 className="font-display text-xl font-bold text-foreground">Managing Cookies</h2>
          <p>You can control cookies through your browser settings. Disabling cookies may affect the functionality of our content workflow and file management workflow tools.</p>
          <h2 className="font-display text-xl font-bold text-foreground">Contact</h2>
          <p>Questions about our cookie policy? Contact us at hello@giglant.com.</p>
        </div>
      </div>
    </section>
  </Layout>
);

export default CookiePolicyPage;
