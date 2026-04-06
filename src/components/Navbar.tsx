import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Menu, X, ChevronDown, User as UserIcon } from "lucide-react";
import logo from "@/assets/logo.png";
import { useAuth } from "./AuthProvider";

const tools = [
  { name: "File Renamer", href: "/tools/file-renamer" },
  { name: "Revision Notes Formatter", href: "/tools/revision-notes-formatter" },
  { name: "Delivery Message Generator", href: "/tools/delivery-message-generator" },
  { name: "Invoice Message Helper", href: "/tools/invoice-message-helper" },
  { name: "Timestamp Feedback Tool", href: "/tools/timestamp-feedback-tool" },
];

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Projects", href: "/projects/new" },
  { name: "Tools", href: "/tools", children: tools },
  { name: "Blog", href: "/blog" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const location = useLocation();
  const { session } = useAuth();

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="container-tight flex h-24 items-center justify-between px-4 md:px-8">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Giglant" className="h-40 w-auto" />
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) =>
            link.children ? (
              <div key={link.name} className="relative group">
                <Link
                  to={link.href}
                  className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary ${location.pathname.startsWith("/tools") ? "text-primary" : "text-foreground"}`}
                >
                  {link.name}
                  <ChevronDown className="h-3.5 w-3.5" />
                </Link>
                <div className="invisible absolute left-0 top-full w-60 rounded-lg border border-border bg-card p-2 opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100">
                  {link.children.map((child) => (
                    <Link
                      key={child.href}
                      to={child.href}
                      className="block rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link
                key={link.name}
                to={link.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary ${location.pathname === link.href ? "text-primary" : "text-foreground"}`}
              >
                {link.name}
              </Link>
            )
          )}
          
          <div className="ml-4 flex items-center gap-2 border-l border-border pl-4">
            {session ? (
              <Link to="/profile" className="flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary/80">
                <UserIcon size={16} />
                Profile
              </Link>
            ) : (
              <Link to="/login" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                Sign In
              </Link>
            )}
          </div>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-lg p-2 text-foreground md:hidden hover:bg-secondary"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border bg-background px-4 py-4 md:hidden">
          {navLinks.map((link) =>
            link.children ? (
              <div key={link.name}>
                <button
                  onClick={() => setToolsOpen(!toolsOpen)}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-secondary"
                >
                  {link.name}
                  <ChevronDown className={`h-4 w-4 transition-transform ${toolsOpen ? "rotate-180" : ""}`} />
                </button>
                {toolsOpen && (
                  <div className="ml-4">
                    {link.children.map((child) => (
                      <Link
                        key={child.href}
                        to={child.href}
                        onClick={() => setMobileOpen(false)}
                        className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-secondary"
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={link.name}
                to={link.href}
                onClick={() => setMobileOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-secondary"
              >
                {link.name}
              </Link>
            )
          )}
          <div className="mt-4 border-t border-border pt-4">
            {session ? (
              <Link
                to="/profile"
                onClick={() => setMobileOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-secondary px-3 py-2.5 text-sm font-medium text-foreground"
              >
                <UserIcon size={16} />
                Profile
              </Link>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="flex w-full items-center justify-center rounded-lg bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;