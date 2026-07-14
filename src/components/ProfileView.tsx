/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion } from "motion/react";
import { User, Review, Course, Project } from "../types";
import { Award, BookOpen, Star, Clock, Trash2, Mail, GraduationCap, User as UserIcon, Pencil, Check, X, FolderGit2 } from "lucide-react";

interface ProfileViewProps {
  user: User | null;
  reviews: Review[];
  courses: Course[];
  bookmarks: string[];
  onSelectCourse: (course: Course) => void;
  onLoginClick: () => void;
  onDeleteReview?: (reviewId: string) => void;
  onEditReview?: (review: Review) => void;
  onUpdateStudentId?: (newIdNo: string) => void;
  // Project review props
  projectReviews?: Project[];
  onDeleteProjectReview?: (projectId: string | number) => void;
  onEditProjectReview?: (project: Project) => void;
  currentUserId?: string | null;
}

export default function ProfileView({
  user,
  reviews,
  courses,
  bookmarks,
  onSelectCourse,
  onLoginClick,
  onDeleteReview,
  onEditReview,
  onUpdateStudentId,
  projectReviews = [],
  onDeleteProjectReview,
  onEditProjectReview,
  currentUserId,
}: ProfileViewProps) {
  if (!user) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-app-bg text-app-accent border border-app-border">
          <UserIcon className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-bold text-app-text-primary tracking-tight">Access your academic profile</h2>
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

  // Filter reviews contributed by this user
  const userReviews = reviews.filter((r) => r.submittedBy === user.email);

  const [isEditingId, setIsEditingId] = React.useState(false);
  const [tempIdNo, setTempIdNo] = React.useState(user.idNo || "");

  React.useEffect(() => {
    setTempIdNo(user.idNo || "");
  }, [user.idNo]);

  return (
    <div className="space-y-8 py-6">
      {/* Header Block */}
      <div className="border-b border-app-border pb-4">
        <h1 className="font-sans text-2xl font-extrabold tracking-tight text-app-text-primary sm:text-3xl">
          Student Dashboard
        </h1>
        <p className="text-xs text-app-text-secondary mt-1">
          Manage your course review submissions and view your registration card.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: BITS ID CARD MOCKUP */}
        <div className="space-y-6 lg:col-span-1">
          <h3 className="font-sans text-sm font-bold tracking-wider text-app-text-secondary uppercase font-mono">
            BITS Student Credentials
          </h3>

          <motion.div
            initial={{ rotateY: 15, rotateX: 5 }}
            animate={{ rotateY: 0, rotateX: 0 }}
            transition={{ duration: 0.8 }}
            className="relative overflow-hidden rounded-3xl bg-app-surface p-6 text-app-text-primary border border-app-accent shadow-md aspect-[1.58/1] hover:shadow-lg transition-all duration-300"
          >
            {/* Holographic RFID chip */}
            <div className="absolute top-6 right-6 h-8 w-11 rounded bg-gradient-to-br from-amber-200 via-yellow-100 to-amber-300 opacity-80 border border-amber-300/30 flex flex-col justify-between p-1.5">
              <div className="h-[2px] bg-zinc-800/40 w-full" />
              <div className="h-[2px] bg-zinc-800/40 w-2/3" />
              <div className="h-[2px] bg-zinc-800/40 w-3/4" />
            </div>

            {/* Card Content */}
            <div className="h-full flex flex-col justify-between">
              <div>
                <span className="block text-[10px] font-black tracking-widest text-app-accent uppercase font-mono">
                  BITS Pilani
                </span>
                <span className="block text-[8px] font-medium tracking-wider text-app-text-secondary uppercase mt-0.5 font-mono">
                  Verified Student Identity
                </span>
              </div>

              <div className="space-y-1.5 mt-4">
                <span className="block font-sans text-xl font-bold tracking-tight text-app-text-primary">
                  {user.name}
                </span>
                <div className="flex items-center gap-1.5 text-xs text-app-text-secondary">
                  <Mail className="h-3 w-3 shrink-0 text-app-text-secondary" />
                  <span className="truncate font-sans">{user.email}</span>
                </div>
              </div>

              <div className="flex items-end justify-between mt-4 pt-4 border-t border-app-border">
                <div>
                  <span className="block text-[8px] font-bold text-app-text-secondary uppercase font-mono">Student ID No.</span>
                  {isEditingId ? (
                    <div className="flex items-center gap-1 mt-1">
                      <input
                        type="text"
                        value={tempIdNo}
                        onChange={(e) => setTempIdNo(e.target.value)}
                        className="bg-app-bg text-app-text-primary font-mono text-xs font-bold border border-app-border rounded px-1.5 py-0.5 focus:outline-none focus:border-app-accent w-28 uppercase"
                        placeholder="e.g. 2023A7PS0334G"
                        autoFocus
                      />
                      <button
                        onClick={() => {
                          const cleaned = tempIdNo.trim().toUpperCase();
                          if (onUpdateStudentId) {
                            onUpdateStudentId(cleaned || "-");
                          }
                          setIsEditingId(false);
                        }}
                        className="p-1 hover:text-emerald-400 text-emerald-500 rounded"
                        title="Save"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setTempIdNo(user.idNo || "");
                          setIsEditingId(false);
                        }}
                        className="p-1 hover:text-red-400 text-red-500 rounded"
                        title="Cancel"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="block font-mono text-sm font-bold text-app-text-primary">
                        {user.idNo}
                      </span>
                      <button
                        onClick={() => {
                          setTempIdNo(user.idNo === "-" ? "" : (user.idNo || ""));
                          setIsEditingId(true);
                        }}
                        className="p-1 text-app-text-secondary hover:text-app-text-primary transition-colors"
                        title="Edit Student ID"
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <span className="block text-[8px] font-bold text-app-text-secondary uppercase font-mono">Campus</span>
                  <span className="block text-xs font-bold uppercase font-sans text-app-text-primary">{user.campus}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick stats panel */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-app-border bg-app-surface p-4 text-center">
              <span className="block text-2xl font-black text-app-text-primary">{userReviews.length + projectReviews.length}</span>
              <span className="text-[10px] font-bold text-app-text-secondary uppercase tracking-widest font-mono mt-1 block leading-tight">Reviews Contributed</span>
            </div>
            <div className="rounded-2xl border border-app-border bg-app-surface p-4 text-center">
              <span className="block text-2xl font-black text-app-text-primary">{bookmarks.length}</span>
              <span className="text-[10px] font-bold text-app-text-secondary uppercase tracking-widest font-mono mt-1 block leading-tight">Bookmarks Saved</span>
            </div>
          </div>
        </div>

        {/* Right Column: Contributed Reviews */}
        <div className="lg:col-span-2 space-y-8">

          {/* ── Course Reviews ── */}
          <div className="space-y-4">
            <h3 className="font-sans text-sm font-bold tracking-wider text-app-text-secondary uppercase font-mono">
              My Course Reviews ({userReviews.length})
            </h3>

            {userReviews.length === 0 ? (
              <div className="rounded-3xl border border-app-border bg-app-surface p-10 text-center">
                <BookOpen className="h-8 w-8 text-app-text-secondary mx-auto mb-3" />
                <p className="text-xs text-app-text-secondary font-sans">
                  You haven't contributed any course reviews yet.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {userReviews.map((rev) => {
                  const course = courses.find((c) => c.id === rev.courseId || c.code === rev.courseId);
                  return (
                    <div
                      key={rev.id}
                      className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-app-border bg-app-surface p-5 transition-all duration-300 hover:border-app-accent hover:shadow-sm"
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-app-accent font-mono">
                            {course?.code || "HEL"}
                          </span>
                          <span className="text-[10px] text-app-text-secondary font-mono">• {rev.semester}</span>
                        </div>
                        <h4
                          onClick={() => course && onSelectCourse(course)}
                          className="font-sans text-sm font-bold text-app-text-primary truncate cursor-pointer hover:text-app-accent transition-colors"
                        >
                          {course?.name || "Elective Course"}
                        </h4>
                        <p className="text-xs text-app-text-secondary italic line-clamp-1 font-sans">
                          "{rev.whatWorkedWell}"
                        </p>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                          <span className="block text-[8px] font-bold text-app-text-secondary uppercase font-mono font-sans">Grade</span>
                          <span className="text-sm font-black text-app-text-primary">{rev.gradeReceived}</span>
                        </div>
                        <div className="text-right">
                          <span className="block text-[8px] font-bold text-app-text-secondary uppercase font-mono font-sans">Marks</span>
                          <span className="text-sm font-black text-app-text-primary">{rev.marksReceived}</span>
                        </div>

                        {onEditReview && (
                          <button
                            onClick={() => onEditReview(rev)}
                            className="rounded-lg p-2 text-app-text-secondary hover:text-app-accent hover:bg-app-accent/10 transition-colors focus:outline-none"
                            title="Edit Review"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                        )}

                        {onDeleteReview && (
                          <button
                            onClick={() => onDeleteReview(rev.id)}
                            className="rounded-lg p-2 text-app-text-secondary hover:text-app-error hover:bg-app-error/10 transition-colors focus:outline-none"
                            title="Delete Review"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Project Reviews ── */}
          <div className="space-y-4">
            <h3 className="font-sans text-sm font-bold tracking-wider text-app-text-secondary uppercase font-mono">
              My Project Reviews ({projectReviews.length})
            </h3>

            {projectReviews.length === 0 ? (
              <div className="rounded-3xl border border-app-border bg-app-surface p-10 text-center">
                <FolderGit2 className="h-8 w-8 text-app-text-secondary mx-auto mb-3" />
                <p className="text-xs text-app-text-secondary font-sans">
                  You haven't submitted any project reviews yet.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {projectReviews.map((proj) => {
                  const isOwner = currentUserId && proj.user_id === currentUserId;
                  return (
                    <div
                      key={String(proj.id)}
                      className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-app-border bg-app-surface p-5 transition-all duration-300 hover:border-app-accent hover:shadow-sm"
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-app-accent font-mono">
                            {proj.type || "Project"}
                          </span>
                          <span className="text-[10px] text-app-text-secondary font-mono">• {proj.taken_in}</span>
                        </div>
                        <h4 className="font-sans text-sm font-bold text-app-text-primary truncate">
                          {proj.project_title}
                        </h4>
                        <p className="text-xs text-app-text-secondary line-clamp-1 font-sans">
                          Supervisor: <span className="font-semibold">{proj.prof_name}</span>
                          {proj.domain && ` · ${proj.domain}`}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right hidden sm:block">
                          <span className="block text-[8px] font-bold text-app-text-secondary uppercase font-mono">Branch</span>
                          <span className="text-xs font-bold text-app-text-primary">
                            {proj.student_branch.replace("B.E. ", "").replace("M.Sc. ", "")}
                          </span>
                        </div>

                        {isOwner && onEditProjectReview && (
                          <button
                            onClick={() => onEditProjectReview(proj)}
                            className="rounded-lg p-2 text-app-text-secondary hover:text-app-accent hover:bg-app-accent/10 transition-colors focus:outline-none"
                            title="Edit Project Review"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                        )}

                        {isOwner && onDeleteProjectReview && (
                          <button
                            onClick={() => onDeleteProjectReview(proj.id)}
                            className="rounded-lg p-2 text-app-text-secondary hover:text-app-error hover:bg-app-error/10 transition-colors focus:outline-none"
                            title="Delete Project Review"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
