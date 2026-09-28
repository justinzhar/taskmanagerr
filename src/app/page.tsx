"use client";

import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import AuthForm from "@/components/AuthForm";
import TaskDashboard from "@/components/TaskDashboard";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    async function checkSession() {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (!error && data?.session?.user) {
          setUser(data.session.user);
        }
      } catch (err) {
        console.error("Error retrieving session:", err);
      } finally {
        setLoading(false);
      }
    }

    checkSession();

    // Listen for auth changes (sign in, sign out, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  // Helper notice if Supabase environment variables are missing
  if (!isSupabaseConfigured) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
        <div className="max-w-lg w-full bg-white border border-amber-300 rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">⚠️</span>
            <h1 className="text-xl font-bold text-gray-900">Supabase Configuration Required</h1>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Welcome to <strong>SimpleTasks</strong>! Before using the app, you need to connect your Supabase project.
          </p>
          <div className="bg-slate-50 border border-slate-200 rounded p-4 text-xs font-mono text-slate-800 space-y-1 mb-4">
            <p className="font-semibold text-slate-900 mb-1">Add to .env.local:</p>
            <p>NEXT_PUBLIC_SUPABASE_URL=your_project_url</p>
            <p>NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key</p>
          </div>
          <p className="text-xs text-gray-500">
            Check the <code className="bg-gray-100 px-1 py-0.5 rounded">README.md</code> for the step-by-step setup guide and database SQL script.
          </p>
        </div>
      </main>
    );
  }

  // Initial session verification loader
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-sm text-gray-500 font-medium">Loading SimpleTasks...</p>
        </div>
      </main>
    );
  }

  // If user is authenticated, show Task Dashboard
  if (user) {
    return (
      <main className="min-h-screen bg-slate-50">
        <TaskDashboard user={user} onLogout={handleLogout} />
      </main>
    );
  }

  // Otherwise, show Login / Register form centered
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <AuthForm />
    </main>
  );
}
