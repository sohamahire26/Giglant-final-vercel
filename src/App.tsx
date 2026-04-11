import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./components/AuthProvider";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ToolsPage from "./pages/Tools";
import FileRenamer from "./pages/tools/FileRenamer";
import Blog from "./pages/Blog";
import BlogCategory from "./pages/BlogCategory";
import BlogPost from "./pages/BlogPost";
import BlogWriter from "./pages/BlogWriter";
import BlogAdmin from "./pages/BlogAdmin";
import About from "./pages/About";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Disclaimer from "./pages/Disclaimer";
import CookiePolicy from "./pages/CookiePolicy";
import CreateProject from "./pages/CreateProject";
import ProjectWorkspace from "./pages/ProjectWorkspace";
import ClientView from "./pages/ClientView";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Pricing from "./pages/Pricing";
import ScrollToTop from "./components/ScrollToTop";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routesthink
The user wants me to continue my previous response exactly where I left off.
Looking at the previous response, it ended abruptly inside a `<dyad-write>` block for `src/App.tsx`.

The last part was:
```tsx
        <BrowserRouter>
          <ScrollToTop />
          <Routes
```

I need to complete the `src/App.tsx` file and then provide the chat summary.

Wait, I should check if there were other files I was supposed to write or if I was just finishing `App.tsx`.
The plan included:
1. Database & Auth (Done)
2. Pricing Page (Done)
3. Access Control Logic (Dashboard.tsx, ProjectWorkspace.tsx) (Done)
4. Guest Experience (FileRenamer.tsx) (Done)
5. App.tsx (In progress)

So I just need to finish `src/App.tsx`.

```tsx
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/tools" element={<ToolsPage />} />
            <Route path="/tools/file-renamer" element={<FileRenamer />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/write" element={<BlogWriter />} />
            <Route path="/blog/admin" element={<BlogAdmin />} />
            <Route path="/blog/:category" element={<BlogCategory />} />
            <Route path="/blog/:category/:slug" element={<BlogPost />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/disclaimer" element={<Disclaimer />} />
            <Route path="/cookie-policy" element={<CookiePolicy />} />
            <Route path="/projects/new" element={<CreateProject />} />
            <Route path="/project/:id" element={<ProjectWorkspace />} />
            <Route path="/client/:token" element={<ClientView />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
```

I will output the full `src/App.tsx` file to be safe, or just the continuation if I can. The instructions say "Only use ONE <dyad-write> block per file that you write!". Since the previous one was cut off, I should probably rewrite the whole file or just the missing part? Usually, it's better to rewrite the whole file if it was incomplete.

Actually, the user said "Continue exactly where you left off".

Let's finish the `App.tsx` file.

Wait, I also need to update `src/components/Navbar.tsx` to include the Pricing link.

Let's check the plan again.
- `supabase/migrations/...` (Done via SQL tool)
- `src/components/AuthProvider.tsx` (Done)
- `src/pages/Pricing.tsx` (Done)
- `src/pages/Dashboard.tsx` (Done)
- `src/pages/ProjectWorkspace.tsx` (Done)
- `src/pages/tools/FileRenamer.tsx` (Done)
- `src/App.tsx` (In progress)

I'll finish `App.tsx` and then update `Navbar.tsx`.

Wait, I should also check if I need to update `src/integrations/supabase/types.ts`. I added columns to the DB, so the types should ideally be updated, but I can't easily edit that file as it's "automatically generated". I'll skip it for now as the code uses `as any` or manual casting in some places anyway.

Let's finish `App.tsx`.

```tsx
>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/tools" element={<ToolsPage />} />
            <Route path="/tools/file-renamer" element={<FileRenamer />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/write" element={<BlogWriter />} />
            <Route path="/blog/admin" element={<BlogAdmin />} />
            <Route path="/blog/:category" element={<BlogCategory />} />
            <Route path="/blog/:category/:slug" element={<BlogPost />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/disclaimer" element={<Disclaimer />} />
            <Route path="/cookie-policy" element={<CookiePolicy />} />
            <Route path="/projects/new" element={<CreateProject />} />
            <Route path="/project/:id" element={<ProjectWorkspace />} />
            <Route path="/client/:token" element={<ClientView />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;