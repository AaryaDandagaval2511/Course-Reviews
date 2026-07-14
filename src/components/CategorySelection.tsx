/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion } from "motion/react";
import { BookOpen, GraduationCap, AlertCircle, ArrowRight, FolderGit2 } from "lucide-react";
import { Page } from "../types";

interface CategorySelectionProps {
  onSelectCategory: (category: "HEL" | "OPEL_DEL") => void;
  setActivePage: (page: Page) => void;
}

export default function CategorySelection({
  onSelectCategory,
  setActivePage,
}: CategorySelectionProps) {
  return (
    <div className="relative overflow-hidden py-12 sm:py-16 md:py-20">
      <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        {/* Title Block */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-app-surface px-3.5 py-1 text-[10px] font-bold font-mono tracking-widest text-app-text-secondary uppercase border border-app-border">
            BITS-Goa Electives Portal
          </span>
          <h1 className="font-sans text-3xl font-extrabold tracking-tight text-app-text-primary sm:text-4xl md:text-5xl">
            Choose category
          </h1>
          <p className="mx-auto max-w-xl text-sm sm:text-base text-app-text-secondary">
            Explore and filter real grade distributions, evaluative structures, student reviews, and project/thesis guidance.
          </p>

          {/* Integrated Notice Banner */}
          <div className="pt-2">
            <div className="mx-auto max-w-2xl rounded-2xl border border-app-border bg-app-surface p-4 text-left shadow-sm">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-app-bg text-app-accent border border-app-border">
                  <AlertCircle className="h-4 w-4" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-app-text-primary">
                    We currently have fewer public reviews for <strong className="text-app-accent font-semibold">DELs / OPELs / Projects</strong>.
                  </p>
                  <p className="text-[11px] text-app-text-secondary leading-normal">
                    If you’ve taken any course or project, please help fellow BITSians by{" "}
                    <button
                      onClick={() => setActivePage("submit-review")}
                      className="font-bold text-app-accent hover:text-app-accent-hover transition-colors hover:underline underline-offset-2"
                    >
                      adding a review here
                    </button>
                    .
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Category Cards */}
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {/* HELs Card */}
          <motion.button
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ y: -4 }}
            onClick={() => onSelectCategory("HEL")}
            className="group relative flex flex-col items-center justify-between overflow-hidden rounded-3xl border border-app-border bg-app-surface p-8 text-center transition-all duration-300 hover:border-app-accent hover:shadow-sm focus:outline-none"
          >
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-app-bg text-app-text-secondary border border-app-border transition-colors group-hover:text-app-accent group-hover:border-app-accent">
              <BookOpen className="h-7 w-7" />
            </div>
            <div className="space-y-2">
              <h3 className="font-sans text-2xl font-bold tracking-tight text-app-text-primary group-hover:text-app-accent transition-colors">
                HELs
              </h3>
              <p className="text-xs font-mono tracking-wider text-app-text-secondary uppercase">
                Humanities Electives
              </p>
            </div>
            <div className="mt-8 flex items-center gap-1.5 text-xs font-bold text-app-text-secondary group-hover:text-app-accent transition-colors">
              <span>Browse Humanities</span>
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
            </div>
          </motion.button>

          {/* OPELs/DELs Card */}
          <motion.button
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            whileHover={{ y: -4 }}
            onClick={() => onSelectCategory("OPEL_DEL")}
            className="group relative flex flex-col items-center justify-between overflow-hidden rounded-3xl border border-app-border bg-app-surface p-8 text-center transition-all duration-300 hover:border-app-accent hover:shadow-sm focus:outline-none"
          >
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-app-bg text-app-text-secondary border border-app-border transition-colors group-hover:text-app-accent group-hover:border-app-accent">
              <GraduationCap className="h-7 w-7" />
            </div>
            <div className="space-y-2">
              <h3 className="font-sans text-2xl font-bold tracking-tight text-app-text-primary group-hover:text-app-accent transition-colors">
                OPELs / DELs
              </h3>
              <p className="text-xs font-mono tracking-wider text-app-text-secondary uppercase">
                Open & Discipline Electives
              </p>
            </div>
            <div className="mt-8 flex items-center gap-1.5 text-xs font-bold text-app-text-secondary group-hover:text-app-accent transition-colors">
              <span>Browse Open/Discipline</span>
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
            </div>
          </motion.button>

          {/* Projects Card */}
          <motion.button
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ y: -4 }}
            onClick={() => setActivePage("projects")}
            className="group relative flex flex-col items-center justify-between overflow-hidden rounded-3xl border border-app-border bg-app-surface p-8 text-center transition-all duration-300 hover:border-app-accent hover:shadow-sm focus:outline-none"
          >
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-app-bg text-app-text-secondary border border-app-border transition-colors group-hover:text-app-accent group-hover:border-app-accent">
              <FolderGit2 className="h-7 w-7" />
            </div>
            <div className="space-y-2">
              <h3 className="font-sans text-2xl font-bold tracking-tight text-app-text-primary group-hover:text-app-accent transition-colors">
                Projects
              </h3>
              <p className="text-xs font-mono tracking-wider text-app-text-secondary uppercase">
                SOP / LOP / DOP / RC
              </p>
            </div>
            <div className="mt-8 flex items-center gap-1.5 text-xs font-bold text-app-text-secondary group-hover:text-app-accent transition-colors">
              <span>Browse Projects</span>
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
            </div>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
