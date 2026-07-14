/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion } from "motion/react";
import { BookOpen, ShieldAlert, Key, Mail, Sparkles, LogIn } from "lucide-react";
import { User } from "../types";
import { supabase } from "../supabaseClient";

// Helper to map BITSian emails to universally valid domains for Supabase GoTrue Auth
function mapEmailForSupabase(email: string): string {
  if (!email) return "";
  const lower = email.toLowerCase().trim();
  if (lower.includes("@") && (lower.endsWith(".bits-pilani.ac.in") || lower.endsWith(".ac.in"))) {
    const parts = lower.split("@");
    const username = parts[0];
    const domain = parts[1];
    
    // Extract first domain segment (e.g., 'goa', 'pilani', 'hyderabad', etc.)
    const firstSegment = domain.split(".")[0];
    // If it's just bits-pilani, use 'bits'
    const suffix = firstSegment === "bits-pilani" ? "bits" : firstSegment;
    
    // Keep only letters, numbers, dots, and underscores for maximum email regex safety
    const safeUsername = username.replace(/[^a-z0-9._]/g, "");
    
    return `${safeUsername}_${suffix}@gmail.com`;
  }
  return lower;
}

interface LoginViewProps {
  onLoginSuccess: (user: User) => void;
  onClose: () => void;
  parentError?: string;
}

