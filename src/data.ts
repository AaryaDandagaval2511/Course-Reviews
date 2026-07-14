/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Course, Review } from "./types";

export const INITIAL_COURSES: Course[] = [];

export const INITIAL_REVIEWS: Review[] = [];

export const INITIAL_PROJECTS = [];

export function getBookmarkCount(courseId: string, isBookmarked: boolean, dbCount?: number): number {
  if (dbCount !== undefined) {
    return dbCount;
  }
  const baseCounts: Record<string, number> = {};
  const base = baseCounts[courseId] || 15;
  return base + (isBookmarked ? 1 : 0);
}

