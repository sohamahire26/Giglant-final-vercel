"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import SEOHead from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User as UserIcon, LogOut } from 'lucide-react';
import { Navigate } from 'react-router-dom';

interface ProfileData {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  updated_at: string;
}

const Profile = () => {
  const { user, session, loading: authLoading, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      getProfile();
    }
  }, [user]);

  const getProfile = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', user?.id)
        .single() as { data: ProfileData | null; error: any };

      if (error) throw error;
      if (data) {
        setFirstName(data.first_name || '');
        setLastName(data.last_name || '');
      }
    } catch (error: any) {
      console.error('Error loading profile:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    setLoading(true);
    try {
      const { error } = await (supabase as any).from('profiles').upsert({
        id: user?.id,
        first_name: firstName,
        last_name: lastName,
        updated_at: new Date().toISOString(),
      } as any);

      if (error) throw error;
      toast({ title: "Profile updated successfully!" });
    } catch (error: any) {
      toast({ title: "Error updating profile", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return <Layout><div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></Layout>;
  if (!session) return <Navigate to="/login" replace />;

  return (
    <Layout>
      <SEOHead title="My Profile — Giglant" description="Manage your Giglant account settings." />
      <section className="section-padding">
        <div className="container-tight max-w-lg">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <UserIcon size={32} />
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground">Account Settings</h1>
            <p className="text-muted-foreground">{user?.email}</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">First Name</label>
                <input 
                  type="text" 
                  value={firstName} 
                  onChange={e => setFirstName(e.target.value)} 
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none" 
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Last Name</label>
                <input 
                  type="text" 
                  value={lastName} 
                  onChange={e => setLastName(e.target.value)} 
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none" 
                />
              </div>
            </div>
            
            <Button onClick={updateProfile} disabled={loading} className="w-full">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save Changes
            </Button>

            <div className="pt-4 border-t border-border">
              <Button variant="outline" onClick={signOut} className="w-full text-destructive border-destructive/30 hover:bg-destructive/10">
                <LogOut className="mr-2 h-4 w-4" /> Sign Out
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Profile;