export default function LoginView({ onLoginSuccess, onClose, parentError }: LoginViewProps) {
  const [email, setEmail] = useState("");
  const [campus, setCampus] = useState<"Pilani" | "Goa" | "Hyderabad" | "Dubai">("Goa");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      const { data, error: sError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth-callback`,
          skipBrowserRedirect: true,
          queryParams: {
            prompt: "select_account",
          },
        },
      });

      if (sError) throw sError;
      if (!data?.url) throw new Error("No BITS SSO URL returned.");

      const authWindow = window.open(data.url, "supabase_oauth_popup", "width=600,height=700");
      if (!authWindow) {
        setError("Please allow popups for this site to complete BITS SSO.");
      }
    } catch (err: any) {
      console.error("SSO Error:", err);
      setError(err.message || "Failed to initiate BITS SSO.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your BITS Mail address.");
      return;
    }

    const lowerEmail = email.toLowerCase().trim();
    if (!lowerEmail.endsWith("@goa.bits-pilani.ac.in")) {
      setError("Access is restricted to @goa.bits-pilani.ac.in email addresses only.");
      return;
    }

    setLoading(true);

    const prefix = lowerEmail.split("@")[0];
    const nameParts = prefix.replace(/\d+/g, "").split(/[._]/).map(p => p.charAt(0).toUpperCase() + p.slice(1));
    const studentName = nameParts.filter(Boolean).join(" ") || "Student BITSian";

    const numMatch = prefix.match(/\d+/);
    const year = numMatch ? `20${numMatch[0]}`.substring(0, 4) : "2023";
    const branchCode = "A7PS";
    const seqNo = Math.floor(Math.random() * 800 + 100).toString();
    const mockIdNo = `${year}${branchCode}${seqNo}G`;

    const defaultPassword = password || "MockPassword123!";
    const supabaseEmail = mapEmailForSupabase(lowerEmail);

    try {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: supabaseEmail,
        password: defaultPassword,
      });

      if (signInError) {
        console.warn("Manual Login: Sign in failed, attempting sign up:", signInError.message);
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: supabaseEmail,
          password: defaultPassword,
          options: {
            data: {
              full_name: studentName,
            }
          }
        });

        if (signUpError) {
          console.error("Manual Login: sign up failed:", signUpError.message);
        } else if (signUpData?.user) {
          console.log("Manual Login: sign up succeeded, logging in...");
          const { error: reSignInError } = await supabase.auth.signInWithPassword({
            email: supabaseEmail,
            password: defaultPassword,
          });
          if (reSignInError) {
            console.error("Manual Login: sign in after sign up failed:", reSignInError.message);
          }
        }
      } else {
        console.log("Manual Login: sign in succeeded:", signInData?.user?.id);
      }
    } catch (err: any) {
      console.error("Manual Login: general auth error:", err);
    }

    const authenticatedUser: User = {
      email: lowerEmail,
      name: studentName,
      campus: "Goa",
      idNo: mockIdNo,
    };

    onLoginSuccess(authenticatedUser);
    setLoading(false);
  };

  const handleQuickLogin = async (emailPreset: string, namePreset: string, customCampus: "Pilani" | "Goa" | "Hyderabad" | "Dubai") => {
    setLoading(true);
    const defaultPassword = "MockPassword123!";
    const supabaseEmail = mapEmailForSupabase(emailPreset);
    try {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: supabaseEmail,
        password: defaultPassword,
      });

      if (signInError) {
        console.warn("Quick Login: Sign in failed, attempting sign up:", signInError.message);
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: supabaseEmail,
          password: defaultPassword,
          options: {
            data: {
              full_name: namePreset,
            }
          }
        });

        if (!signUpError && signUpData?.user) {
          const { error: reSignInError } = await supabase.auth.signInWithPassword({
            email: supabaseEmail,
            password: defaultPassword,
          });
          if (reSignInError) {
            console.error("Quick Login: re-signIn failed:", reSignInError.message);
          }
        } else if (signUpError) {
          console.error("Quick Login: signUp failed:", signUpError.message);
        }
      } else {
        console.log("Quick Login: sign in succeeded:", signInData?.user?.id);
      }
    } catch (err) {
      console.error("Supabase quick login auth error:", err);
    }

    onLoginSuccess({
      email: emailPreset,
      name: namePreset,
      campus: "Goa",
      idNo: "2022A7PS0199G",
    });
    setLoading(false);
  };

  const activeError = error || parentError;

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-app-border bg-app-surface p-8 shadow-sm"
      >
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-app-bg text-app-accent border border-app-border">
            <BookOpen className="h-6 w-6" />
          </div>
          <h2 className="font-sans text-2xl font-extrabold tracking-tight text-app-text-primary">
            BITS Course Reviews
          </h2>
          <p className="text-xs text-app-text-secondary mt-1 font-sans">
            Access secure metrics & course distributions
          </p>
        </div>

        {/* Form */}
        <div className="space-y-5">
          {activeError && (
            <div className="flex items-start gap-2 rounded-xl border border-app-error/20 bg-app-error/10 p-3 text-xs text-app-error">
              <ShieldAlert className="h-4 w-4 shrink-0 text-app-error" />
              <span>{activeError}</span>
            </div>
          )}

          {/* BITS SSO Google Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-app-border bg-app-surface py-3 text-xs font-bold text-app-text-primary hover:bg-app-bg focus:outline-none transition-all duration-200 shadow-sm cursor-pointer disabled:opacity-50"
          >
            <svg className="h-4 w-4 mr-1" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
              <g transform="matrix(1, 0, 0, 1, 0, 0)">
                <path d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.04,3.1v2.57h3.3c1.93,-1.78 3.04,-4.4 3.04,-7.43c0,-0.67 -0.06,-1.31 -0.17,-1.94z" fill="#4285F4" />
                <path d="M12,20.62c2.43,0 4.47,-0.8 5.96,-2.18l-3.3,-2.57c-0.91,0.61 -2.08,0.97 -3.3,0.97c-2.34,0 -4.32,-1.58 -5.03,-3.7l-3.4,2.63c1.48,2.94 4.52,4.85 8.07,4.85z" fill="#34A853" />
                <path d="M6.97,13.14c-0.18,-0.54 -0.28,-1.11 -0.28,-1.7s0.1,-1.16 0.28,-1.7l-3.4,-2.63c-0.6,1.21 -0.94,2.57 -0.94,4.01s0.34,2.8 0.94,4.01l3.4,-2.63z" fill="#FBBC05" />
                <path d="M12,6.11c1.32,0 2.51,0.45 3.44,1.35l2.58,-2.58C16.46,3.42 14.42,2.62 12,2.62c-3.55,0 -6.59,1.91 -8.07,4.85l3.4,2.63c0.71,-2.12 2.69,-3.7 5.03,-3.7z" fill="#EA4335" />
              </g>
            </svg>
            <span>{googleLoading ? "Connecting..." : "Continue with BITS email ID"}</span>
          </button>

          <div className="relative flex items-center justify-center my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-app-border"></div>
            </div>
            <span className="relative px-3 bg-app-surface text-[10px] font-bold font-mono text-app-text-secondary uppercase tracking-widest">
              Or Use Password
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email input */}
            <div>
              <label className="block text-[10px] font-bold font-mono text-app-text-secondary uppercase tracking-widest mb-1.5">
                BITS Mail Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-app-text-secondary" />
                <input
                  type="email"
                  placeholder="f20220199@goa.bits-pilani.ac.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-app-border bg-app-bg pl-10.5 pr-4 py-2.5 text-xs text-app-text-primary placeholder:text-app-text-secondary/40 focus:border-app-accent focus:outline-none focus:ring-1 focus:ring-app-accent"
                />
              </div>
            </div>

            {/* Password input */}
            <div>
              <label className="block text-[10px] font-bold font-mono text-app-text-secondary uppercase tracking-widest mb-1.5">
                Password
              </label>
              <div className="relative">
                <Key className="absolute left-3.5 top-3 h-4 w-4 text-app-text-secondary" />
                <input
                  type="password"
                  placeholder="•••••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-app-border bg-app-bg pl-10.5 pr-4 py-2.5 text-xs text-app-text-primary placeholder:text-app-text-secondary/40 focus:border-app-accent focus:outline-none focus:ring-1 focus:ring-app-accent"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-app-accent py-3 text-xs font-bold text-white hover:bg-app-accent-hover focus:outline-none transition-all duration-200 shadow-sm cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  <span>Secure Sign In</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Quick presets */}
        <div className="mt-8 border-t border-app-border pt-6">
          <span className="block text-[10px] font-bold font-mono text-app-text-secondary uppercase tracking-widest text-center mb-4">
            Or Sign In Instantly (Mock Profiles)
          </span>
          <div className="space-y-2.5">
            <button
              onClick={() => handleQuickLogin("aarya.dan@goa.bits-pilani.ac.in", "Aarya Dan", "Goa")}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-app-border bg-app-bg text-app-text-secondary hover:text-app-text-primary hover:bg-app-surface transition-all text-xs text-left"
            >
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 flex items-center justify-center rounded-full bg-app-accent/10 text-app-accent text-[10px] font-bold">AD</div>
                <div>
                  <span className="block font-semibold">Aarya Dan</span>
                  <span className="block text-[9px] text-app-text-secondary font-sans font-normal">aarya.dan@goa.bits-pilani.ac.in</span>
                </div>
              </div>
              <Sparkles className="h-3.5 w-3.5 text-app-accent" />
            </button>

            <button
              onClick={() => handleQuickLogin("f20220199@goa.bits-pilani.ac.in", "Rahul Sharma", "Goa")}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-app-border bg-app-bg text-app-text-secondary hover:text-app-text-primary hover:bg-app-surface transition-all text-xs text-left"
            >
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 flex items-center justify-center rounded-full bg-app-accent/10 text-app-accent text-[10px] font-bold">RS</div>
                <div>
                  <span className="block font-semibold">Rahul Sharma</span>
                  <span className="block text-[9px] text-app-text-secondary font-sans font-normal">f20220199@goa</span>
                </div>
              </div>
              <Sparkles className="h-3.5 w-3.5 text-app-accent" />
            </button>
          </div>
        </div>

        {/* Cancel button */}
        <div className="text-center mt-6">
          <button
            onClick={onClose}
            className="text-xs text-app-text-secondary hover:text-app-text-primary transition-colors font-sans cursor-pointer"
          >
            Cancel and Return
          </button>
        </div>
      </motion.div>
    </div>
  );
}
