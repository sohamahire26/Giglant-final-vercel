import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

const footerLinks = {
  Tools: [
    { name: "File Renamer", href: "/tools/file-renamer" },
  ],
  Company: [
    { name: "About", href: "/about" },
    { name: "Blog", href: "/blog" },
    { name: "Contact", href: "/contact" },
    { name: "FAQ", href: "/faq" },
  ],
  Legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Disclaimer", href: "/disclaimer" },
    { name: "Cookie Policy", href: "/cookie-policy" },
  ],
};

const Footer = () => (
  <footer className="border-t border-border bg-card">
    <div className="container-tight section-padding">
      <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link to="/" className="mb-4 inline-block">
            <img src={logo} alt="Giglant — Video Editing Workflow Tools" className="h-40 w-auto" />
          </Link>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Smart tools for video editing workflow, freelancer workflow, and post production. Streamline your editing pipeline and client delivery workflow.
          </p>
        </div>
        {Object.entries(footerLinks).map(([category, links]) => (
          <div key={category}>
            <h4 className="mb-4 font-display text-sm font-semibold text-foreground">{category}</h4>
            <ul className="space-y-2.5">
              {links.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-sm text-muted-foreground transition-colors hover:text-primary">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-12 border-t border-border pt-8 text-center">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Giglant. Smart tools for video editing workflow, freelancer workflow, and content workflow. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;