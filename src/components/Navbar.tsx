"use client";

import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu, X, ChevronDown, User as UserIcon, MessageSquare, History } from "lucide-react";
import logo from "@/assets/logo.png";
import { useAuth } from "./AuthProvider";
import { Button } from "./ui/button";
import { supabase } from "@/integrations/supabase/client";

const tools = [
  { name: "File Renamer", href: "/tools/file-renamer" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();
  const { session, user } = useAuth();

  useEffect(() => {
    if (session && user) {
      const checkUnread = async () => {
        try {
          const { count, error } = await supabase
            .from("support_tickets")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id)
            .not("reply", "is", null)
            .eq("is_read_by_user", false);

          if (!error) {
            setUnreadCount(count || 0);
          }
        } catch (err) {
          console.error(err);
        }
      };
      checkUnread();
      const interval = setInterval(checkUnread, 30000); // Check every 30 seconds
      return () => clearInterval(interval);
    }
  }, [session, user]);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: session ? "Dashboard" : "Projects", href: session ? "/dashboard" : "/projects/new" },
    { name: "Tools", href: "/tools", children: tools },
    { name: "Pricing", href: "/pricing" },
    { name: "Blog", href: "/blog" },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="container-tight flex h-24 items-center justify-between px-4 md:px-8">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Giglant" className="h-40 w-auto" />
        </Link>

        {/* Desktop Navigation */}
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
            {session && (
              <Link 
                to="/support" 
                className={`relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary ${location.pathname === "/support" ? "text-primary bg-secondary" : "text-foreground"}`}
                title="Support History"
              >
                <History size={16} />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </Link>
            )}
            <Link 
              to="/contact" 
              className={`relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary ${location.pathname === "/contact" ? "text-primary bg-secondary" : "text-foreground"}`}
            >
              <MessageSquare size={16} />
              Contact
            </Link>
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
          <div className="mt-4 border-t border-border pt-4 space-y-2">
            {session && (
              <Link
                to="/support"
                onClick={() => setMobileOpen(false)}
                className="flex w-full items-center justify-between rounded-lg bg-secondary px-3 py-2.5 text-sm font-medium text-foreground"
              >
                <div className="flex items-center gap-2">
                  <History size={16} />
                  Support History
                </div>
                {unreadCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </Link>
            )}
            <Link
              to="/contact"
              onClick={() => setMobileOpen(false)}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-secondary px-3 py-2.5 text-sm font-medium text-foreground"
            >
              <MessageSquare size={16} />
              Contact
            </Link>
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