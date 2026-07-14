/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion } from "motion/react";
import { MessageSquare, Bookmark, User } from "lucide-react";
import { Course } from "../types";
import { useContext } from "react";
import { BookmarkCountsContext } from "../App";

interface CourseCardProps {
  key?: React.Key;
  course: Course;
  reviewCount: number;
  isBookmarked: boolean;
  onToggleBookmark: (e: React.MouseEvent, courseId: string) => void;
  onClick: () => void;
}

export default function CourseCard({
  course,
  reviewCount,
  isBookmarked,
  onToggleBookmark,
  onClick,
}: CourseCardProps) {
  const { bookmarkCounts } = useContext(BookmarkCountsContext);
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className="group relative flex flex-col justify-between overflow-hidden rounded-3xl bg-app-surface p-6 text-app-text-primary border border-app-border cursor-pointer transition-all duration-300 hover:border-app-accent hover:shadow-sm"
    >

      {/* Card Header */}
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-xs font-semibold tracking-wider text-app-text-secondary uppercase">
            {course.code}
          </span>
          <button
            onClick={(e) => onToggleBookmark(e, course.id)}
            className="rounded-full p-1.5 text-app-text-secondary hover:text-app-accent hover:bg-app-bg transition-all duration-200 focus:outline-none"
            title={isBookmarked ? "Remove from Bookmarks" : "Add to Bookmarks"}
          >
            <Bookmark
              className={`h-4.5 w-4.5 transition-transform duration-200 ${
                isBookmarked ? "fill-app-accent text-app-accent scale-105" : "text-app-text-secondary"
              }`}
            />
          </button>
        </div>

        {/* Title */}
        <h3 className="mt-2.5 font-sans text-lg font-bold leading-tight text-app-text-primary group-hover:text-app-accent transition-colors">
          {course.name}
        </h3>

        {/* Instructor */}
        {course.instructor && (
          <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-app-text-secondary">
            <User className="h-3.5 w-3.5 text-app-text-secondary shrink-0" />
            <span className="truncate">by {course.instructor}</span>
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="mt-6 flex items-center justify-between border-t border-app-border pt-4 text-xs font-semibold text-app-text-secondary">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <MessageSquare className="h-3.5 w-3.5 text-app-text-secondary" />
            <span>
              {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
            </span>
          </div>

          <div className="flex items-center gap-1 text-app-text-secondary/70" title="Saved bookmarks count">
            <Bookmark className="h-3.5 w-3.5 text-app-text-secondary/60" />
            <span className="font-mono text-[11px] font-normal">
                             {bookmarkCounts[course.code] || 0}
            </span>
          </div>
        </div>

        {course.averageGrade && (
          <div className="flex items-center gap-1 bg-app-bg text-app-text-primary px-2.5 py-0.5 rounded-full border border-app-border">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-app-text-secondary">Avg:</span>
            <span className="font-bold">{course.averageGrade}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
