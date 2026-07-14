/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, ChevronDown, Filter, SlidersHorizontal, BookOpen, Compass, AlertCircle, Heart } from "lucide-react";
import { Course, Review, User, Page, Project } from "./types";
import { supabase } from "./supabaseClient";

// Subcomponents
import Header from "./components/Header";
import CategorySelection from "./components/CategorySelection";
import CourseDetails from "./components/CourseDetails";
import SubmitReview from "./components/SubmitReview";
import BookmarksView from "./components/BookmarksView";
import ProfileView from "./components/ProfileView";
import LoginView from "./components/LoginView";
import CourseCard from "./components/CourseCard";
import ReviewModal from "./components/ReviewModal";
import ProjectsView from "./components/ProjectsView";
import ScrollToTop from "./components/ScrollToTop";

// Helper to derive BITS Student ID and name from BITS Goa email prefix
function getBitsIdAndName(email: string, fullName?: string) {
  const prefix = email.split("@")[0].toLowerCase();
  const digitsMatch = prefix.match(/\d+/);
  let year = "2022";
  let seqNo = "0199";
  if (digitsMatch && digitsMatch[0].length >= 7) {
    const digits = digitsMatch[0];
    year = digits.substring(0, 4);
    seqNo = digits.substring(4, 7) || "0199";
  } else if (digitsMatch && digitsMatch[0].length >= 4) {
    year = digitsMatch[0].substring(0, 4);
    seqNo = Math.floor(Math.random() * 800 + 100).toString();
  }

  const idNo = `${year}A7PS${seqNo}G`;
  
  let name = fullName;
  if (!name) {
    const nameParts = prefix.replace(/\d+/g, "").split(/[._]/).map(p => p.charAt(0).toUpperCase() + p.slice(1));
    name = nameParts.filter(Boolean).join(" ") || "Student BITSian";
  }
  
  return { idNo, name };
}

// Helper to get a deterministic UUID from any email string (ensures mock/local logins get valid Postgres UUIDs)
function getUuidFromEmail(email: string): string {
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    const char = email.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  const hex = Math.abs(hash).toString(16).padEnd(8, "0");
  return `${hex}-0000-4000-8000-000000000000`;
}

// Helper to map BITSian emails to universally valid domains for Supabase GoTrue Auth
function mapEmailForSupabase(email: string): string {
  if (!email) return "";
  const lower = email.toLowerCase().trim();
  if (lower.includes("@") && (lower.endsWith(".bits-pilani.ac.in") || lower.endsWith(".ac.in"))) {
    const parts = lower.split("@");
    const username = parts[0];
    const domain = parts[1];
    
    // Extract first domain segment (e.g., 'goa', 'pilani', 'hyderabad', etc.)
    const firstSegment = domain.split(".")[0];
    // If it's just bits-pilani, use 'bits'
    const suffix = firstSegment === "bits-pilani" ? "bits" : firstSegment;
    
    // Keep only letters, numbers, dots, and underscores for maximum email regex safety
    const safeUsername = username.replace(/[^a-z0-9._]/g, "");
    
    return `${safeUsername}_${suffix}@gmail.com`;
  }
  return lower;
}

// Helper to ensure a valid Supabase Auth session exists for the user.
async function ensureSupabaseSession(email?: string, name?: string): Promise<string | null> {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData.session?.user?.id) {
      return sessionData.session.user.id;
    }

    if (email) {
      const supabaseEmail = mapEmailForSupabase(email);
      const defaultPassword = "MockPassword123!";

      console.log("ensureSupabaseSession: establishing background session for", supabaseEmail);
      try {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: supabaseEmail,
          password: defaultPassword,
        });

        if (signInData?.user?.id) {
          return signInData.user.id;
        }

        if (signInError) {
          console.log("ensureSupabaseSession: background sign in failed, attempting background sign up...");
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: supabaseEmail,
            password: defaultPassword,
            options: {
              data: {
                full_name: name || "Student BITSian",
              }
            }
          });

          if (signUpData?.user?.id) {
            try {
              const { data: reSignInData } = await supabase.auth.signInWithPassword({
                email: supabaseEmail,
                password: defaultPassword,
              });
              if (reSignInData?.user?.id) {
                return reSignInData.user.id;
              }
            } catch (reSignInErr) {
              console.warn("ensureSupabaseSession: re-signin threw error, returning signup user id", reSignInErr);
            }
            return signUpData.user.id;
          } else if (signUpError) {
            console.error("ensureSupabaseSession: background signUp failed:", signUpError.message);
          }
        }
      } catch (authErr: any) {
        console.warn("ensureSupabaseSession: Supabase authentication threw error (e.g. offline/network issue). Falling back to deterministic UUID.", authErr.message || authErr);
        return getUuidFromEmail(email);
      }
    }
  } catch (err) {
    console.error("Error in ensureSupabaseSession helper:", err);
  }
  return email ? getUuidFromEmail(email) : null;
}

