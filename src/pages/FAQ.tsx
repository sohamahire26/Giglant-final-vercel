import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import FAQSection from "@/components/FAQSection";

const faqItems = [
  { question: "What is Giglant?", answer: "Giglant is a suite of professional tools designed for video editors and freelancers to streamline their workflow, from file renaming to client feedback and delivery." },
  { question: "Is Giglant free?", answer: "Yes! We offer free browser-based tools and a Free tier for project workspaces. For power users, our Pro plan offers unlimited workspaces and extended retention." },
  { question: "How do project workspaces work?", answer: "A workspace allows you to group files for a specific project, share a review link with your client, collect timestamped feedback, and manage a revision checklist." },
  { question: "What is the 'Lifetime Project' limit on the Free plan?", answer: "Free accounts can create one project workspace in their lifetime. Once created, it counts toward the limit even if deleted. Pro users have no such limits." },
  { question: "How long do projects stay active?", answer: "Free projects are locked after 7 days. Pro projects stay active as long as your subscription is live, with a 60-day grace period if it ends." },
  { question: "Do my clients need an account to leave feedback?", answer: "No. Your clients use a 'Magic Link' to access the review page. They can watch videos and leave comments instantly without signing up." },
  { question: "Is my data secure?", answer: "Yes. We don't store your actual video or image files. We only store the Google Drive links and the comments. Your content stays on your Drive." },
  { question: "What file types are supported for timestamps?", answer: "Video and Audio files support frame-accurate timestamped feedback. Images and PDFs support standard comments." },
  { question: "How does the File Renamer work?", answer: "It's a browser-based tool that cleans up messy filenames, categorizes them (Video, Photo, etc.), and adds sequential numbering for better organization." },
  { question: "Can I use Giglant on mobile?", answer: "Yes, the entire platform is fully responsive. You can manage your projects and clients can leave feedback from any device." },
  { question: "What is the Delivery Assistant?", answer: "It's a tool that helps you craft professional emails or messages when sending drafts or final versions to your clients, ensuring a consistent brand voice." },
  { question: "How do I get paid using Giglant?", answer: "Our Payment Generator helps you create professional payment requests and reminders based on proven templates to help you get paid faster." },
  { question: "What happens if I upgrade to Pro?", answer: "Upgrading unlocks unlimited project creations, removes the 7-day locking period, and gives you access to advanced features like the Invoice assistant." },
  { question: "How do I contact support?", answer: "Use the support page." },
];

const FAQPage = () => {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqItems.map(item => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }))
  };

  return (
    <Layout>
      <SEOHead
        title="FAQ — Video Editing Workflow & Freelancer Tools Questions | Giglant"
        description="Find answers about Giglant's free video editing workflow tools, freelancer workflow solutions, post production tools, and file management. Privacy, features, and usage."
        jsonLd={faqJsonLd}
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
};

export default FAQPage;