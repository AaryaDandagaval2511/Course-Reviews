/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion } from "motion/react";
import { Calendar, Award, Star, ArrowRight, User } from "lucide-react";
import { Review } from "../types";

interface ReviewCardProps {
  key?: React.Key;
  review: Review;
  index: number;
  courseCategory?: "HEL" | "OPEL_DEL";
  onSeeMore: () => void;
}

export default function ReviewCard({ review, index, courseCategory, onSeeMore }: ReviewCardProps) {
  const getPreviewText = () => {
    const fields = [
      review.whatWorkedWell,
      review.thingsToKeepInMind,
      review.adviceFromReviewer,
      review.commentsOnGrading,
      review.evaluationType,
      review.additionalComments
    ];
    for (const field of fields) {
      if (field && field.trim() !== "" && field.trim() !== "—") {
        return field;
      }
    }
    return "—";
  };

  const previewText = getPreviewText();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group flex flex-col justify-between rounded-3xl bg-app-surface p-6 text-app-text-primary border border-app-border transition-all duration-300 hover:border-app-accent hover:shadow-sm"
    >
      <div>
        {/* Header: Review Number */}
        <div className="flex items-center pb-3 border-b border-app-border">
          <span className="font-mono text-xs font-bold text-app-text-primary bg-app-bg px-2.5 py-1 rounded-xl border border-app-border">
            Review #{index + 1}
          </span>
        </div>

        {/* Highlighted Metadata Badges */}
        <div className="mt-4 space-y-2 text-xs">
          {/* Semester Badge taking full width */}
          <div className="flex items-center gap-1.5 rounded-xl bg-app-bg border border-app-border px-2.5 py-1.5 w-full">
            <Calendar className="h-3.5 w-3.5 text-app-text-secondary shrink-0" />
            <span className="text-app-text-primary font-medium whitespace-nowrap overflow-visible">
              {review.semester}
            </span>
          </div>
          
          {/* Grade and Marks Side by Side */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-1.5 rounded-xl bg-app-bg border border-app-border px-2.5 py-1.5">
              <Award className="h-3.5 w-3.5 text-app-text-secondary shrink-0" />
              <span className="text-app-text-primary font-semibold">
                Grade: <span className="text-app-text-primary">{review.gradeReceived}</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5 rounded-xl bg-app-bg border border-app-border px-2.5 py-1.5">
              <Star className="h-3.5 w-3.5 text-app-warning shrink-0 fill-app-warning/10" />
              <span className="text-app-text-primary font-semibold">
                Marks: <span className="text-app-text-primary font-semibold">{review.marksReceived}</span>
              </span>
            </div>
          </div>

          {/* IC for Semester Badge */}
          {courseCategory === "OPEL_DEL" && review.icForSemester && (
            <div className="flex items-center gap-1.5 rounded-xl bg-app-bg border border-app-border px-2.5 py-1.5 w-full">
              <User className="h-3.5 w-3.5 text-app-text-secondary shrink-0" />
              <span className="text-app-text-primary font-semibold truncate" title={review.icForSemester}>
                IC: <span className="text-app-text-primary font-normal">{review.icForSemester}</span>
              </span>
            </div>
          )}
        </div>

        {/* Core Review Quote */}
        <div className="mt-4">
          <p className="text-sm font-medium leading-relaxed text-app-text-secondary italic border-l-2 border-app-accent pl-3">
            "{previewText.length > 140
              ? `${previewText.substring(0, 140)}...`
              : previewText}"
          </p>
        </div>
      </div>

      {/* See More Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={onSeeMore}
          className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold text-app-text-primary bg-app-bg hover:bg-app-surface border border-app-border hover:border-app-accent hover:text-app-accent transition-all focus:outline-none"
        >
          <span>See more</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </motion.div>
  );
}
