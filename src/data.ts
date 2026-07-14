/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Course, Review } from "./types";

export const INITIAL_COURSES: Course[] = [];

export const INITIAL_REVIEWS: Review[] = [];

export const INITIAL_PROJECTS = [];

export function getBookmarkCount(courseId: string, isBookmarked: boolean, dbCount?: number): number {
  // The authoritative bookmark count is fetched from Supabase and passed as `dbCount`.
  // If `dbCount` is available, return it directly.
  // Otherwise, default to 0 (no bookmarks). The UI state updates handle optimistic counts.
  return dbCount !== undefined ? dbCount : 0;
}