export default function App() {
  // Theme State
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const savedTheme = localStorage.getItem("bits_theme");
    return savedTheme === "light" ? "light" : "dark";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("bits_theme", theme);
  }, [theme]);

  // Page States
  const [activePage, setActivePage] = useState<Page>("home");
  const [submitReviewInitialCategory, setSubmitReviewInitialCategory] = useState<"HEL" | "OPEL_DEL" | "projects">("HEL");
  const [selectedCategory, setSelectedCategory] = useState<"HEL" | "OPEL_DEL" | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Authentication State (Preset Aarya Dan with valid Goa email for a full-featured start)
  const [user, setUser] = useState<User | null>(() => {
    const isLoggedOut = localStorage.getItem("bits_user_logged_out") === "true";
    if (isLoggedOut) {
      return null;
    }
    const savedUser = localStorage.getItem("bits_user");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed.campus !== "Goa") {
          parsed.campus = "Goa";
        }
        const savedId = localStorage.getItem("student_id_" + parsed.email);
        parsed.idNo = savedId || "-";
        localStorage.setItem("bits_user", JSON.stringify(parsed));
        return parsed;
      } catch (e) {
        return null;
      }
    }
    const defaultEmail = "aarya.dan@goa.bits-pilani.ac.in";
    const savedId = localStorage.getItem("student_id_" + defaultEmail);
    return {
      email: defaultEmail,
      name: "Aarya Dan",
      campus: "Goa",
      idNo: savedId || "-",
    };
  });

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Data States
  const [courses, setCourses] = useState<Course[]>(() => {
    const savedCourses = localStorage.getItem("bits_courses");
    const parsed: Course[] = savedCourses ? JSON.parse(savedCourses) : [];
    return parsed.map((c) => ({
      ...c,
      dept: c.dept || c.code.split(" ")[0],
    }));
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    const savedReviews = localStorage.getItem("bits_reviews");
    return savedReviews ? JSON.parse(savedReviews) : [];
  });

  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    const savedBookmarks = localStorage.getItem("bits_bookmarks");
    return savedBookmarks ? JSON.parse(savedBookmarks) : ["HSS_F368", "HSS_F391"]; // Default preset bookmarks
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const savedProjects = localStorage.getItem("bits_projects");
    return savedProjects ? JSON.parse(savedProjects) : [];
  });

  // Supabase Course Details states
  const [currentCourseReviews, setCurrentCourseReviews] = useState<Review[]>([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Modal States
  const [activeReviewModal, setActiveReviewModal] = useState<Review | null>(null);
  const [reviewModalIndex, setReviewModalIndex] = useState<number>(0);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Edit Review State
  const [reviewToEdit, setReviewToEdit] = useState<Review | null>(null);
  const [reviewToDeleteId, setReviewToDeleteId] = useState<string | null>(null);

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<"name" | "code" | "reviews" | "grade">("reviews");
  const [filterDept, setFilterDept] = useState<string>("all");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [delDMappings, setDelDMappings] = useState<{ course_code: string; branch_dep: string }[]>([]);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem("bits_courses", JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem("bits_reviews", JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem("bits_bookmarks", JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem("bits_projects", JSON.stringify(projects));
  }, [projects]);

  // Reset department filter when category changes
  useEffect(() => {
    setFilterDept("all");
  }, [selectedCategory]);

  // Load database courses from Supabase for Browse Electives page
  useEffect(() => {
    const loadSupabaseData = async () => {
      try {
        // Fetch HEL courses
        let dbCourses: any[] = [];
        try {
          const { data, error } = await supabase.from("courses").select("*");
          if (!error && data) dbCourses = data;
        } catch (e) {
          console.warn("Error fetching HEL courses from Supabase:", e);
        }

        // Fetch OPEL/DEL courses
        let dbDelCourses: any[] = [];
        try {
          const { data, error } = await supabase.from("del_c").select("*");
          if (!error && data) dbDelCourses = data;
        } catch (e) {
          console.warn("Error fetching OPEL/DEL courses from Supabase:", e);
        }

        // Fetch HEL reviews for counts
        let dbReviews: any[] = [];
        try {
          const { data, error } = await supabase.from("reviews").select("course_code");
          if (!error && data) dbReviews = data;
        } catch (e) {
          console.warn("Error fetching HEL reviews from Supabase:", e);
        }

        // Fetch OPEL/DEL reviews for counts
        let dbDelReviews: any[] = [];
        try {
          const { data, error } = await supabase.from("del_r").select("course_code");
          if (!error && data) dbDelReviews = data;
        } catch (e) {
          console.warn("Error fetching OPEL/DEL reviews from Supabase:", e);
        }

        // Fetch bookmarks for counts
        let dbBookmarks: any[] = [];
        try {
          const { data, error } = await supabase.from("bookmarks").select("course_code");
          if (!error && data) dbBookmarks = data;
        } catch (e) {
          console.warn("Error fetching bookmarks from Supabase:", e);
        }

        // Fetch del_d mappings
        let dbDelD: any[] = [];
        try {
          const { data, error } = await supabase.from("del_d").select("*");
          if (!error && data) {
            dbDelD = data;
            setDelDMappings(data);
          } else {
            setDelDMappings([]);
          }
        } catch (e) {
          console.warn("Error fetching del_d from Supabase:", e);
          setDelDMappings([]);
        }

        // Fetch projects from Supabase
        try {
          const { data, error } = await supabase.from("projects").select("*");
          if (!error && data && data.length > 0) {
            setProjects(data);
          }
        } catch (e) {
          console.warn("Error fetching projects from Supabase:", e);
        }

        const reviewCounts: Record<string, number> = {};
        dbReviews.forEach((r) => {
          if (r.course_code) {
            reviewCounts[r.course_code] = (reviewCounts[r.course_code] || 0) + 1;
          }
        });
        dbDelReviews.forEach((r) => {
          if (r.course_code) {
            reviewCounts[r.course_code] = (reviewCounts[r.course_code] || 0) + 1;
          }
        });

        const bookmarkCounts: Record<string, number> = {};
        dbBookmarks.forEach((b) => {
          if (b.course_code) {
            bookmarkCounts[b.course_code] = (bookmarkCounts[b.course_code] || 0) + 1;
          }
        });

        const mappedHelCourses: Course[] = dbCourses.map((c) => {
          const code = c.course_code || "";
          const dept = (c.course_dept || "").toUpperCase();
          return {
            id: code,
            code: code,
            name: c.course_name || "",
            instructor: c.prof || "",
            category: "HEL",
            averageGrade: c.av_grade || undefined,
            averageMarks: c.av_marks ? `${c.av_marks}/${c.course_total || '100'}` : undefined,
            courseTotal: c.course_total ? String(c.course_total) : undefined,
            courseHandoutUrl: c.course_handout || undefined,
            description: c.info || "",
            bookmarkCount: bookmarkCounts[code] || 0,
            reviewCount: reviewCounts[code] || 0,
            dept: dept || code.split(" ")[0],
            nickname: c.nickname || "",
          };
        });

        const mappedDelCourses: Course[] = dbDelCourses.map((c) => {
          const code = c.course_code || "";
          const dept = (c.course_dept || "").toUpperCase();
          return {
            id: code,
            code: code,
            name: c.course_name || "",
            instructor: c.prof || "",
            category: "OPEL_DEL",
            averageGrade: c.av_grade || undefined,
            averageMarks: c.av_marks ? `${c.av_marks}/${c.course_total || '100'}` : undefined,
            courseTotal: c.course_total ? String(c.course_total) : undefined,
            courseHandoutUrl: c.course_handout || undefined,
            description: c.info || "",
            bookmarkCount: bookmarkCounts[code] || 0,
            reviewCount: reviewCounts[code] || 0,
            dept: dept || code.split(" ")[0],
            nickname: c.nickname || "",
          };
        });

        const allMapped = [...mappedHelCourses, ...mappedDelCourses];
        if (allMapped.length > 0) {
          setCourses(allMapped);
        }
      } catch (err) {
        console.warn("Could not load Browse Electives from Supabase (falling back to local data):", err);
      }
    };

    loadSupabaseData();
  }, []);

  // Load user's real bookmarks from Supabase on login
  useEffect(() => {
    const loadUserBookmarks = async () => {
      if (!user) return;
      try {
        const supabaseUserId = await ensureSupabaseSession(user.email, user.name);
        if (!supabaseUserId) {
          console.error("Could not obtain a valid Supabase user ID for bookmarks loading.");
          const localSaved = localStorage.getItem(`bookmarks_${user.email}`);
          if (localSaved) {
            setBookmarks(JSON.parse(localSaved));
          }
          return;
        }

        const { data: dbUserBookmarks, error } = await supabase
          .from("bookmarks")
          .select("course_code")
          .eq("user_id", supabaseUserId);

        if (error) {
          console.error("Supabase load bookmarks error:", error.message, error.details || "", error.hint || "");
          const localSaved = localStorage.getItem(`bookmarks_${user.email}`);
          if (localSaved) {
            setBookmarks(JSON.parse(localSaved));
          }
          return;
        }

        if (dbUserBookmarks) {
          const userBookmarkedCodes = dbUserBookmarks.map((b) => b.course_code).filter(Boolean);
          setBookmarks(userBookmarkedCodes);
          localStorage.setItem(`bookmarks_${user.email}`, JSON.stringify(userBookmarkedCodes));
        }
      } catch (err) {
        console.error("Could not load user bookmarks from Supabase:", err);
        const localSaved = localStorage.getItem(`bookmarks_${user.email}`);
        if (localSaved) {
          setBookmarks(JSON.parse(localSaved));
        }
      }
    };

    loadUserBookmarks();
  }, [user]);

  // Load user's real reviews from Supabase on login
  useEffect(() => {
    const loadUserReviews = async () => {
      if (!user) return;
      try {
        const supabaseUserId = await ensureSupabaseSession(user.email, user.name);
        if (!supabaseUserId) {
          console.error("Could not obtain a valid Supabase user ID for reviews loading.");
          return;
        }

        // Fetch user reviews from HEL reviews
        const { data: dbReviews, error: reviewsError } = await supabase
          .from("reviews")
          .select("*")
          .eq("user_id", supabaseUserId);

        // Fetch user reviews from OPEL/DEL reviews
        const { data: dbDelReviews, error: delReviewsError } = await supabase
          .from("del_r")
          .select("*")
          .eq("user_id", supabaseUserId);

        if (reviewsError) {
          console.error("Supabase load HEL user reviews error:", reviewsError.message);
        }
        if (delReviewsError) {
          console.error("Supabase load OPEL/DEL user reviews error:", delReviewsError.message);
        }

        const mappedReviews: Review[] = [];

        if (dbReviews) {
          dbReviews.forEach((r) => {
            const courseCode = r.course_code;
            const course = courses.find((c) => c.code === courseCode || c.id === courseCode);
            mappedReviews.push({
              id: r.review_id || String(r.id),
              courseId: course?.id || courseCode,
              semester: r.taken_in || "N/A",
              gradeReceived: r.your_grade || "—",
              marksReceived: r.av_plus || "—",
              commentsOnGrading: r.gr_comm || "—",
              evaluativeComponents: r.evals || "—",
              evaluationType: r.open_book || "—",
              attendanceExpectations: r.attendance || "—",
              courseMaterialsProvided: r.slides || "—",
              prNo: r.pr_no || "—",
              whatWorkedWell: r.rec || r.info || "—",
              thingsToKeepInMind: r.not_rec || "—",
              adviceFromReviewer: r.advice || "—",
              additionalComments: r.comments || "—",
              submittedBy: user.email,
              submittedAt: r.created_at || new Date().toISOString(),
              userId: r.user_id || undefined,
            });
          });
        }

        if (dbDelReviews) {
          dbDelReviews.forEach((r) => {
            const courseCode = r.course_code;
            const course = courses.find((c) => c.code === courseCode || c.id === courseCode);
            mappedReviews.push({
              id: r.review_id || String(r.id),
              courseId: course?.id || courseCode,
              semester: r.taken_in || "N/A",
              gradeReceived: r.your_grade || "—",
              marksReceived: r.av_plus || "—",
              commentsOnGrading: r.gr_comm || "—",
              evaluativeComponents: r.evals || "—",
              evaluationType: r.open_book || "—",
              attendanceExpectations: r.attendance || "—",
              courseMaterialsProvided: r.slides || "—",
              prNo: r.pr_no || "—",
              whatWorkedWell: r.rec || r.info || "—",
              thingsToKeepInMind: r.not_rec || "—",
              adviceFromReviewer: r.advice || "—",
              additionalComments: r.comments || "—",
              submittedBy: user.email,
              submittedAt: r.created_at || new Date().toISOString(),
              icForSemester: r.sem_ic || r.prof || undefined,
              avMarks: r.av_marks || undefined,
              avGrade: r.av_grade || undefined,
              courseTotal: r.course_total || undefined,
              userId: r.user_id || undefined,
            });
          });
        }

        if (mappedReviews.length > 0) {
          setReviews((prev) => {
            // Keep reviews that are NOT written by the user
            const otherReviews = prev.filter((r) => r.submittedBy !== user.email);
            return [...mappedReviews, ...otherReviews];
          });
        }
      } catch (err) {
        console.error("Could not load user reviews from Supabase:", err);
      }
    };

    loadUserReviews();
  }, [user, courses]);

  // Load dynamic metrics and reviews from Supabase when entering course details
  useEffect(() => {
    const loadDetailsFromDb = async () => {
      if (activePage !== "course-details" || !selectedCourse) return;

      // Start with cached local reviews to avoid a blank screen
      const localFiltered = reviews.filter((r) => r.courseId === selectedCourse.id);
      setCurrentCourseReviews(localFiltered);

      setIsLoadingDetails(true);
      try {
        const code = selectedCourse.code;
        const category = selectedCourse.category || "HEL";
        const isOpelDel = category === "OPEL_DEL";
        const courseTable = isOpelDel ? "del_c" : "courses";
        const reviewsTable = isOpelDel ? "del_r" : "reviews";

        // 1. Fetch course details
        const { data: dbCourse, error: courseError } = await supabase
          .from(courseTable)
          .select("*")
          .eq("course_code", code)
          .maybeSingle();

        // 2. Fetch bookmark count for this course code
        const { count: dbBookmarkCount, error: countError } = await supabase
          .from("bookmarks")
          .select("*", { count: "exact", head: true })
          .eq("course_code", code);

        // 3. Fetch reviews for this course code
        const { data: dbReviews, error: reviewsError } = await supabase
          .from(reviewsTable)
          .select("*")
          .eq("course_code", code);

        if (!courseError && dbCourse) {
          const dept = (dbCourse.course_dept || "").toUpperCase();
          const mappedCategory = isOpelDel ? "OPEL_DEL" : "HEL";

          const updated: Course = {
            id: selectedCourse.id,
            code: selectedCourse.code,
            name: dbCourse.course_name || selectedCourse.name,
            instructor: dbCourse.prof || selectedCourse.instructor,
            category: mappedCategory,
            averageGrade: dbCourse.av_grade || undefined,
            averageMarks: dbCourse.av_marks ? `${dbCourse.av_marks}/${dbCourse.course_total || '100'}` : undefined,
            courseTotal: dbCourse.course_total ? String(dbCourse.course_total) : undefined,
            courseHandoutUrl: dbCourse.course_handout || undefined,
            description: dbCourse.info || "",
            bookmarkCount: dbBookmarkCount !== null ? dbBookmarkCount : selectedCourse.bookmarkCount,
            dept: dept || selectedCourse.code.split(" ")[0],
            nickname: dbCourse.nickname || "",
          };

          // Update selectedCourse with database-mapped properties
          setSelectedCourse(updated);

          // Update in global courses list as well
          setCourses((prev) =>
            prev.map((c) => (c.code === code ? { ...c, ...updated } : c))
          );
        } else {
          if (!countError && dbBookmarkCount !== null) {
            setSelectedCourse((prev) =>
              prev ? { ...prev, bookmarkCount: dbBookmarkCount } : null
            );
          }
        }

        if (!reviewsError && dbReviews) {
          let supabaseUserId: string | null = null;
          if (user) {
            try {
              supabaseUserId = await ensureSupabaseSession(user.email, user.name);
            } catch (e) {
              console.warn("Could not retrieve Supabase session:", e);
            }
          }

          const mappedReviews: Review[] = dbReviews.map((r) => {
            const isOwnReview = r.user_id && supabaseUserId && r.user_id === supabaseUserId;
            return {
              id: r.review_id || String(r.id || `db_rev_${Math.random()}`),
              courseId: selectedCourse.id,
              semester: r.taken_in || "N/A",
              gradeReceived: r.your_grade || "—",
              marksReceived: r.av_plus || "—",
              commentsOnGrading: r.gr_comm || "—",
              evaluativeComponents: r.evals || "—",
              evaluationType: r.open_book || "—",
              attendanceExpectations: r.attendance || "—",
              courseMaterialsProvided: r.slides || "—",
              prNo: r.pr_no || "—",
              whatWorkedWell: r.rec || r.info || "—",
              thingsToKeepInMind: r.not_rec || "—",
              adviceFromReviewer: r.advice || "—",
              additionalComments: r.comments || "—",
              submittedBy: isOwnReview && user ? user.email : (r.user_id ? "BITSian" : "Anonymous BITSian"),
              submittedAt: r.created_at || new Date().toISOString(),
              icForSemester: isOpelDel ? (r.sem_ic || r.prof || undefined) : undefined,
              avMarks: isOpelDel ? (r.av_marks || undefined) : undefined,
              avGrade: isOpelDel ? (r.av_grade || undefined) : undefined,
              courseTotal: isOpelDel ? (r.course_total || undefined) : undefined,
              userId: r.user_id || undefined,
            };
          });

          // Sort reviews by date descending if possible
          mappedReviews.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

          setCurrentCourseReviews(mappedReviews);
        }
      } catch (err) {
        console.warn("Error fetching live course details from Supabase:", err);
      } finally {
        setIsLoadingDetails(false);
      }
    };

    loadDetailsFromDb();
  }, [activePage, selectedCourse?.code]);

  const refreshBookmarkData = async (courseCode: string, courseId: string) => {
    try {
      // 1. Fetch exact bookmark count for this course code from Supabase bookmarks table
      let dbBookmarkCount: number | null = null;
      try {
        const { count, error: countError } = await supabase
          .from("bookmarks")
          .select("*", { count: "exact", head: true })
          .eq("course_code", courseCode);

        if (countError) {
          console.error("Error fetching updated bookmark count from Supabase:", countError.message);
        } else {
          dbBookmarkCount = count;
        }
      } catch (dbErr) {
        console.warn("Database error fetching bookmark count:", dbErr);
      }

      if (dbBookmarkCount !== null) {
        // Update selectedCourse with database count
        if (selectedCourse && (selectedCourse.id === courseId || selectedCourse.code === courseCode)) {
          setSelectedCourse((prev) => prev ? { ...prev, bookmarkCount: dbBookmarkCount } : null);
        }

        // Update in global list
        setCourses((prevCourses) =>
          prevCourses.map((c) =>
            c.id === courseId || c.code === courseCode
              ? { ...c, bookmarkCount: dbBookmarkCount }
              : c
          )
        );
      }

      // 2. Fetch all of current user's bookmarks to keep user's bookmark list perfectly in sync
      if (user) {
        let supabaseUserId: string | null = null;
        try {
          const { data: sessionData } = await supabase.auth.getSession();
          supabaseUserId = sessionData.session?.user?.id;
        } catch (sErr) {
          console.warn("Session retrieval failed in refreshBookmarkData:", sErr);
        }

        if (!supabaseUserId) {
          supabaseUserId = await ensureSupabaseSession(user.email, user.name);
        }

        if (supabaseUserId) {
          try {
            const { data: dbUserBookmarks, error: userBookmarksError } = await supabase
              .from("bookmarks")
              .select("course_code")
              .eq("user_id", supabaseUserId);

            if (userBookmarksError) {
              console.error("Error fetching user's updated bookmarks from Supabase:", userBookmarksError.message);
            } else if (dbUserBookmarks) {
              const userBookmarkedCodes = dbUserBookmarks.map((b) => b.course_code).filter(Boolean);
              setBookmarks(userBookmarkedCodes);
              localStorage.setItem(`bookmarks_${user.email}`, JSON.stringify(userBookmarkedCodes));
            }
          } catch (dbErr) {
            console.warn("Database error fetching user's bookmarks:", dbErr);
          }
        }
      }
    } catch (err) {
      console.error("Failed to refresh bookmark data:", err);
    }
  };

  const toggleBookmarkInDbOrLocal = async (courseId: string) => {
    // If not logged in, trigger login modal
    if (!user) {
      setLoginError("Please log in to bookmark courses.");
      setShowLoginModal(true);
      return;
    }

    const targetCourse = courses.find((c) => c.id === courseId || c.code === courseId) || selectedCourse;
    if (!targetCourse) return;

    const code = targetCourse.code;
    const category = targetCourse.category;
    const isCurrentlyBookmarked = bookmarks.includes(courseId) || bookmarks.includes(code);

    // --- 1. OPTIMISTIC UI UPDATE (IMMEDIATE) ---
    // Update local bookmarks list immediately
    let updatedBookmarks: string[];
    if (isCurrentlyBookmarked) {
      updatedBookmarks = bookmarks.filter((id) => id !== courseId && id !== code && id !== targetCourse.id);
    } else {
      updatedBookmarks = [...bookmarks, code];
    }
    setBookmarks(updatedBookmarks);
    localStorage.setItem(`bookmarks_${user.email}`, JSON.stringify(updatedBookmarks));

    // Update bookmarkCount of the course optimistically
    const countDiff = isCurrentlyBookmarked ? -1 : 1;
    setCourses((prevCourses) =>
      prevCourses.map((c) => {
        if (c.id === courseId || c.code === code) {
          const currentCount = c.bookmarkCount !== undefined ? c.bookmarkCount : 0;
          return { ...c, bookmarkCount: Math.max(0, currentCount + countDiff) };
        }
        return c;
      })
    );
    if (selectedCourse && (selectedCourse.id === courseId || selectedCourse.code === code)) {
      setSelectedCourse((prev) => {
        if (!prev) return null;
        const currentCount = prev.bookmarkCount !== undefined ? prev.bookmarkCount : 0;
        return { ...prev, bookmarkCount: Math.max(0, currentCount + countDiff) };
      });
    }

    // --- 2. ASYNC DATABASE OPERATION (IN BACKGROUND) ---
    try {
      const supabaseUserId = await ensureSupabaseSession(user.email, user.name);
      if (!supabaseUserId) {
        console.error("Authentication expired or failed to establish Supabase session.");
        setLoginError("Authentication session expired. Please sign in again.");
        setUser(null); // Clear invalid local user
        setShowLoginModal(true);
        // Rollback state since session could not be established
        setBookmarks(bookmarks);
        localStorage.setItem(`bookmarks_${user.email}`, JSON.stringify(bookmarks));
        return;
      }

      if (isCurrentlyBookmarked) {
        // Delete bookmark from DB
        const { error } = await supabase
          .from("bookmarks")
          .delete()
          .eq("user_id", supabaseUserId)
          .eq("course_code", code);

        if (error) {
          console.error("Supabase delete bookmark error:", error.message);
        }
      } else {
        // Insert bookmark into DB
        const { error } = await supabase
          .from("bookmarks")
          .insert({
            user_id: supabaseUserId,
            course_code: code,
            course_type: category,
          });

        if (error) {
          console.error("Supabase insert bookmark error:", error.message);
        }
      }

      // --- 3. BACKGROUND COUNT REFRESH ---
      // We asynchronously fetch the real database count of bookmarks to ensure accuracy,
      // but we do not reload the user's bookmarks list here to prevent any race conditions or stale rewrites.
      try {
        const { count, error: countError } = await supabase
          .from("bookmarks")
          .select("*", { count: "exact", head: true })
          .eq("course_code", code);

        if (!countError && count !== null) {
          if (selectedCourse && (selectedCourse.id === courseId || selectedCourse.code === code)) {
            setSelectedCourse((prev) => prev ? { ...prev, bookmarkCount: count } : null);
          }
          setCourses((prevCourses) =>
            prevCourses.map((c) =>
              c.id === courseId || c.code === code
                ? { ...c, bookmarkCount: count }
                : c
            )
          );
        }
      } catch (countErr) {
        console.warn("Error fetching count in background:", countErr);
      }
    } catch (err: any) {
      console.error("Error toggling bookmark in Supabase backend:", err);
      // Rollback on failure
      setBookmarks(bookmarks);
      localStorage.setItem(`bookmarks_${user.email}`, JSON.stringify(bookmarks));
    }
  };

  const handleUpdateStudentId = (newIdNo: string) => {
    if (!user) return;
    const updatedUser = { ...user, idNo: newIdNo };
    setUser(updatedUser);
    localStorage.setItem("student_id_" + user.email, newIdNo);
    localStorage.setItem("bits_user", JSON.stringify(updatedUser));
  };

  useEffect(() => {
    if (user) {
      localStorage.setItem("bits_user", JSON.stringify(user));
      localStorage.removeItem("bits_user_logged_out");
    } else {
      localStorage.removeItem("bits_user");
    }
  }, [user]);

  // Load initial session and set up onAuthStateChange
  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const email = session.user.email || "";
        const isAllowed = email.toLowerCase().endsWith("@goa.bits-pilani.ac.in");
        if (!isAllowed) {
          // Immediately sign out disallowed accounts
          try {
            await supabase.auth.signOut();
          } catch (e) {
            console.warn("Failed to sign out disallowed user:", e);
          }
          setUser(null);
          setLoginError("Access restricted: please sign in with your @goa.bits-pilani.ac.in address.");
          setShowLoginModal(true);
          return;
        }
        const { name } = getBitsIdAndName(email, session.user.user_metadata?.full_name);
        const savedId = localStorage.getItem("student_id_" + email);
        setUser({
          email,
          name,
          campus: "Goa",
          idNo: savedId || "-",
        });
      }
    };
    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const email = session.user.email || "";
        const isAllowed = email.toLowerCase().endsWith("@goa.bits-pilani.ac.in");
        if (!isAllowed) {
          try {
            await supabase.auth.signOut();
          } catch (e) {
            console.warn("Failed to sign out disallowed user on auth change:", e);
          }
          setUser(null);
          setLoginError("Access restricted: please sign in with your @goa.bits-pilani.ac.in address.");
          setShowLoginModal(true);
          return;
        }
        const { name } = getBitsIdAndName(email, session.user.user_metadata?.full_name);
        const savedId = localStorage.getItem("student_id_" + email);
        setUser({
          email,
          name,
          campus: "Goa",
          idNo: savedId || "-",
        });
      } else {
        if (event === "SIGNED_OUT") {
          setUser(null);
          localStorage.setItem("bits_user_logged_out", "true");
          localStorage.removeItem("bits_user");
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Listen for message from popup window (for both development and iframe popup flow)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const origin = event.origin;
      // Accept messages from the same origin (production) or localhost during development
      if (origin !== window.location.origin && !origin.includes("localhost")) {
        return;
      }
      if (event.data?.type === "SUPABASE_AUTH_SUCCESS") {
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session?.user) {
            const email = session.user.email || "";
            const isAllowed = email.toLowerCase().endsWith("@goa.bits-pilani.ac.in");
            if (!isAllowed) {
              supabase.auth.signOut();
              setUser(null);
              setLoginError("Access is restricted to @goa.bits-pilani.ac.in email addresses.");
              setShowLoginModal(true);
            } else {
              const { name } = getBitsIdAndName(email, session.user.user_metadata?.full_name);
              const savedId = localStorage.getItem("student_id_" + email);
              setUser({
                email,
                name,
                campus: "Goa",
                idNo: savedId || "-",
              });
              setLoginError("");
              setShowLoginModal(false);
            }
          }
        });
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Handle popup callback window rendering
  useEffect(() => {
    if (window.location.pathname === "/auth-callback" || window.location.pathname === "/auth-callback/") {
      const checkAndClose = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          if (window.opener) {
            window.opener.postMessage({ type: "SUPABASE_AUTH_SUCCESS" }, "*");
          }
          window.close();
        } else {
          const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (session) {
              if (window.opener) {
                window.opener.postMessage({ type: "SUPABASE_AUTH_SUCCESS" }, "*");
              }
              subscription.unsubscribe();
              window.close();
            }
          });
          setTimeout(() => {
            window.close();
          }, 6000);
        }
      };
      checkAndClose();
    }
  }, []);

  // Handle category selection from home screen
  const handleSelectCategory = (category: "HEL" | "OPEL_DEL") => {
    setSelectedCategory(category);
    setActivePage("browse");
  };

  // Toggle bookmark
  const handleToggleBookmark = (e: React.MouseEvent | null, courseId: string) => {
    if (e) {
      e.stopPropagation(); // Avoid triggering card click
    }
    toggleBookmarkInDbOrLocal(courseId);
  };

  const handleToggleBookmarkDirect = (courseId: string) => {
    toggleBookmarkInDbOrLocal(courseId);
  };

  // Delete review submitted by user
  const handleDeleteReview = (reviewId: string) => {
    setReviewToDeleteId(reviewId);
  };

  // Perform actual deletion from Supabase and update local state immediately
  const executeDeleteReview = async (reviewId: string) => {
    const reviewToDelete = reviews.find((r) => r.id === reviewId);
    if (!reviewToDelete) return;

    // Determine the category to pick the correct Supabase table
    const courseId = reviewToDelete.courseId;
    const course = courses.find((c) => c.id === courseId || c.code === courseId);
    const category = course?.category || "HEL";
    const reviewsTable = category === "OPEL_DEL" ? "del_r" : "reviews";

    let supabaseUserId: string | null = null;
    if (user) {
      try {
        supabaseUserId = await ensureSupabaseSession(user.email, user.name);
      } catch (authErr) {
        console.warn("Could not ensure Supabase session on delete:", authErr);
      }
    }

    // Guard on user email matching submittedBy if logged in OR user_id match
    const isOwnReview =
      (user && reviewToDelete.submittedBy === user.email) ||
      (supabaseUserId && reviewToDelete.userId === supabaseUserId);

    if (!isOwnReview) {
      console.error("Unauthorized deletion attempt.");
      return;
    }

    const updatedReviewsList = reviews.filter((r) => r.id !== reviewId);

    // --- 1. OPTIMISTIC UI UPDATE (IMMEDIATE) ---
    // Update local reviews list
    setReviews(updatedReviewsList);
    setCurrentCourseReviews((prev) => prev.filter((r) => r.id !== reviewId));

    // Recalculate metrics for the course in local state
    setCourses((prevCourses) =>
      prevCourses.map((c) => {
        if (c.id === courseId || c.code === courseId) {
          const courseReviews = updatedReviewsList.filter((r) => r.courseId === c.id || r.courseId === c.code);

          // Simple average grade calculation
          const grades = courseReviews.map((r) => r.gradeReceived).filter(g => g && g !== "—");
          const commonGrade = grades.length > 0
            ? grades.sort(
                (a, b) =>
                  grades.filter((v) => v === a).length - grades.filter((v) => v === b).length
              ).pop()
            : undefined;

          // Simple average marks extraction
          const numericMarks = courseReviews
            .map((r) => parseInt(r.marksReceived.replace(/\D/g, "")))
            .filter((m) => !isNaN(m));
          const avgMarks =
            numericMarks.length > 0
              ? `${Math.round(numericMarks.reduce((a, b) => a + b, 0) / numericMarks.length)}/100`
              : undefined;

          const newReviewCount = Math.max(0, (c.reviewCount || 0) - 1);
          const newCourseTotal = Math.max(0, parseInt(c.courseTotal || "0") - 1).toString();

          return {
            ...c,
            reviewCount: newReviewCount,
            courseTotal: newCourseTotal,
            averageGrade: commonGrade,
            averageMarks: avgMarks,
          };
        }
        return c;
      })
    );

    // If the currently selected course is the one being modified, update it too
    if (selectedCourse && (selectedCourse.id === courseId || selectedCourse.code === courseId)) {
      setSelectedCourse((prev) => {
        if (!prev) return null;
        const courseReviews = updatedReviewsList.filter((r) => r.courseId === prev.id || r.courseId === prev.code);

        const grades = courseReviews.map((r) => r.gradeReceived).filter(g => g && g !== "—");
        const commonGrade = grades.length > 0
          ? grades.sort(
              (a, b) =>
                grades.filter((v) => v === a).length - grades.filter((v) => v === b).length
            ).pop()
          : undefined;

        const numericMarks = courseReviews
          .map((r) => parseInt(r.marksReceived.replace(/\D/g, "")))
          .filter((m) => !isNaN(m));
        const avgMarks =
          numericMarks.length > 0
            ? `${Math.round(numericMarks.reduce((a, b) => a + b, 0) / numericMarks.length)}/100`
            : undefined;

        const newReviewCount = Math.max(0, (prev.reviewCount || 0) - 1);
        const newCourseTotal = Math.max(0, parseInt(prev.courseTotal || "0") - 1).toString();

        return {
          ...prev,
          reviewCount: newReviewCount,
          courseTotal: newCourseTotal,
          averageGrade: commonGrade,
          averageMarks: avgMarks,
        };
      });
    }

    // --- 2. ASYNC DATABASE OPERATION (IN BACKGROUND) ---
    try {
      const { error } = await supabase
        .from(reviewsTable)
        .delete()
        .eq("review_id", reviewId);

      if (error) {
        console.error("Error deleting review from Supabase:", error.message, error.details || "", error.hint || "");
      } else {
        console.log("Successfully deleted review from Supabase:", reviewId);
      }
    } catch (err) {
      console.warn("Supabase delete failed, falling back to local state:", err);
    }
  };

  // Handle Review Submission
  const handleAddReview = async (
    newReview: Omit<Review, "id" | "submittedBy" | "submittedAt"> & { id?: string },
    courseDetails: { code: string; name: string; instructor: string; category: "HEL" | "OPEL_DEL" }
  ) => {
    const isEdit = !!newReview.id;
    const authorEmail = user?.email || "anonymous@goa.bits-pilani.ac.in";
    const courseId = newReview.courseId;

    let supabaseUserId: string | null = null;
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      supabaseUserId = sessionData.session?.user?.id || null;
    } catch (e) {
      console.warn("Could not retrieve Supabase session:", e);
    }

    const dbReviewRow: any = {
      course_code: courseDetails.code.toUpperCase().trim(),
      course_name: courseDetails.name.trim(),
      taken_in: newReview.semester,
      your_grade: newReview.gradeReceived,
      av_plus: newReview.marksReceived,
      gr_comm: newReview.commentsOnGrading,
      evals: newReview.evaluativeComponents,
      open_book: newReview.evaluationType,
      pr_no: newReview.prNo,
      attendance: newReview.attendanceExpectations,
      slides: newReview.courseMaterialsProvided,
      rec: newReview.whatWorkedWell,
      not_rec: newReview.thingsToKeepInMind,
      advice: newReview.adviceFromReviewer,
      comments: newReview.additionalComments || "",
      user_id: supabaseUserId,
    };

    if (courseDetails.category === "OPEL_DEL") {
      dbReviewRow.sem_ic = newReview.icForSemester || courseDetails.instructor;
      dbReviewRow.av_marks = newReview.avMarks || null;
      dbReviewRow.av_grade = newReview.avGrade || null;
      dbReviewRow.course_total = newReview.courseTotal || null;
    } else {
      dbReviewRow.prof = courseDetails.instructor;
    }

    const reviewsTable = courseDetails.category === "OPEL_DEL" ? "del_r" : "reviews";

    if (isEdit) {
      try {
        const { error: updateError } = await supabase
          .from(reviewsTable)
          .update(dbReviewRow)
          .eq("review_id", newReview.id);

        if (updateError) {
          console.error("Error updating review in Supabase:", updateError.message);
        }
      } catch (err) {
        console.warn("Supabase update failed, falling back to local state:", err);
      }

      // Find original review
      const originalReview = reviews.find((r) => r.id === newReview.id);
      if (!originalReview) return;

      const updatedReview: Review = {
        ...originalReview,
        ...newReview,
        id: newReview.id!,
        courseId,
      };

      // Update reviews
      setReviews((prev) => prev.map((r) => (r.id === newReview.id ? updatedReview : r)));

      // Recalculate course average metrics based on updated reviews
      setCourses((prevCourses) =>
        prevCourses.map((c) => {
          if (c.id === courseId) {
            // Recalculate based on the updated list of reviews
            const courseReviews = reviews.map((r) => (r.id === newReview.id ? updatedReview : r)).filter((r) => r.courseId === c.id);
            
            const grades = courseReviews.map((r) => r.gradeReceived);
            const commonGrade = grades.sort(
              (a, b) =>
                grades.filter((v) => v === a).length - grades.filter((v) => v === b).length
            ).pop();

            const numericMarks = courseReviews
              .map((r) => parseInt(r.marksReceived.replace(/\D/g, "")))
              .filter((m) => !isNaN(m));
            const avgMarks =
              numericMarks.length > 0
                ? `${Math.round(numericMarks.reduce((a, b) => a + b, 0) / numericMarks.length)}/100`
                : c.averageMarks;

            return {
              ...c,
              averageGrade: commonGrade || c.averageGrade,
              averageMarks: avgMarks,
            };
          }
          return c;
        })
      );

      // Reset reviewToEdit
      setReviewToEdit(null);

      // Take student to the reviewed course details page
      const updatedCourse = courses.find((c) => c.id === courseId);
      if (updatedCourse) {
        setSelectedCourse(updatedCourse);
        setActivePage("course-details");
      } else {
        setActivePage("profile");
      }
    } else {
      let finalCourseId = courseId;
      let reviewId = `rev_${Date.now()}`;

      try {
        const { data: insertedData, error: insertError } = await supabase
          .from(reviewsTable)
          .insert(dbReviewRow)
          .select()
          .single();

        if (insertError) {
          console.error("Error inserting review into Supabase:", insertError.message);
        } else if (insertedData) {
          reviewId = insertedData.review_id || insertedData.id || reviewId;
        }
      } catch (err) {
        console.warn("Supabase insert failed, falling back to local state:", err);
      }

      // Check if we need to insert a custom course
      if (!finalCourseId) {
        // Check if course already exists by code
        const existing = courses.find(
          (c) => c.code.toLowerCase().replace(/\s+/g, "") === courseDetails.code.toLowerCase().replace(/\s+/g, "")
        );

        if (existing) {
          finalCourseId = existing.id;
        } else {
          // Create new course
          const newCourseId = `course_${Date.now()}`;
          const newCourse: Course = {
            id: newCourseId,
            code: courseDetails.code,
            name: courseDetails.name,
            instructor: courseDetails.instructor,
            category: courseDetails.category,
            averageGrade: newReview.gradeReceived,
            averageMarks: newReview.marksReceived,
            courseTotal: "1",
          };
          setCourses((prev) => [newCourse, ...prev]);
          finalCourseId = newCourseId;
        }
      }

      // Insert new review
      const finalReview: Review = {
        ...newReview,
        id: reviewId,
        courseId: finalCourseId,
        submittedBy: authorEmail,
        submittedAt: new Date().toISOString(),
      };

      setReviews((prev) => [finalReview, ...prev]);

      // Recalculate course average metrics based on new reviews
      setCourses((prevCourses) =>
        prevCourses.map((c) => {
          if (c.id === finalCourseId) {
            const courseReviews = [finalReview, ...reviews.filter((r) => r.courseId === c.id)];

            // Simple average grade calculation
            const grades = courseReviews.map((r) => r.gradeReceived);
            const commonGrade = grades.sort(
              (a, b) =>
                grades.filter((v) => v === a).length - grades.filter((v) => v === b).length
            ).pop();

            // Simple average marks extraction
            const numericMarks = courseReviews
              .map((r) => parseInt(r.marksReceived.replace(/\D/g, "")))
              .filter((m) => !isNaN(m));
            const avgMarks =
              numericMarks.length > 0
                ? `${Math.round(numericMarks.reduce((a, b) => a + b, 0) / numericMarks.length)}/100`
                : c.averageMarks;

            return {
              ...c,
              averageGrade: commonGrade || c.averageGrade,
              averageMarks: avgMarks,
              courseTotal: (parseInt(c.courseTotal || "0") + 1).toString(),
            };
          }
          return c;
        })
      );

      // Take student to the reviewed course details page
      const updatedCourse = courses.find((c) => c.id === finalCourseId) || {
        id: finalCourseId,
        code: courseDetails.code,
        name: courseDetails.name,
        instructor: courseDetails.instructor,
        category: courseDetails.category,
      };
      setSelectedCourse(updatedCourse);
      setCurrentCourseReviews((prev) => [finalReview, ...prev]);
      setActivePage("course-details");
    }
  };

  // Handle Project Submission
  const handleSubmitProject = async (projectData: Omit<Project, "id" | "created_at">): Promise<boolean> => {
    let supabaseUserId: string | null = null;
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      supabaseUserId = sessionData.session?.user?.id || null;
    } catch (e) {
      console.warn("Could not retrieve Supabase session for project submission:", e);
    }

    const dbRow = {
      prof_name: projectData.prof_name,
      project_title: projectData.project_title,
      project_info: projectData.project_info,
      student_branch: projectData.student_branch,
      prof_branch: projectData.prof_branch,
      project_type: projectData.project_type,
      domain: projectData.domain,
      type: projectData.type,
      taken_in: projectData.taken_in,
      experience: projectData.experience,
      user_id: supabaseUserId,
    };

    let insertedProject: any = null;
    try {
      const { data, error } = await supabase
        .from("projects")
        .insert(dbRow)
        .select()
        .single();

      if (error) {
        console.error("Error inserting project review in Supabase:", error.message);
      } else {
        insertedProject = data;
      }
    } catch (err) {
      console.warn("Supabase project insert failed, falling back to local state:", err);
    }

    const finalProject: Project = {
      id: insertedProject?.id || `proj_${Date.now()}`,
      prof_name: projectData.prof_name,
      project_title: projectData.project_title,
      project_info: projectData.project_info,
      student_branch: projectData.student_branch,
      prof_branch: projectData.prof_branch,
      project_type: projectData.project_type,
      domain: projectData.domain,
      type: projectData.type,
      taken_in: projectData.taken_in,
      experience: projectData.experience,
      user_id: supabaseUserId || undefined,
      created_at: insertedProject?.created_at || new Date().toISOString(),
    };

    setProjects((prev) => [finalProject, ...prev]);
    return true;
  };

  // Detailed Modal Opener
  const handleOpenReviewModal = (review: Review, index: number) => {
    setActiveReviewModal(review);
    setReviewModalIndex(index);
    setIsReviewModalOpen(true);
  };

  // Get dynamic distinct department values from the courses array
  const distinctDepartments = useMemo(() => {
    if (selectedCategory === "HEL") {
      const depts = courses
        .filter((c) => c.category === "HEL")
        .map((c) => (c.dept || c.code.split(" ")[0]).toUpperCase().trim())
        .filter((dept): dept is string => !!dept);
      return Array.from(new Set(depts)).sort();
    } else {
      // For OPEL/DEL, generate the filter options from the unique values of the branch_dep column in the del_d table
      const depts = delDMappings
        .map((d) => (d.branch_dep || "").trim())
        .filter((dept): dept is string => !!dept);
      // Remove duplicates case-insensitively and sort
      const uniqueDepts = Array.from(new Set(depts.map((d) => d.toUpperCase()))).sort();
      return uniqueDepts;
    }
  }, [courses, selectedCategory, delDMappings]);

  // Filter & Search Logic
  const filteredAndSortedCourses = useMemo(() => {
    let result = courses.filter((course) => {
      // Category filter
      if (selectedCategory && course.category !== selectedCategory) {
        return false;
      }
      // Search filter
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        return (
          course.code.toLowerCase().includes(q) ||
          course.name.toLowerCase().includes(q) ||
          (course.instructor && course.instructor.toLowerCase().includes(q)) ||
          (course.nickname && course.nickname.toLowerCase().includes(q))
        );
      }
      return true;
    });

    // Department/Branch filter
    if (selectedCategory === "OPEL_DEL") {
      // Temporary log: selected branch
      console.log("selected branch:", filterDept);

      if (filterDept !== "all") {
        // Find all rows in del_d where branch_dep equals the selected value
        const matchingDelDRows = delDMappings.filter((d) => {
          return (d.branch_dep || "").trim().toUpperCase() === filterDept.trim().toUpperCase();
        });
        
        // Retrieve corresponding course_code values
        const fetchedCourseCodes = matchingDelDRows.map((d) => (d.course_code || "").trim().toUpperCase());
        
        // Temporary log: fetched course codes from del_d
        console.log("fetched course codes from del_d:", fetchedCourseCodes);

        // Normalize spaces and casing for reliable matching
        const normalize = (code: string) => code.replace(/\s+/g, "").toUpperCase();
        const normalizedFetchedCodes = fetchedCourseCodes.map(normalize);

        // Match those course_code values with the course_code column in del_c (which is mapped to course.code)
        result = result.filter((course) => {
          const courseCode = (course.code || "").trim();
          return normalizedFetchedCodes.includes(normalize(courseCode));
        });
      } else {
        console.log("fetched course codes from del_d: all (no filter)");
      }
    } else if (selectedCategory === "HEL") {
      if (filterDept !== "all") {
        result = result.filter((course) => {
          const courseDept = (course.dept || course.code.split(" ")[0]).toUpperCase().trim();
          return courseDept === filterDept.toUpperCase().trim();
        });
      }
    }

    // Sort logic
    const sortedResult = [...result].sort((a, b) => {
      if (sortOption === "name") {
        return a.name.localeCompare(b.name);
      } else if (sortOption === "code") {
        return a.code.localeCompare(b.code);
      } else if (sortOption === "reviews") {
        const aCount = a.reviewCount !== undefined ? a.reviewCount : reviews.filter((r) => r.courseId === a.id).length;
        const bCount = b.reviewCount !== undefined ? b.reviewCount : reviews.filter((r) => r.courseId === b.id).length;
        return bCount - aCount; // Highest review count first
      } else if (sortOption === "grade") {
        const aGrade = a.averageGrade || "NC";
        const bGrade = b.averageGrade || "NC";
        return aGrade.localeCompare(bGrade); // A first
      }
      return 0;
    });

    if (selectedCategory === "OPEL_DEL") {
      // Temporary log: filtered courses before rendering
      console.log("filtered courses before rendering:", sortedResult);
    }

    return sortedResult;
  }, [courses, selectedCategory, searchQuery, filterDept, delDMappings, sortOption, reviews]);

  // Comprehensive debugging logs requested for OPEL/DEL filtering
  useEffect(() => {
    if (selectedCategory === "OPEL_DEL") {
      const allUniqueBranchDeps = Array.from(
        new Set(delDMappings.map((d) => (d.branch_dep || "").trim().toUpperCase()))
      ).filter(Boolean);
      console.log("[DEBUG] All unique branch_dep values fetched from del_d:", allUniqueBranchDeps);
      console.log("[DEBUG] Selected filter value:", filterDept);

      if (filterDept !== "all") {
        // Query del_d using that exact value (case-insensitive and trimmed)
        const matchedDelDRows = delDMappings.filter(
          (d) => (d.branch_dep || "").trim().toUpperCase() === filterDept.trim().toUpperCase()
        );
        const returnedCourseCodes = matchedDelDRows.map((d) => (d.course_code || "").trim().toUpperCase().replace(/\s+/g, ' '));

        console.log("[DEBUG] Querying del_d using:", filterDept);
        console.log("[DEBUG] Number of matching rows found in del_d:", matchedDelDRows.length);
        console.log("[DEBUG] List of course_codes returned:", returnedCourseCodes);

        // Query del_c (courses) using those returned course codes
        const matchedCourses = courses.filter(
          (c) =>
            c.category === "OPEL_DEL" &&
            returnedCourseCodes.includes((c.code || "").trim().toUpperCase().replace(/\s+/g, ' '))
        );

        console.log("[DEBUG] Querying del_c (courses) using returned course_codes...");
        console.log("[DEBUG] Number of matching courses:", matchedCourses.length);
        console.log("[DEBUG] Every matching course_code in del_c:", matchedCourses.map((c) => c.code));

        // Diagnostics for why matches failed
        if (delDMappings.length === 0) {
          console.error("[DEBUG] STEP FAILED: The del_d table loaded from Supabase is empty (has 0 rows). Please verify that del_d contains data in the Supabase database.");
        } else if (matchedDelDRows.length === 0) {
          console.error(`[DEBUG] STEP FAILED: No rows in del_d matched the selected branch_dep value: "${filterDept}".`);
        } else if (matchedCourses.length === 0) {
          console.error("[DEBUG] STEP FAILED: Mapped rows exist in del_d but none of the course_code values matched any course in del_c (courses).");
          console.log("[DEBUG] Sample del_d course_codes:", returnedCourseCodes.slice(0, 5));
          console.log("[DEBUG] Sample del_c course_codes:", courses.filter(c => c.category === "OPEL_DEL").slice(0, 5).map(c => c.code));
        } else {
          console.log("[DEBUG] Filtering succeeded with", matchedCourses.length, "matching courses!");
        }

        // Additional verifications:
        // 1. Verify: course_code values in del_d exactly equal those in del_c (trim whitespace before comparing).
        const delD_codes = delDMappings.map(d => (d.course_code || "").trim().toUpperCase().replace(/\s+/g, ' '));
        const delC_codes = courses.filter(c => c.category === "OPEL_DEL").map(c => (c.code || "").trim().toUpperCase().replace(/\s+/g, ' '));
        const hasDirectOverlap = delD_codes.some(code => delC_codes.includes(code));
        console.log("[DEBUG] Verification - Overlap exists between del_d and del_c codes:", hasDirectOverlap);

        // 2. Verify: branch_dep values are trimmed before comparison.
        const untrimmedBranchDeps = delDMappings.map(d => d.branch_dep || "");
        const hasUntrimmedSpaces = untrimmedBranchDeps.some(dep => dep !== dep.trim());
        console.log("[DEBUG] Verification - Do any branch_dep values have untrimmed spaces?", hasUntrimmedSpaces);

        // 3. Verify: No client-side filtering is removing the results afterward.
        console.log("[DEBUG] Verification - Current searchQuery is:", searchQuery ? `"${searchQuery}"` : "(none)");
      } else {
        console.log("[DEBUG] Selected branch is 'All'. Displaying all", courses.filter(c => c.category === "OPEL_DEL").length, "courses.");
      }
    }
  }, [selectedCategory, filterDept, delDMappings, courses, searchQuery]);

  if (window.location.pathname === "/auth-callback" || window.location.pathname === "/auth-callback/") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-app-bg text-app-text-primary">
        <div className="text-center p-8 space-y-4 rounded-3xl border border-app-border bg-app-surface shadow-lg max-w-sm mx-4">
          <div className="animate-spin h-8 w-8 border-4 border-app-accent border-t-transparent rounded-full mx-auto" />
          <h2 className="text-sm font-bold font-sans">Completing BITS SSO...</h2>
          <p className="text-xs text-app-text-secondary">Please wait while we verify your credentials.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-bg text-app-text-primary flex flex-col font-sans transition-colors duration-200">
      {/* Main Header */}
      <Header
        activePage={activePage}
        setActivePage={(page) => {
          if (page === "submit-review") {
            setSubmitReviewInitialCategory("HEL");
          }
          setActivePage(page);
          setReviewToEdit(null);
          if (page === "home") setSelectedCategory(null);
        }}
        user={user}
        onLogout={async () => {
          await supabase.auth.signOut();
          setUser(null);
          localStorage.setItem("bits_user_logged_out", "true");
          localStorage.removeItem("bits_user");
          setActivePage("home");
        }}
        onLoginClick={() => {
          setLoginError("");
          setShowLoginModal(true);
        }}
        theme={theme}
        onToggleTheme={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
      />

      {/* Content Canvas */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <AnimatePresence mode="wait">
          {/* LOGIN MODAL OVERLAY */}
          {showLoginModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
                onClick={() => {
                  setLoginError("");
                  setShowLoginModal(false);
                }}
              />
              <div className="relative z-10 w-full max-w-md">
                <LoginView
                  parentError={loginError}
                  onLoginSuccess={(authenticatedUser) => {
                    const savedId = localStorage.getItem("student_id_" + authenticatedUser.email);
                    const updatedUser = {
                      ...authenticatedUser,
                      idNo: savedId || "-",
                    };
                    setUser(updatedUser);
                    localStorage.setItem("bits_user", JSON.stringify(updatedUser));
                    setLoginError("");
                    setShowLoginModal(false);
                  }}
                  onClose={() => {
                    setLoginError("");
                    setShowLoginModal(false);
                  }}
                />
              </div>
            </div>
          )}

          {/* PAGE: Home (Category Selection) */}
          {activePage === "home" && (
            <motion.div
              key="home-page"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <CategorySelection
                onSelectCategory={handleSelectCategory}
                setActivePage={(page) => {
                  if (page === "submit-review") {
                    setSubmitReviewInitialCategory("HEL");
                  }
                  setActivePage(page);
                }}
              />
            </motion.div>
          )}

          {/* PAGE: Browse Courses */}
          {activePage === "browse" && (
            <motion.div
              key="browse-page"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8 py-4"
            >
              {/* Category Breadcrumb & Selector Toggle */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-app-border pb-4">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-app-text-secondary">
                    <button
                      onClick={() => {
                        setActivePage("home");
                        setSelectedCategory(null);
                      }}
                      className="hover:text-app-text-primary transition-colors"
                    >
                      Categories
                    </button>
                    <span>/</span>
                    <span className="text-app-text-primary">
                      {selectedCategory === "HEL" ? "Humanities Electives" : "Open/Discipline Electives"}
                    </span>
                  </div>
                  <h1 className="font-sans text-3xl font-extrabold tracking-tight text-app-text-primary mt-1">
                    Browse Electives
                  </h1>
                </div>

                {/* Sub-Category Toggle pills */}
                <div className="flex bg-app-bg p-1 rounded-xl border border-app-border">
                  <button
                    onClick={() => setSelectedCategory("HEL")}
                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                      selectedCategory === "HEL"
                        ? "bg-app-accent text-white shadow-sm"
                        : "text-app-text-secondary hover:text-app-text-primary"
                    }`}
                  >
                    Humanities (HEL)
                  </button>
                  <button
                    onClick={() => setSelectedCategory("OPEL_DEL")}
                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                      selectedCategory === "OPEL_DEL"
                        ? "bg-app-accent text-white shadow-sm"
                        : "text-app-text-secondary hover:text-app-text-primary"
                    }`}
                  >
                    Open & Discipline
                  </button>
                  <button
                    onClick={() => {
                      setActivePage("projects");
                    }}
                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                      activePage === "projects"
                        ? "bg-app-accent text-white shadow-sm"
                        : "text-app-text-secondary hover:text-app-text-primary"
                    }`}
                  >
                    Projects
                  </button>
                </div>
              </div>

              {/* Giant search / filters block */}
              <div className="grid gap-4 md:grid-cols-12 items-center">
                {/* Search input container */}
                <div className="relative md:col-span-6 lg:col-span-8">
                  <Search className="absolute left-4 top-3.5 h-5 w-5 text-app-text-secondary/60" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by course code, name, instructor or abbreviation..."
                    className="w-full rounded-2xl border border-app-border bg-app-surface py-3.5 pl-11.5 pr-4 text-sm text-app-text-primary placeholder:text-app-text-secondary/40 focus:border-app-accent focus:outline-none focus:ring-1 focus:ring-app-accent"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-4 top-3.5 text-xs text-app-text-secondary hover:text-app-text-primary"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Sort dropdown */}
                <div className="relative md:col-span-3 lg:col-span-2">
                  <button
                    onClick={() => {
                      setIsSortOpen(!isSortOpen);
                      setIsFilterOpen(false);
                    }}
                    className="w-full flex items-center justify-between rounded-2xl border border-app-border bg-app-surface px-4 py-3.5 text-sm font-semibold text-app-text-primary hover:bg-app-bg focus:outline-none"
                  >
                    <div className="flex items-center gap-2">
                      <SlidersHorizontal className="h-4 w-4 text-zinc-400" />
                      <span>
                        Sort: {sortOption === "reviews" ? "Reviews" : sortOption === "name" ? "Name" : sortOption === "code" ? "Code" : "Grade"}
                      </span>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-zinc-500 transition-transform ${isSortOpen ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {isSortOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute z-30 mt-2 w-full rounded-xl border border-app-border bg-app-surface p-1.5 shadow-md"
                      >
                        {[
                          { key: "reviews", label: "Most Reviews" },
                          { key: "name", label: "Course Name (A-Z)" },
                          { key: "code", label: "Course Code (A-Z)" },
                          { key: "grade", label: "Average Grade (A-C)" },
                        ].map((opt) => (
                          <button
                            key={opt.key}
                            onClick={() => {
                              setSortOption(opt.key as any);
                              setIsSortOpen(false);
                            }}
                            className={`w-full text-left rounded-lg px-3.5 py-2 text-xs font-bold transition-colors ${
                              sortOption === opt.key ? "bg-app-accent text-white" : "text-app-text-secondary hover:text-app-text-primary hover:bg-app-bg"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Filter dropdown */}
                <div className="relative md:col-span-3 lg:col-span-2">
                  <button
                    onClick={() => {
                      setIsFilterOpen(!isFilterOpen);
                      setIsSortOpen(false);
                    }}
                    className="w-full flex items-center justify-between rounded-2xl border border-app-border bg-app-surface px-4 py-3.5 text-sm font-semibold text-app-text-primary hover:bg-app-bg focus:outline-none"
                  >
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-app-text-secondary/60" />
                      <span>Filter: {filterDept === "all" ? "All" : filterDept}</span>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-app-text-secondary/60 transition-transform ${isFilterOpen ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {isFilterOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute z-30 mt-2 w-full rounded-xl border border-app-border bg-app-surface p-1.5 shadow-md max-h-60 overflow-y-auto"
                      >
                        {["all", ...distinctDepartments].map((dept) => (
                          <button
                            key={dept}
                            onClick={() => {
                              setFilterDept(dept);
                              setIsFilterOpen(false);
                            }}
                            className={`w-full text-left rounded-lg px-3.5 py-2 text-xs font-bold transition-colors ${
                              filterDept === dept ? "bg-app-accent text-white" : "text-app-text-secondary hover:text-app-text-primary hover:bg-app-bg"
                            }`}
                          >
                            {dept === "all" ? "All Departments" : dept}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Course Card Grid results */}
              {filteredAndSortedCourses.length === 0 ? (
                <div className="rounded-3xl border border-app-border bg-app-surface p-16 text-center shadow-sm">
                  <AlertCircle className="h-10 w-10 text-app-text-secondary/60 mx-auto mb-3.5" />
                  <p className="text-sm text-app-text-primary font-bold">
                    No electives matched your criteria
                  </p>
                  <p className="text-xs text-app-text-secondary mt-1 max-w-sm mx-auto">
                    Try clearing search queries or removing average grade filters to browse all electives.
                  </p>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredAndSortedCourses.map((course) => {
                    const courseReviews = reviews.filter((r) => r.courseId === course.id);
                    return (
                      <CourseCard
                        key={course.id}
                        course={course}
                        reviewCount={course.reviewCount !== undefined ? course.reviewCount : courseReviews.length}
                        isBookmarked={bookmarks.includes(course.id) || bookmarks.includes(course.code)}
                        onToggleBookmark={handleToggleBookmark}
                        onClick={() => {
                          setSelectedCourse(course);
                          setActivePage("course-details");
                        }}
                      />
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* PAGE: Course Details */}
          {activePage === "course-details" && selectedCourse && (
            <motion.div
              key="details-page"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
            >
              <CourseDetails
                course={selectedCourse}
                reviews={currentCourseReviews.length > 0 ? currentCourseReviews : reviews.filter((r) => r.courseId === selectedCourse.id)}
                isBookmarked={bookmarks.includes(selectedCourse.id) || bookmarks.includes(selectedCourse.code)}
                onToggleBookmark={handleToggleBookmarkDirect}
                onBack={() => {
                  setActivePage("browse");
                }}
                onOpenReviewModal={handleOpenReviewModal}
              />
            </motion.div>
          )}

          {/* PAGE: Submit a Review */}
          {activePage === "submit-review" && (
            <motion.div
              key="submit-page"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
            >
              <SubmitReview
                user={user}
                courses={courses}
                onSubmitReview={handleAddReview}
                onLoginClick={() => { setLoginError(""); setShowLoginModal(true); }}
                reviewToEdit={reviewToEdit}
                onCancelEdit={() => {
                  setReviewToEdit(null);
                  setActivePage("profile");
                }}
                onProjectsClick={() => {
                  setSubmitReviewInitialCategory("projects");
                  setReviewToEdit(null);
                  setActivePage("submit-review");
                }}
                onSubmitProject={handleSubmitProject}
                onSuccessProjectReturn={() => setActivePage("projects")}
                initialCategory={submitReviewInitialCategory}
              />
            </motion.div>
          )}

          {/* PAGE: Bookmarks View */}
          {activePage === "bookmarks" && (
            <motion.div
              key="bookmarks-page"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
            >
              <BookmarksView
                user={user}
                onLoginClick={() => { setLoginError(""); setShowLoginModal(true); }}
                courses={courses}
                bookmarks={bookmarks}
                reviews={reviews}
                onToggleBookmark={handleToggleBookmark}
                onSelectCourse={(course) => {
                  setSelectedCourse(course);
                  setActivePage("course-details");
                }}
                onExploreClick={() => {
                  setSelectedCategory("HEL");
                  setActivePage("browse");
                }}
              />
            </motion.div>
          )}

          {/* PAGE: Profile View */}
          {activePage === "profile" && (
            <motion.div
              key="profile-page"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
            >
              <ProfileView
                user={user}
                reviews={reviews}
                courses={courses}
                bookmarks={bookmarks}
                onSelectCourse={(course) => {
                  setSelectedCourse(course);
                  setActivePage("course-details");
                }}
                onLoginClick={() => { setLoginError(""); setShowLoginModal(true); }}
                onDeleteReview={handleDeleteReview}
                onEditReview={(review) => {
                  setReviewToEdit(review);
                  setActivePage("submit-review");
                }}
                onUpdateStudentId={handleUpdateStudentId}
              />
            </motion.div>
          )}

          {/* PAGE: Projects Feed */}
          {activePage === "projects" && (
            <motion.div
              key="projects-page"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
            >
              <ProjectsView
                projects={projects}
                user={user}
                onAddReviewClick={() => {
                  setSubmitReviewInitialCategory("projects");
                  setReviewToEdit(null);
                  setActivePage("submit-review");
                }}
                onLoginClick={() => { setLoginError(""); setShowLoginModal(true); }}
                onHomeClick={() => setActivePage("home")}
                onSelectCategory={(category) => {
                  setSelectedCategory(category);
                  setActivePage("browse");
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Verified Detailed Review Modal Popup */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        review={activeReviewModal}
        course={selectedCourse}
        reviewIndex={reviewModalIndex}
      />

      {/* Confirmation Modal for deleting review */}
      {reviewToDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-app-border bg-app-surface p-6 shadow-2xl">
            <h3 className="font-sans text-lg font-bold text-app-text-primary">
              Delete Review
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-app-text-secondary font-sans">
              Are you sure you want to delete this review? This action cannot be undone.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setReviewToDeleteId(null)}
                className="rounded-xl border border-app-border px-4 py-2 text-sm font-semibold text-app-text-primary hover:bg-app-bg transition-colors font-sans"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const id = reviewToDeleteId;
                  setReviewToDeleteId(null);
                  executeDeleteReview(id);
                }}
                className="rounded-xl bg-app-error px-4 py-2 text-sm font-semibold text-white hover:bg-app-error/90 transition-all font-sans"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Simple Footer */}
      <footer className="border-t border-app-border bg-app-surface py-6 text-center text-xs text-app-text-secondary">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>BITS Course Reviews • Created for the BITSian community</span>
          <div className="flex gap-4">
            <button onClick={() => { setSelectedCategory("HEL"); setActivePage("browse"); }} className="hover:text-app-text-primary transition-colors">Browse HELs</button>
            <span>•</span>
            <button onClick={() => { setSelectedCategory("OPEL_DEL"); setActivePage("browse"); }} className="hover:text-app-text-primary transition-colors">Browse DELs</button>
            <span>•</span>
            <button onClick={() => { setReviewToEdit(null); setActivePage("submit-review"); }} className="hover:text-app-text-primary transition-colors">Write a Review</button>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      {(activePage === "browse" || activePage === "projects" || activePage === "course-details") && (
        <ScrollToTop />
      )}
    </div>
  );
}
