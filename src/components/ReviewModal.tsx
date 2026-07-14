/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Award, FileText, CheckCircle2, AlertTriangle, Lightbulb, Clock, Layers, Star, MessageSquare, TrendingUp, Percent } from "lucide-react";
import { Review, Course } from "../types";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  review: Review | null;
  course: Course | null;
  reviewIndex: number;
}

export default function ReviewModal({
  isOpen,
  onClose,
  review,
  course,
  reviewIndex,
}: ReviewModalProps) {
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!review) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="relative flex flex-col w-full max-w-4xl max-h-[85vh] overflow-hidden rounded-3xl bg-app-surface border border-app-border text-app-text-primary shadow-lg"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-app-border px-6 py-4.5 bg-app-surface">
              <div>
                <h2 className="font-sans text-xl font-bold text-app-text-primary flex items-center gap-2">
                  <span className="text-app-accent font-bold">Detailed Review #{reviewIndex + 1}</span>
                  <span className="font-mono text-xs font-semibold px-2.5 py-0.5 rounded-full bg-app-accent/10 text-app-accent border border-app-accent/20">
                    {course?.code || "Course"}
                  </span>
                </h2>
                <p className="text-xs text-app-text-secondary mt-0.5 font-sans">
                  Submitted for {review.semester}{course?.category === "OPEL_DEL" && review.icForSemester ? ` • IC: ${review.icForSemester}` : ""}
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-1.5 text-app-text-secondary hover:text-app-text-primary hover:bg-app-bg transition-colors focus:outline-none"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content (Scrollable) */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {/* Bento Section 1: Core Grading Metrics */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl bg-app-bg border border-app-border p-4 flex items-center gap-3">
                  <div className="p-2 bg-app-accent/10 text-app-accent rounded-lg border border-app-accent/20">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-app-text-secondary uppercase tracking-wider font-mono">Grade Received</span>
                    <span className="text-2xl font-black text-app-text-primary">{review.gradeReceived}</span>
                  </div>
                </div>

                <div className="rounded-2xl bg-app-bg border border-app-border p-4 flex items-center gap-3">
                  <div className="p-2 bg-app-accent/10 text-app-accent rounded-lg border border-app-accent/20">
                    <Star className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-app-text-secondary uppercase tracking-wider font-mono">Total Marks</span>
                    <span className="text-2xl font-black text-app-text-primary">{review.marksReceived}</span>
                  </div>
                </div>

                <div className="rounded-2xl bg-app-bg border border-app-border p-4 flex items-center gap-3">
                  <div className="p-2 bg-app-bg text-app-text-secondary rounded-lg border border-app-border">
                    <Layers className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-app-text-secondary uppercase tracking-wider font-mono">PR No. Priority</span>
                    <span className="text-lg font-extrabold text-app-text-primary">{review.prNo || "N/A"}</span>
                  </div>
                </div>
              </div>

              {course?.category === "OPEL_DEL" && (review.avMarks || review.avGrade || review.courseTotal) && (
                <div className="grid gap-4 sm:grid-cols-3 mt-4">
                  {review.avMarks && (
                    <div className="rounded-2xl bg-app-bg border border-app-border p-4 flex items-center gap-3">
                      <div className="p-2 bg-app-accent/10 text-app-accent rounded-lg border border-app-accent/20">
                        <TrendingUp className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold text-app-text-secondary uppercase tracking-wider font-mono">Average Marks</span>
                        <span className="text-2xl font-black text-app-text-primary">{review.avMarks}</span>
                      </div>
                    </div>
                  )}

                  {review.avGrade && (
                    <div className="rounded-2xl bg-app-bg border border-app-border p-4 flex items-center gap-3">
                      <div className="p-2 bg-app-accent/10 text-app-accent rounded-lg border border-app-accent/20">
                        <Award className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold text-app-text-secondary uppercase tracking-wider font-mono">Average Grade</span>
                        <span className="text-2xl font-black text-app-text-primary">{review.avGrade}</span>
                      </div>
                    </div>
                  )}

                  {review.courseTotal && (
                    <div className="rounded-2xl bg-app-bg border border-app-border p-4 flex items-center gap-3">
                      <div className="p-2 bg-app-bg text-app-text-secondary rounded-lg border border-app-border">
                        <Percent className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold text-app-text-secondary uppercase tracking-wider font-mono">Course Total</span>
                        <span className="text-2xl font-black text-app-text-primary">{review.courseTotal}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Bento Section 2: Structure & Syllabus */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-2xl border border-app-border bg-app-bg p-5 space-y-3.5">
                  <h4 className="font-sans text-sm font-bold text-app-text-primary border-b border-app-border pb-2 flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-app-accent" />
                    Grading & Syllabus Structure
                  </h4>
                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="block font-bold text-app-text-secondary uppercase tracking-wider text-[10px] font-mono">Comments on Grading:</span>
                      <p className="mt-1 text-app-text-primary leading-relaxed font-sans bg-app-surface p-2.5 rounded-lg border border-app-border">{review.commentsOnGrading}</p>
                    </div>
                    <div>
                      <span className="block font-bold text-app-text-secondary uppercase tracking-wider text-[10px] font-mono">Evaluative Components:</span>
                      <p className="mt-1 text-app-text-primary leading-relaxed font-sans bg-app-surface p-2.5 rounded-lg border border-app-border">{review.evaluativeComponents}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-app-border bg-app-bg p-5 space-y-3.5">
                  <h4 className="font-sans text-sm font-bold text-app-text-primary border-b border-app-border pb-2 flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-app-accent" />
                    Assessments & Class Expectations
                  </h4>
                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="block font-bold text-app-text-secondary uppercase tracking-wider text-[10px] font-mono">Evaluation Type:</span>
                      <p className="mt-1 text-app-text-primary leading-relaxed font-sans bg-app-surface p-2.5 rounded-lg border border-app-border">{review.evaluationType}</p>
                    </div>
                    <div>
                      <span className="block font-bold text-app-text-secondary uppercase tracking-wider text-[10px] font-mono">Attendance Policy:</span>
                      <p className="mt-1 text-app-text-primary leading-relaxed font-sans bg-app-surface p-2.5 rounded-lg border border-app-border">{review.attendanceExpectations}</p>
                    </div>
                    <div>
                      <span className="block font-bold text-app-text-secondary uppercase tracking-wider text-[10px] font-mono">Were the course slides provided & sufficient?</span>
                      <p className="mt-1 text-app-text-primary leading-relaxed font-sans bg-app-surface p-2.5 rounded-lg border border-app-border">{review.courseMaterialsProvided}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bento Section 3: Deep Insights */}
              <div className="space-y-4">
                <h4 className="font-sans text-sm font-bold text-app-text-primary flex items-center gap-1.5">
                  <Lightbulb className="h-4.5 w-4.5 text-app-accent" />
                  Reviewer's Guide & Strategic Insights
                </h4>

                <div className="grid gap-4 md:grid-cols-3">
                  {/* What Worked Well */}
                  <div className="rounded-2xl border border-app-success/20 bg-app-success/5 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-app-success font-bold text-xs">
                      <CheckCircle2 className="h-4 w-4 text-app-success shrink-0" />
                      <span>What Worked Well</span>
                    </div>
                    <p className="text-xs leading-relaxed text-app-text-primary font-sans">
                      {review.whatWorkedWell}
                    </p>
                  </div>

                  {/* Things to Keep in Mind */}
                  <div className="rounded-2xl border border-app-warning/20 bg-app-warning/5 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-app-warning font-bold text-xs">
                      <AlertTriangle className="h-4 w-4 text-app-warning shrink-0" />
                      <span>Things to Keep in Mind</span>
                    </div>
                    <p className="text-xs leading-relaxed text-app-text-primary font-sans">
                      {review.thingsToKeepInMind}
                    </p>
                  </div>

                  {/* Advice */}
                  <div className="rounded-2xl border border-app-accent/20 bg-app-accent/5 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-app-accent font-bold text-xs">
                      <Lightbulb className="h-4 w-4 text-app-accent shrink-0" />
                      <span>Advice for Registrants</span>
                    </div>
                    <p className="text-xs leading-relaxed text-app-text-primary font-sans">
                      {review.adviceFromReviewer}
                    </p>
                  </div>
                </div>

                {review.additionalComments && review.additionalComments !== "—" && review.additionalComments.trim() !== "" && (
                  <div className="rounded-2xl border border-app-border bg-app-surface/40 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-app-text-secondary font-bold text-xs">
                      <MessageSquare className="h-4 w-4 text-app-text-secondary shrink-0" />
                      <span>Additional Comments</span>
                    </div>
                    <p className="text-xs leading-relaxed text-app-text-primary font-sans whitespace-pre-wrap">
                      {review.additionalComments}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer with actions */}
            <div className="flex items-center justify-between border-t border-app-border px-6 py-4.5 bg-app-surface">
              <span className="text-xs text-app-text-secondary font-sans">
                BITS Course Reviews • Verified Student Review
              </span>
              <button
                onClick={onClose}
                className="flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-bold text-white bg-app-accent hover:bg-app-accent-hover transition-all duration-200 focus:outline-none"
              >
                <span>Close</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
