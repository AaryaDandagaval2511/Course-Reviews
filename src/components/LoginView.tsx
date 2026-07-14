/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion } from "motion/react";
import { BookOpen, ShieldAlert, LogIn } from "lucide-react";
import { User } from "../types";
import { supabase } from "../supabaseClient";

interface LoginViewProps {
  onLoginSuccess: (user: User) => void;
  onClose: () => void;
  parentError?: string;
}

export default function LoginView({ onLoginSuccess, onClose, parentError }: LoginViewProps) {
  const [error, setError] = useState("");
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

          <div className="rounded-2xl border border-app-border bg-app-bg/70 p-4 text-xs text-app-text-secondary">
            <p className="font-semibold text-app-text-primary">Use your Goa BITS Google account.</p>
            <p className="mt-1 leading-relaxed">Only addresses ending in @goa.bits-pilani.ac.in are allowed. After sign-in, the app will keep that session only for the current authenticated user.</p>
          </div>
        </div>

        {/* Quick/mock presets removed to rely solely on Supabase-backed users */}

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
