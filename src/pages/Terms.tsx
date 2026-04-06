import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";

const TermsPage = () => (
  <Layout>
    <SEOHead
      title="Terms of Service — Giglant Video Editing Workflow Tools"
      description="Read Giglant's terms of service for using our free video editing workflow tools, freelancer workflow solutions, and post production pipeline utilities."
    />
    <section className="section-padding">
      <div className="container-tight max-w-3xl">
        <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl mb-8">Terms of Service</h1>
        <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
          <p><strong className="text-foreground">Last updated:</strong> March 2026</p>
          <h2 className="font-display text-xl font-bold text-foreground">1. Acceptance of Terms</h2>
          <p>By using Giglant's video editing workflow and freelancer workflow tools, you agree to these terms. If you don't agree, please don't use our services.</p>
          <h2 className="font-display text-xl font-bold text-foreground">2. Use of Services</h2>
          <p>Giglant provides free online tools for video editing workflow, post production workflow, file management workflow, and freelancer workflow improvement. You may use these tools for personal and commercial purposes in your editing pipeline.</p>
          <h2 className="font-display text-xl font-bold text-foreground">3. Video Upload & Sharing</h2>
          <p>When using the Timestamp Feedback Tool, you are responsible for ensuring you have the right to upload and share the videos. Do not upload content that violates copyright or intellectual property rights in your client delivery workflow.</p>
          <h2 className="font-display text-xl font-bold text-foreground">4. No Warranties</h2>
          <p>Tools are provided "as is" without warranties of any kind. We don't guarantee uninterrupted or error-free operation of our content workflow tools.</p>
          <h2 className="font-display text-xl font-bold text-foreground">5. Limitation of Liability</h2>
          <p>Giglant is not liable for any damages arising from the use of our video editing workflow tools. Use at your own risk.</p>
          <h2 className="font-display text-xl font-bold text-foreground">6. Changes</h2>
          <p>We may modify these terms at any time as we evolve our editing pipeline tools. Continued use constitutes acceptance.</p>
          <h2 className="font-display text-xl font-bold text-foreground">7. Contact</h2>
          <p>Questions about these terms? Contact us at hello@giglant.com.</p>
        </div>
      </div>
    </section>
  </Layout>
);

export default TermsPage;
