"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

interface AuthFormProps {
  onAuthSuccess?: () => void;
}

export default function AuthForm({ onAuthSuccess }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        // Log in existing user
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          setErrorMessage(error.message || "Failed to log in. Please check your credentials.");
        } else {
          if (onAuthSuccess) onAuthSuccess();
        }
      } else {
        // Register new user
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });

        if (error) {
          setErrorMessage(error.message || "Failed to register account.");
        } else if (data.session) {
          // Auto-logged in
          setSuccessMessage("Account created successfully!");
          if (onAuthSuccess) onAuthSuccess();
        } else if (data.user) {
          // If email confirmation is enabled in Supabase project
          setSuccessMessage("Registration successful! Check your email to confirm your account, or sign in if confirmation is turned off.");
          setIsLogin(true);
        }
      }
    } catch (err: unknown) {
      const errObj = err as Error;
      setErrorMessage(errObj?.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white border border-gray-200 rounded-lg shadow-sm p-6 sm:p-8">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">SimpleTasks</h1>
        <p className="text-sm text-gray-600 mt-1">
          {isLogin ? "Sign in to access your tasks" : "Create a new account to get started"}
        </p>
      </div>

      {errorMessage && (
        <div className="mb-4 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email address
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            autoComplete={isLogin ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md text-sm shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Processing..." : isLogin ? "Login" : "Register"}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-600">
        {isLogin ? (
          <p>
            Don&apos;t have an account?{" "}
            <button
              type="button"
              onClick={() => {
                setIsLogin(false);
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className="text-blue-600 font-medium hover:underline focus:outline-none"
            >
              Register here
            </button>
          </p>
        ) : (
          <p>
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => {
                setIsLogin(true);
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className="text-blue-600 font-medium hover:underline focus:outline-none"
            >
              Login here
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
