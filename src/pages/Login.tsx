"use client";

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import SEOHead from '@/components/SEOHead';
import { useAuth } from '@/components/AuthProvider';
import { Navigate } from 'react-router-dom';

const Login = () => {
  const { session } = useAuth();

  if (session) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Layout>
      <SEOHead title="Login — Giglant" description="Sign in to your Giglant account to manage your projects." />
      <section className="section-padding">
        <div className="container-tight max-w-md">
          <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
            <div className="mb-6 text-center">
              <h1 className="font-display text-2xl font-bold text-foreground">Welcome Back</h1>
              <p className="text-sm text-muted-foreground">Sign in to manage your freelance workflow</p>
            </div>
            <Auth
              supabaseClient={supabase}
              redirectTo={`${window.location.origin}/dashboard`}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: 'hsl(var(--primary))',
                      brandAccent: 'hsl(var(--primary))',
                    },
                  },
                },
              }}
              providers={['google']}
              theme="light"
              showLinks={true}
            />
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Login;