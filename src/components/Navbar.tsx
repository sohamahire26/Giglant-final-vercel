"use client";

import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, User, LogOut, LayoutDashboard, MessageSquare, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "./AuthProvider";
import { NavLink } from "./NavLink";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";

const OWNER_EMAIL = "Sohamahire26@gmail.com";

const Navbar = () => {
  const { user, session, signOut, profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();

  const isOwner = profile?.is_admin || user?.email?.toLowerCase() === OWNER_EMAIL.toLowerCase();

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  useEffect(() => {
    if (user) {
      const fetchUnreadCount = async () => {
        const { count } = await supabase
          .from("support_tickets")
          .select("*", { count: "exact", head: true })
          .eq("is_read_by_user", false)
          .not("reply", "is", null);
        
        setUnreadCount(count || 0);
      };

      fetchUnreadCount();

      const channel = supabase
        .channel("navbar-support-notifications")
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "support_tickets", filter: `user_id=eq.${user.id}` },
          () => fetchUnreadCount()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const navLinks = [
    { name: "Tools", href: "/tools" },
    { name: "Pricing", href: "/pricing" },
    { name: "Blog", href: "/blog" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container-tight flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Giglant" className="h-10 w-auto" />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.href}
              to={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              activeClassName="text-primary"
            >
              {link.name}
            </NavLink>
          ))}

          {session ? (
            <div className="flex items-center gap-4 border-l border-border pl-8">
              {isOwner && (
                <Link to="/admin">
                  <Button variant="ghost" size="sm" className="gap-2 text-primary hover:bg-primary/5">
                    <ShieldCheck size={16} /> Admin
                  </Button>
                </Link>
              )}
              <Link to="/support" className="relative text-muted-foreground hover:text-primary transition-colors">
                <MessageSquare size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </Link>
              <Link to="/dashboard">
                <Button variant="ghost" size="sm" className="gap-2">
                  <LayoutDashboard size={16} /> Dashboard
                </Button>
              </Link>
              <Link to="/profile">
                <Button variant="outline" size="sm" className="gap-2">
                  <User size={16} /> Profile
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={signOut} className="text-muted-foreground hover:text-destructive">
                <LogOut size={16} />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link to="/login">
                <Button size="sm" className="shadow-lg shadow-primary/20">Get Started</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="border-t border-border bg-background p-4 md:hidden">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link key={link.href} to={link.href} className="text-lg font-medium text-foreground">
                {link.name}
              </Link>
            ))}
            <hr className="border-border" />
            {session ? (
              <>
                {isOwner && (
                  <Link to="/admin" className="flex items-center gap-2 text-lg font-medium text-primary">
                    <ShieldCheck size={20} /> Admin Panel
                  </Link>
                )}
                <Link to="/dashboard" className="flex items-center gap-2 text-lg font-medium text-foreground">
                  <LayoutDashboard size={20} /> Dashboard
                </Link>
                <Link to="/support" className="flex items-center justify-between text-lg font-medium text-foreground">
                  <div className="flex items-center gap-2">
                    <MessageSquare size={20} /> Support
                  </div>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-white">
                      {unreadCount} New
                    </span>
                  )}
                </Link>
                <Link to="/profile" className="flex items-center gap-2 text-lg font-medium text-foreground">
                  <User size={20} /> Profile
                </Link>
                <Button variant="destructive" onClick={signOut} className="w-full justify-start gap-2">
                  <LogOut size={20} /> Sign Out
                </Button>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <Link to="/login">
                  <Button variant="outline" className="w-full">Sign In</Button>
                </Link>
                <Link to="/login">
                  <Button className="w-full">Get Started</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;