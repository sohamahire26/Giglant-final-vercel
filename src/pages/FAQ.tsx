import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import FAQSection from "@/components/FAQSection";

const faqItems = [
  { question: "Does Giglant collect my personal data?", answer: "No. We don't collect personal data. Tools run in your browser and no files or data are sent to our servers — essential for secure client delivery workflow." },
  { question: "Are my files stored on your servers?", answer: "No. All file processing happens locally in your browser. Files never leave your device. The only exception is the Timestamp Feedback Tool which uploads videos for client review sharing." },
  { question: "Is it safe to use Giglant with client files?", answer: "Yes. Since most processing is browser-based, your files remain on your device. Perfect for maintaining privacy in your freelancer workflow and post production workflow." },
  { question: "Do I need to create an account?", answer: "No. All tools are freely accessible without any signup or login — just open and optimize your editing pipeline." },
  { question: "Is Giglant free?", answer: "Yes! All current tools are completely free to use with no hidden charges. Built for real video editing workflow and content workflow needs." },
  { question: "Can I use Giglant on mobile?", answer: "Yes, Giglant is fully responsive and works on all devices. Manage your file management workflow from anywhere." },
  { question: "What tools does Giglant offer for video editing workflow?", answer: "File Renamer (auto-naming with numbering), Timestamp Feedback Tool (video review with clients), Revision Notes Formatter, Delivery Message Generator, and Invoice Message Helper — all built for your editing pipeline." },
  { question: "How does the Timestamp Feedback Tool work?", answer: "Upload your video, get a shareable link, send it to your client. They watch and add timestamped comments. You get an organized feedback report — streamlining your video editing workflow and client delivery workflow." },
  { question: "Will more tools be added?", answer: "Absolutely. We're continuously building new tools based on real freelancer workflow, post production workflow, and content workflow feedback." },
  { question: "What technology does Giglant use?", answer: "Giglant is built with modern web technologies (React, TypeScript) and runs primarily in your browser for maximum speed and privacy in your editing pipeline." },
  { question: "Are there file size limits?", answer: "Browser-based tools depend on your device's memory. The Timestamp Feedback Tool supports videos up to 500MB for your video export workflow." },
  { question: "Is there a usage limit?", answer: "No. You can use all tools as many times as you want, completely unlimited — perfect for high-volume freelancer workflow." },
  { question: "Will Giglant become paid?", answer: "We plan to keep a generous free tier forever. Premium features may be introduced in the future, but core video editing workflow tools will remain free." },
  { question: "Can I write blog posts on Giglant?", answer: "Yes! Visit the Blog section and click 'Write a Post' to create and publish articles about video editing workflow, freelancer tips, and more." },
];

const FAQPage = () => (
  <Layout>
    <SEOHead
      title="FAQ — Video Editing Workflow & Freelancer Tools Questions | Giglant"
      description="Find answers about Giglant's free video editing workflow tools, freelancer workflow solutions, post production tools, and file management. Privacy, features, and usage."
    />
    <section className="section-padding">
      <div className="container-tight max-w-3xl text-center">
        <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl">Frequently Asked Questions</h1>
        <p className="mt-4 text-lg text-muted-foreground">Everything you need to know about Giglant's video editing workflow and freelancer workflow tools.</p>
      </div>
    </section>
    <FAQSection items={faqItems} title="" />
  </Layout>
);

export default FAQPage;
