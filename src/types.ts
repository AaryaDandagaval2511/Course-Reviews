/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Review {
  id: string;
  courseId: string;
  semester: string; // e.g. "First Semester 2024-2025"
  gradeReceived: string; // e.g. "A"
  marksReceived: string; // e.g. "87" or "83/100"
  commentsOnGrading: string;
  evaluativeComponents: string;
  evaluationType: string; // e.g. "Mid sem, compre open handwritten notes"
  attendanceExpectations: string;
  courseMaterialsProvided: string; // "yes" or detailed description
  prNo: string; // e.g. "< 200", "200-500", etc.
  whatWorkedWell: string;
  thingsToKeepInMind: string;
  adviceFromReviewer: string;
  submittedBy: string; // user email or "Anonymous BITSian"
  submittedAt: string; // ISO date string
  icForSemester?: string; // Optional field for OPEL/DEL reviews
  additionalComments?: string;
  userId?: string;
  avMarks?: string;
  avGrade?: string;
  courseTotal?: string;
}

export interface Course {
  id: string; // e.g. "HSS_F368"
  code: string; // "HSS F368"
  name: string; // "Asian Cinemas and Cultures"
  instructor: string; // "AILEEN BLANEY"
  category: "HEL" | "OPEL_DEL";
  averageMarks?: string; // e.g. "83/100"
  averageGrade?: string; // e.g. "A"
  courseTotal?: string; // e.g. "87"
  courseHandoutUrl?: string; // link or indicator
  description?: string; // Course details & info description
  bookmarkCount?: number;
  reviewCount?: number;
  dept?: string;
  nickname?: string;
}

export interface User {
  email: string;
  name: string;
  campus: "Pilani" | "Goa" | "Hyderabad" | "Dubai";
  idNo: string; // Mock BITS ID
}

export interface Project {
  id: string | number;
  prof_name: string;
  project_title: string;
  project_info: string;
  student_branch: string;
  prof_branch: string;
  domain?: string;
  type?: string;
  taken_in: string;
  experience: string;
  grade_rece?: string;
  user_id?: string;
  created_at?: string;
}

export type Page = "home" | "browse" | "course-details" | "submit-review" | "bookmarks" | "profile" | "projects";
