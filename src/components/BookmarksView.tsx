/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion } from "motion/react";
import { Bookmark, Compass, BookOpen, GraduationCap, User as UserIcon, Award } from "lucide-react";
import { Course, Review, User } from "../types";
import CourseCard from "./CourseCard";
import { getBranchesFromStudentId, matchesBranchDepartment } from "../lib/student";

interface BookmarksViewProps {
  user: User | null;
  onLoginClick: () => void;
  courses: Course[];
  bookmarks: string[];
  reviews: Review[];
  onToggleBookmark: (e: React.MouseEvent, courseId: string) => void;
  onSelectCourse: (course: Course) => void;
  onExploreClick: () => void;
}

export default function BookmarksView({
  user,
  onLoginClick,
  courses,
  bookmarks,
  reviews,
  onToggleBookmark,
  onSelectCourse,
  onExploreClick,
}: BookmarksViewProps) {
  if (!user) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-app-bg text-app-accent border border-app-border">
          <Bookmark className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-bold text-app-text-primary tracking-tight">Access your saved bookmarks</h2>
        <p className="mt-2 text-sm text-app-text-secondary leading-relaxed font-sans">
          Authenticate with your verified BITSian account to access your personalized dashboard, manage bookmarks, track reviews submitted, and curate your elective priorities.
        </p>
        <button
          onClick={onLoginClick}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-app-accent px-6 py-3 font-semibold text-white hover:bg-app-accent-hover shadow-sm transition-all duration-200"
        >
          <span>Sign in with BITS Mail</span>
        </button>
      </div>
    );
  }

  const bookmarkedCourses = courses.filter((c) => bookmarks.includes(c.id) || bookmarks.includes(c.code));
  const helCourses = bookmarkedCourses.filter((c) => c.category === "HEL");
  const opelCourses = bookmarkedCourses.filter((c) => c.category === "OPEL_DEL");

  const hasEnteredId = !!(user?.idNo && user.idNo !== "-");
  const branches = hasEnteredId ? getBranchesFromStudentId(user.idNo) : [];

  const delCourses = opelCourses.filter((c) => {
    if (!hasEnteredId) return false;
    const courseDept = (c.dept || c.code.split(" ")[0] || "").toUpperCase().trim();
    return branches.some((branch) => matchesBranchDepartment(courseDept, branch));
  });

  const opelOnlyCourses = opelCourses.filter((c) => !delCourses.some((d) => d.id === c.id));

  return (
    <div className="space-y-10 py-6">
      {/* Header Block */}
      <div className="border-b border-app-border pb-4">
        <h1 className="font-sans text-2xl font-extrabold tracking-tight text-app-text-primary sm:text-3xl">
          My Bookmarked Courses
        </h1>
        <p className="text-xs text-app-text-secondary mt-1">
          Keep track of electives you are interested in for upcoming registration rounds.
        </p>
      </div>

      {bookmarkedCourses.length === 0 ? (
        /* Empty State */
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-md rounded-3xl border border-app-border bg-app-surface p-10 text-center"
        >
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-app-bg text-app-text-secondary border border-app-border">
            <Bookmark className="h-6 w-6 text-app-accent" />
          </div>
          <h3 className="font-sans text-lg font-bold text-app-text-primary">No bookmarked electives</h3>
          <p className="mt-2 text-xs text-app-text-secondary leading-relaxed font-sans">
            Your saved bookmarks will appear here. Star electives while browsing to build your priority list for registration.
          </p>
          <button
            onClick={onExploreClick}
            className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-app-accent px-5 py-2.5 text-xs font-bold text-white hover:bg-app-accent-hover transition-all duration-200 focus:outline-none"
          >
            <Compass className="h-4 w-4" />
            <span>Explore Electives</span>
          </button>
        </motion.div>
      ) : (
        /* Divided Sections */
        <div className="space-y-10">
          {/* Humanities Electives (HELs) */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-app-border pb-2.5">
              <BookOpen className="h-4 w-4 text-app-accent" />
              <h2 className="font-sans text-xs sm:text-sm font-bold uppercase tracking-wider text-app-text-primary">
                Humanities Electives (HELs)
              </h2>
              <span className="font-mono text-[10px] font-bold text-app-text-secondary bg-app-bg px-2 py-0.5 rounded-lg border border-app-border">
                {helCourses.length}
              </span>
            </div>
            {helCourses.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-app-border bg-app-surface/40 p-8 text-center text-xs text-app-text-secondary font-sans">
                No bookmarked HELs yet.
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {helCourses.map((course) => {
                  const courseReviews = reviews.filter((r) => r.courseId === course.id);
                  return (
                    <CourseCard
                      key={course.id}
                      course={course}
                      reviewCount={courseReviews.length}
                      isBookmarked={true}
                      onToggleBookmark={onToggleBookmark}
                      onClick={() => onSelectCourse(course)}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {!hasEnteredId ? (
            /* Open & Discipline Electives (OPELs/DELs) when Student ID not entered */
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-app-border pb-2.5">
                <GraduationCap className="h-4 w-4 text-app-accent" />
                <h2 className="font-sans text-xs sm:text-sm font-bold uppercase tracking-wider text-app-text-primary">
                  Open & Discipline Electives (OPELs/DELs)
                </h2>
                <span className="font-mono text-[10px] font-bold text-app-text-secondary bg-app-bg px-2 py-0.5 rounded-lg border border-app-border">
                  {opelCourses.length}
                </span>
              </div>
              {opelCourses.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-app-border bg-app-surface/40 p-8 text-center text-xs text-app-text-secondary font-sans">
                  No bookmarked OPELs/DELs yet.
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {opelCourses.map((course) => {
                    const courseReviews = reviews.filter((r) => r.courseId === course.id);
                    return (
                      <CourseCard
                        key={course.id}
                        course={course}
                        reviewCount={courseReviews.length}
                        isBookmarked={true}
                        onToggleBookmark={onToggleBookmark}
                        onClick={() => onSelectCourse(course)}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* Show 3 sections when Student ID is entered: HELs (shown above), DELs, then OPELs */
            <>
              {/* Discipline Electives (DELs) */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-app-border pb-2.5">
                  <Award className="h-4 w-4 text-app-accent" />
                  <h2 className="font-sans text-xs sm:text-sm font-bold uppercase tracking-wider text-app-text-primary">
                    Discipline Electives (DELs)
                  </h2>
                  <span className="font-mono text-[10px] font-bold text-app-text-secondary bg-app-bg px-2 py-0.5 rounded-lg border border-app-border">
                    {delCourses.length}
                  </span>
                </div>
                {delCourses.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-app-border bg-app-surface/40 p-8 text-center text-xs text-app-text-secondary font-sans">
                    No bookmarked DELs yet.
                  </div>
                ) : (
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {delCourses.map((course) => {
                      const courseReviews = reviews.filter((r) => r.courseId === course.id);
                      return (
                        <CourseCard
                          key={course.id}
                          course={course}
                          reviewCount={courseReviews.length}
                          isBookmarked={true}
                          onToggleBookmark={onToggleBookmark}
                          onClick={() => onSelectCourse(course)}
                        />
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Open Electives (OPELs) */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-app-border pb-2.5">
                  <GraduationCap className="h-4 w-4 text-app-accent" />
                  <h2 className="font-sans text-xs sm:text-sm font-bold uppercase tracking-wider text-app-text-primary">
                    Open Electives (OPELs)
                  </h2>
                  <span className="font-mono text-[10px] font-bold text-app-text-secondary bg-app-bg px-2 py-0.5 rounded-lg border border-app-border">
                    {opelOnlyCourses.length}
                  </span>
                </div>
                {opelOnlyCourses.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-app-border bg-app-surface/40 p-8 text-center text-xs text-app-text-secondary font-sans">
                    No bookmarked OPELs yet.
                  </div>
                ) : (
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {opelOnlyCourses.map((course) => {
                      const courseReviews = reviews.filter((r) => r.courseId === course.id);
                      return (
                        <CourseCard
                          key={course.id}
                          course={course}
                          reviewCount={courseReviews.length}
                          isBookmarked={true}
                          onToggleBookmark={onToggleBookmark}
                          onClick={() => onSelectCourse(course)}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
