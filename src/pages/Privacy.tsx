import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";

const PrivacyPage = () => (
  <Layout>
    <SEOHead
      title="Privacy Policy — Giglant Video Editing Workflow Tools"
      description="Read Giglant's privacy policy. Learn how we protect your data and ensure privacy across our video editing workflow, freelancer workflow, and file management tools."
    />
    <section className="section-padding">
      <div className="container-tight max-w-3xl">
        <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl mb-8">Privacy Policy</h1>
        <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
          <p><strong className="text-foreground">Last updated:</strong> March 2026</p>
          <h2 className="font-display text-xl font-bold text-foreground">1. Information We Collect</h2>
          <p>Giglant's browser-based tools (File Renamer, Revision Notes Formatter, Delivery Message Generator, Invoice Message Helper) do not collect, store, or process personal data. All processing runs entirely in your browser, keeping your video editing workflow and file management workflow private.</p>
          <p>The Timestamp Feedback Tool uploads videos to our servers for sharing purposes. Videos are accessible only via unique share links and are not indexed or publicly discoverable.</p>
          <h2 className="font-display text-xl font-bold text-foreground">2. Cookies</h2>
          <p>We may use minimal, essential cookies for site functionality. We do not use tracking cookies or third-party analytics that collect personal information about your freelancer workflow.</p>
          <h2 className="font-display text-xl font-bold text-foreground">3. Third-Party Services</h2>
          <p>We use cloud storage services for the Timestamp Feedback Tool's video hosting. These services maintain their own privacy policies and security standards appropriate for post production workflow data.</p>
          <h2 className="font-display text-xl font-bold text-foreground">4. Data Security</h2>
          <p>For browser-based tools, your files never leave your device — there's nothing to breach. For the Timestamp Feedback Tool, videos are stored securely with access controlled by unique share tokens, ensuring your client delivery workflow remains private.</p>
          <h2 className="font-display text-xl font-bold text-foreground">5. Changes to This Policy</h2>
          <p>We may update this privacy policy as we add new tools to support your editing pipeline and content workflow. Any changes will be posted on this page.</p>
          <h2 className="font-display text-xl font-bold text-foreground">6. Contact</h2>
          <p>If you have questions about this privacy policy or how our video editing workflow tools handle your data, contact us at hello@giglant.com.</p>
        </div>
      </div>
    </section>
  </Layout>
);

export default PrivacyPage;
