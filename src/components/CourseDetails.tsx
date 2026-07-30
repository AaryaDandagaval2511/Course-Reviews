/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Bookmark, FileText, MessageSquare } from "lucide-react";
import { Course, Review } from "../types";
import ReviewCard from "./ReviewCard";
import { getBookmarkCount } from "../data";

interface CourseDetailsProps {
  course: Course;
  reviews: Review[];
  isBookmarked: boolean;
  onToggleBookmark: (courseId: string) => void;
  onBack: () => void;
  onOpenReviewModal: (review: Review, index: number) => void;
}

export default function CourseDetails({
  course,
  reviews,
  isBookmarked,
  onToggleBookmark,
  onBack,
  onOpenReviewModal,
}: CourseDetailsProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownloadHandout = (e: React.MouseEvent) => {
    e.preventDefault();
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      alert(`Downloading ${course.code} Course Handout (Mock PDF)...`);
    }, 1000);
  };



  return (
    <div className="space-y-8 py-4">
      {/* Back Button */}
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-xl border border-app-border bg-app-bg px-4 py-2 text-xs font-bold text-app-text-secondary hover:text-app-text-primary hover:bg-app-surface transition-all duration-200"
        >
          <ArrowLeft className="h-4 w-4 text-app-accent" />
          <span>Back to directory</span>
        </button>
      </div>

      {/* Hero Banner Area */}
      <div className="relative overflow-hidden rounded-3xl bg-app-surface p-6 sm:p-8 md:p-10 border border-app-border shadow-sm">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
          {/* Left Column: Course Metadata */}
          <div className="space-y-4 flex-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-app-accent/10 px-3.5 py-1 text-xs font-bold font-mono tracking-wider text-app-accent uppercase border border-app-accent/20">
              {course.category === "HEL" ? "Humanities Elective (HEL)" : "OPEL / DEL Elective"}
            </span>
            <div className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-app-text-primary uppercase leading-none font-sans">
              {course.code}
            </div>
            <h1 className="font-sans text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-app-text-primary leading-tight">
              {course.name}
            </h1>
            <p className="text-base sm:text-lg font-bold text-app-text-secondary">
              Instructor: <span className="text-app-text-primary">{course.instructor || "UNSPECIFIED INSTRUCTOR"}</span>
            </p>
          </div>

          {/* Right Column: Bookmark & Quick Description */}
          <div className="space-y-6 lg:max-w-md w-full shrink-0">
            <div className="space-y-3">
              <h3 className="text-[10px] font-bold tracking-wider text-app-text-secondary uppercase font-mono">
                Course Description
              </h3>
              <p className="text-xs sm:text-sm text-app-text-secondary leading-relaxed font-sans">
                {course.description || "No official course description is available for this elective. Please consult the course handout or submit student reviews to detail the syllabus and concepts taught."}
              </p>
            </div>

            {/* Bookmark Button & Count */}
            <div className="space-y-3">
              <button
                onClick={() => onToggleBookmark(course.id)}
                className={`inline-flex items-center gap-2 rounded-xl border px-5 py-2.5 text-xs font-bold transition-all duration-200 focus:outline-none ${
                  isBookmarked
                    ? "bg-app-accent text-white border-app-accent hover:bg-app-accent-hover"
                    : "bg-app-bg text-app-text-secondary hover:text-app-text-primary hover:bg-app-surface border-app-border"
                }`}
              >
                <Bookmark className={`h-3.5 w-3.5 ${isBookmarked ? "fill-white text-white" : ""}`} />
                <span>{isBookmarked ? "Bookmarked" : "Bookmark this course"}</span>
              </button>

              <div className="flex items-center gap-1.5 text-app-text-secondary/60 text-[11px] font-medium pl-1" title="Saved bookmarks count">
                <Bookmark className="h-3.5 w-3.5 text-app-text-secondary/50" />
                <span>
                  Saved by <span className="font-mono font-semibold text-app-text-secondary">{getBookmarkCount(course.id, isBookmarked, course.bookmarkCount)}</span> students
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Avg Marks */}
        <div className="rounded-2xl border border-app-border bg-app-surface p-5 flex flex-col justify-between shadow-sm">
          <span className="text-[10px] font-bold text-app-text-secondary uppercase tracking-wider font-mono">
            Average Marks
          </span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl sm:text-4xl font-black text-app-text-primary font-sans">
              {course.averageMarks ? course.averageMarks.split("/")[0] : "—"}
            </span>
            {course.averageMarks && (
              <span className="text-xs text-app-text-secondary">
                /{course.averageMarks.split("/")[1] || "100"}
              </span>
            )}
          </div>
        </div>

        {/* Course Total */}
        <div className="rounded-2xl border border-app-border bg-app-surface p-5 flex flex-col justify-between shadow-sm">
          <span className="text-[10px] font-bold text-app-text-secondary uppercase tracking-wider font-mono">
            Course Total
          </span>
          <div className="mt-2 text-3xl sm:text-4xl font-black text-app-text-primary font-sans">
            {course.courseTotal || "—"}
          </div>
        </div>

        {/* Avg Grade */}
        <div className="rounded-2xl border border-app-border bg-app-surface p-5 flex flex-col justify-between shadow-sm">
          <span className="text-[10px] font-bold text-app-text-secondary uppercase tracking-wider font-mono">
            Average Grade
          </span>
          <div className="mt-2 text-3xl sm:text-4xl font-black text-app-text-primary font-sans">
            {course.averageGrade || "—"}
          </div>
        </div>

        {/* Course Handout */}
        <div className="rounded-2xl border border-app-border bg-app-surface p-5 flex flex-col justify-between shadow-sm">
          <span className="text-[10px] font-bold text-app-text-secondary uppercase tracking-wider font-mono">
            Course Handout
          </span>
          <div className="mt-2">
            {course.courseHandoutUrl &&
            course.courseHandoutUrl.trim() !== "" &&
            course.courseHandoutUrl.trim() !== "-" &&
            course.courseHandoutUrl.trim() !== "—" ? (
              course.courseHandoutUrl === "#" ? (
                <button
                  onClick={handleDownloadHandout}
                  disabled={downloading}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-app-accent/10 px-3 py-1.5 text-xs font-bold text-app-accent hover:bg-app-accent/20 transition-all focus:outline-none"
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>{downloading ? "Preparing..." : "Download handout"}</span>
                </button>
              ) : (
                <a
                  href={course.courseHandoutUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-app-accent/10 px-3 py-1.5 text-xs font-bold text-app-accent hover:bg-app-accent/20 transition-all focus:outline-none"
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>Download handout</span>
                </a>
              )
            ) : (
              <span className="text-sm font-semibold text-app-text-secondary">—</span>
            )}
          </div>
        </div>
      </div>

      {/* Reviews List Section */}
      <div className="space-y-6 pt-4">
        <div className="flex items-center justify-between border-b border-app-border pb-3">
          <h2 className="font-sans text-xl font-bold text-app-text-primary flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-app-accent" />
            Student Reviews ({reviews.length})
          </h2>
          <span className="text-xs font-semibold text-app-text-secondary bg-app-surface px-3 py-1.5 rounded-lg border border-app-border">
            Verified BITSian feedback
          </span>
        </div>

        {reviews.length === 0 ? (
          <div className="rounded-3xl border border-app-border bg-app-surface p-10 text-center shadow-sm">
            <p className="text-sm text-app-text-secondary font-sans">
              No reviews have been added for this elective yet. Be the first to share your experience!
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((rev, idx) => (
              <ReviewCard
                key={rev.id}
                review={rev}
                index={idx}
                courseCategory={course.category}
                onSeeMore={() => onOpenReviewModal(rev, idx)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
