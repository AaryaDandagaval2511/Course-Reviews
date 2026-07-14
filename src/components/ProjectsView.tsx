/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, 
  ChevronDown, 
  Filter, 
  SlidersHorizontal, 
  FolderGit2, 
  ArrowLeft, 
  Sparkles, 
  User as UserIcon, 
  BookOpen, 
  Calendar, 
  PlusCircle,
  Clock
} from "lucide-react";
import { Project, User } from "../types";

interface ProjectsViewProps {
  projects: Project[];
  user: User | null;
  onAddReviewClick: () => void;
  onLoginClick: () => void;
  onHomeClick?: () => void;
  onSelectCategory?: (category: "HEL" | "OPEL_DEL") => void;
}

export default function ProjectsView({
  projects,
  user,
  onAddReviewClick,
  onLoginClick,
  onHomeClick,
  onSelectCategory,
}: ProjectsViewProps) {
  // State for search, filter, and sorting
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDomain, setFilterDomain] = useState("all");
  const [filterDept, setFilterDept] = useState("all");
  const [filterBranch, setFilterBranch] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [sortOption, setSortOption] = useState<"latest" | "oldest" | "prof" | "title">("latest");
  
  // Selected project for the detailed view
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Layout filter/sort popover states
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  const deptsList = [
    "B.E. Chemical",
    "B.E. Computer Science",
    "B.E. Electrical and Electronics",
    "B.E. Electronics and Communication",
    "B.E. Electronics and Instrumentation",
    "B.E. Electronics and Computer",
    "B.E. Environmental and Sustainability",
    "B.E. Mathematics and Computing",
    "B.E. Mechanical",
    "M.Sc. Biological Sciences",
    "M.Sc. Chemistry",
    "M.Sc. Economics",
    "M.Sc. Mathematics",
    "M.Sc. Physics",
    "M.Sc. Semiconductor and Nanoscience"
  ];

  const branchesList = [
    "B.E. Chemical",
    "B.E. Computer Science",
    "B.E. Electrical and Electronics",
    "B.E. Electronics and Communication",
    "B.E. Electronics and Instrumentation",
    "B.E. Electronics and Computer",
    "B.E. Environmental and Sustainability",
    "B.E. Mathematics and Computing",
    "B.E. Mechanical",
    "M.Sc. Biological Sciences",
    "M.Sc. Chemistry",
    "M.Sc. Economics",
    "M.Sc. Mathematics",
    "M.Sc. Physics",
    "M.Sc. Semiconductor and Nanoscience"
  ];

  const domainsList = [
    "Artificial Intelligence / Machine Learning",
    "Data Science & Analytics",
    "Software / IT",
    "Finance",
    "Electronics",
    "Electrical",
    "Mechanical",
    "Chemical",
    "Biology / Biotechnology",
    "Physics",
    "Mathematics",
    "Economics",
    "Chemistry",
    "Environmental Science",
    "Interdisciplinary",
    "Other"
  ];

  const projectTypesList = ["SOP", "LOP", "DOP", "RC"];

  const hasActiveFilters = Boolean(
    searchQuery.trim() ||
    filterDomain !== "all" ||
    filterDept !== "all" ||
    filterBranch !== "all" ||
    filterType !== "all"
  );

  // Handle Search, Filter, and Sort
  const filteredAndSortedProjects = useMemo(() => {
    let result = [...projects];

    // Search: by project title and professor name
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.project_title.toLowerCase().includes(query) ||
          p.prof_name.toLowerCase().includes(query)
      );
    }

    // Filter by Project Domain
    if (filterDomain !== "all") {
      result = result.filter((p) => p.domain === filterDomain);
    }

    // Filter by Professor Department
    if (filterDept !== "all") {
      result = result.filter((p) => p.prof_branch === filterDept);
    }

    // Filter by Student Branch
    if (filterBranch !== "all") {
      result = result.filter((p) => p.student_branch === filterBranch);
    }

    // Filter by Project Type
    if (filterType !== "all") {
      result = result.filter((p) => p.type === filterType);
    }

    // Sorting options: Latest, Oldest, Professor Name, Project Title
    result.sort((a, b) => {
      if (sortOption === "latest") {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA || String(b.id).localeCompare(String(a.id));
      }
      if (sortOption === "oldest") {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateA - dateB || String(a.id).localeCompare(String(b.id));
      }
      if (sortOption === "prof") {
        return a.prof_name.localeCompare(b.prof_name);
      }
      if (sortOption === "title") {
        return a.project_title.localeCompare(b.project_title);
      }
      return 0;
    });

    return result;
  }, [projects, searchQuery, filterDomain, filterDept, filterBranch, filterType, sortOption]);

  const sortLabels = {
    latest: "Latest",
    oldest: "Oldest",
    prof: "Professor Name",
    title: "Project Title",
  };

  if (selectedProject) {
    // DETAILED VIEW PAGE (Matches CourseDetails.tsx visual style)
    return (
      <div className="space-y-8 py-4">
        {/* Back Button */}
        <div>
          <button
            onClick={() => setSelectedProject(null)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-app-border bg-app-bg px-4 py-2 text-xs font-bold text-app-text-secondary hover:text-app-text-primary hover:bg-app-surface transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4 text-app-accent" />
            <span>Back to Projects Feed</span>
          </button>
        </div>

        {/* Hero Banner Area */}
        <div className="relative overflow-hidden rounded-3xl bg-app-surface p-6 sm:p-8 md:p-10 border border-app-border shadow-sm">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
            {/* Left Column: Project Title & Supervisor */}
            <div className="space-y-4 flex-1">
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-app-accent/10 px-3.5 py-1 text-xs font-bold font-mono tracking-wider text-app-accent uppercase border border-app-accent/20">
                  Project / Thesis Review
                </span>
                {selectedProject.domain && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-app-bg px-3.5 py-1 text-xs font-bold font-mono tracking-wider text-app-text-secondary uppercase border border-app-border">
                    Domain: {selectedProject.domain}
                  </span>
                )}
              </div>
              <div className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-app-text-primary leading-tight font-sans">
                {selectedProject.project_title}
              </div>
              <p className="text-base sm:text-lg font-bold text-app-text-secondary">
                Supervisor: <span className="text-app-text-primary">{selectedProject.prof_name}</span>
              </p>
            </div>

            {/* Right Column: Quick Status / Review Info */}
            <div className="space-y-3 lg:max-w-md w-full shrink-0 lg:text-right">
              <h3 className="text-[10px] font-bold tracking-wider text-app-text-secondary uppercase font-mono">
                Project Mentorship Review
              </h3>
              <p className="text-xs sm:text-sm text-app-text-secondary leading-relaxed font-sans">
                Real student experiences, feedback, grading consistency, and supervisor interaction reviews under the supervisor.
              </p>
            </div>
          </div>
        </div>

        {/* Metrics Row (Matches CourseDetails.tsx 4-box layout) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Department */}
          <div className="rounded-2xl border border-app-border bg-app-surface p-5 flex flex-col justify-between shadow-sm">
            <span className="text-[10px] font-bold text-app-text-secondary uppercase tracking-wider font-mono">
              Supervisor Dept
            </span>
            <div className="mt-2 text-sm sm:text-base font-black text-app-text-primary font-sans leading-tight">
              {selectedProject.prof_branch}
            </div>
          </div>

          {/* Student Branch */}
          <div className="rounded-2xl border border-app-border bg-app-surface p-5 flex flex-col justify-between shadow-sm">
            <span className="text-[10px] font-bold text-app-text-secondary uppercase tracking-wider font-mono">
              Student Branch
            </span>
            <div className="mt-2 text-sm sm:text-base font-black text-app-text-primary font-sans leading-tight">
              {selectedProject.student_branch}
            </div>
          </div>

          {/* Semester Taken */}
          <div className="rounded-2xl border border-app-border bg-app-surface p-5 flex flex-col justify-between shadow-sm">
            <span className="text-[10px] font-bold text-app-text-secondary uppercase tracking-wider font-mono">
              Semester Taken
            </span>
            <div className="mt-2 text-sm sm:text-base font-black text-app-text-primary font-sans leading-tight">
              {selectedProject.taken_in}
            </div>
          </div>

          {/* Project Type / Submitted Date */}
          <div className="rounded-2xl border border-app-border bg-app-surface p-5 flex flex-col justify-between shadow-sm">
            <span className="text-[10px] font-bold text-app-text-secondary uppercase tracking-wider font-mono">
              {selectedProject.type ? "Project Type" : "Submitted Date"}
            </span>
            <div className="mt-2 text-sm sm:text-base font-black text-app-text-primary font-sans leading-tight">
              {selectedProject.type || (selectedProject.created_at ? (
                new Date(selectedProject.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              ) : (
                "Recent"
              ))}
            </div>
          </div>
        </div>

        {/* Double Column Bento Grid (Matches detailed descriptions in CourseDetails style) */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Project Description & Scope */}
          <div className="rounded-3xl border border-app-border bg-app-surface p-6 sm:p-8 space-y-4 shadow-sm">
            <h2 className="font-sans text-lg font-bold text-app-text-primary flex items-center gap-2 border-b border-app-border pb-3">
              <FolderGit2 className="h-5 w-5 text-app-accent" />
              Project Description & Scope
            </h2>
            <p className="text-sm text-app-text-primary leading-relaxed whitespace-pre-wrap font-sans">
              {selectedProject.project_info}
            </p>
          </div>

          {/* Supervisor Guidance & Experience */}
          <div className="rounded-3xl border border-app-border bg-app-surface p-6 sm:p-8 space-y-4 shadow-sm flex flex-col justify-between">
            <div>
              <h2 className="font-sans text-lg font-bold text-app-text-primary flex items-center gap-2 border-b border-app-border pb-3">
                <Sparkles className="h-5 w-5 text-app-accent" />
                Supervisor Guidance & Experience
              </h2>
              <p className="text-sm text-app-text-primary leading-relaxed whitespace-pre-wrap font-sans mt-4">
                {selectedProject.experience}
              </p>
            </div>
            <div className="pt-4 border-t border-app-border/40 mt-6 flex items-center gap-2.5 text-xs text-app-text-secondary shrink-0">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-app-bg text-app-text-secondary border border-app-border">
                <UserIcon className="h-3 w-3" />
              </div>
              <span>Reviewed by a verified BITSian</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // COMMUNITY FEED / BROWSE PROJECTS PAGE
  return (
    <div className="space-y-8 py-4">
      {/* Header Block (Exact layout and spacing of HEL page) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-app-border pb-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-app-text-secondary">
            <button
              onClick={onHomeClick}
              className="hover:text-app-text-primary transition-colors"
            >
              Categories
            </button>
            <span>/</span>
            <span className="text-app-text-primary">Projects</span>
          </div>
          <h1 className="font-sans text-3xl font-extrabold tracking-tight text-app-text-primary mt-1">
            Browse Projects
          </h1>
          <p className="text-sm text-app-text-secondary mt-1 font-sans">
            SOP / LOP / DOP / RC
          </p>
        </div>

        {/* Toggle pills & Share Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 shrink-0">
          {/* Sub-Category Toggle pills */}
          <div className="flex bg-app-bg p-1 rounded-xl border border-app-border">
            <button
              onClick={() => onSelectCategory?.("HEL")}
              className="px-4 py-2 text-xs font-bold rounded-lg transition-all text-app-text-secondary hover:text-app-text-primary"
            >
              Humanities (HEL)
            </button>
            <button
              onClick={() => onSelectCategory?.("OPEL_DEL")}
              className="px-4 py-2 text-xs font-bold rounded-lg transition-all text-app-text-secondary hover:text-app-text-primary"
            >
              Open & Discipline
            </button>
            <button
              className="px-4 py-2 text-xs font-bold rounded-lg transition-all bg-app-accent text-white shadow-sm"
            >
              Projects
            </button>
          </div>

          <button
            onClick={onAddReviewClick}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-app-accent px-5 py-3 text-sm font-semibold text-white hover:bg-app-accent-hover transition-all duration-200 shadow-md focus:outline-none"
          >
            <PlusCircle className="h-4.5 w-4.5" />
            <span>Share Project Review</span>
          </button>
        </div>
      </div>

      {/* Search / Filters Row (Matches Browse layout perfectly with a responsive grid structure) */}
      <div className="grid gap-4 md:grid-cols-12 items-center">
        {/* Search Input Container */}
        <div className="relative md:col-span-6 lg:col-span-8">
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-app-text-secondary/60" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by project title or supervisor..."
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

        {/* Sort Dropdown */}
        <div className="relative md:col-span-3 lg:col-span-2">
          <button
            onClick={() => {
              setIsSortOpen(!isSortOpen);
              setIsFilterDropdownOpen(false);
            }}
            className="w-full flex items-center justify-between rounded-2xl border border-app-border bg-app-surface px-4 py-3.5 text-sm font-semibold text-app-text-primary hover:bg-app-bg focus:outline-none"
          >
            <div className="flex items-center gap-2 truncate">
              <SlidersHorizontal className="h-4 w-4 text-zinc-400" />
              <span className="truncate">
                Sort: {sortLabels[sortOption]}
              </span>
            </div>
            <ChevronDown className={`h-4 w-4 text-zinc-500 transition-transform ${isSortOpen ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence>
            {isSortOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setIsSortOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute z-30 mt-2 w-full rounded-xl border border-app-border bg-app-surface p-1.5 shadow-md"
                >
                  {Object.entries(sortLabels).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => {
                        setSortOption(key as any);
                        setIsSortOpen(false);
                      }}
                      className={`w-full text-left rounded-lg px-3.5 py-2 text-xs font-bold transition-colors ${
                        sortOption === key ? "bg-app-accent text-white" : "text-app-text-secondary hover:text-app-text-primary hover:bg-app-bg"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Grouped Filter Dropdown */}
        <div className="relative md:col-span-3 lg:col-span-2">
          {(() => {
            const activeFiltersCount = 
              (filterDomain !== "all" ? 1 : 0) +
              (filterBranch !== "all" ? 1 : 0) +
              (filterDept !== "all" ? 1 : 0) +
              (filterType !== "all" ? 1 : 0);
            
            return (
              <>
                <button
                  onClick={() => {
                    setIsFilterDropdownOpen(!isFilterDropdownOpen);
                    setIsSortOpen(false);
                  }}
                  className="w-full flex items-center justify-between rounded-2xl border border-app-border bg-app-surface px-4 py-3.5 text-sm font-semibold text-app-text-primary hover:bg-app-bg focus:outline-none"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Filter className="h-4 w-4 text-app-text-secondary/60" />
                    <span className="truncate">
                      {activeFiltersCount > 0 ? `Filters (${activeFiltersCount})` : "Filter"}
                    </span>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-app-text-secondary/60 transition-transform ${isFilterDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {isFilterDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-20" onClick={() => setIsFilterDropdownOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute z-30 mt-2 w-72 sm:w-80 rounded-2xl border border-app-border bg-app-surface p-4.5 shadow-xl right-0 space-y-4"
                      >
                        {/* 1. Project Domain */}
                        <div>
                          <label className="block text-[10px] font-bold text-app-text-secondary uppercase tracking-wider mb-1.5 font-mono">
                            Project Domain
                          </label>
                          <select
                            value={filterDomain}
                            onChange={(e) => setFilterDomain(e.target.value)}
                            className="w-full rounded-xl border border-app-border bg-app-bg px-3 py-2 text-xs font-semibold text-app-text-primary focus:border-app-accent focus:outline-none focus:ring-1 focus:ring-app-accent font-sans"
                          >
                            <option value="all">All Domains</option>
                            {domainsList.map((dom) => (
                              <option key={dom} value={dom}>
                                {dom}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* 2. Student Branch */}
                        <div>
                          <label className="block text-[10px] font-bold text-app-text-secondary uppercase tracking-wider mb-1.5 font-mono">
                            Student Branch
                          </label>
                          <select
                            value={filterBranch}
                            onChange={(e) => setFilterBranch(e.target.value)}
                            className="w-full rounded-xl border border-app-border bg-app-bg px-3 py-2 text-xs font-semibold text-app-text-primary focus:border-app-accent focus:outline-none focus:ring-1 focus:ring-app-accent font-sans"
                          >
                            <option value="all">All Branches</option>
                            {branchesList.map((branch) => (
                              <option key={branch} value={branch}>
                                {branch}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* 3. Supervising Department */}
                        <div>
                          <label className="block text-[10px] font-bold text-app-text-secondary uppercase tracking-wider mb-1.5 font-mono">
                            Supervising Department
                          </label>
                          <select
                            value={filterDept}
                            onChange={(e) => setFilterDept(e.target.value)}
                            className="w-full rounded-xl border border-app-border bg-app-bg px-3 py-2 text-xs font-semibold text-app-text-primary focus:border-app-accent focus:outline-none focus:ring-1 focus:ring-app-accent font-sans"
                          >
                            <option value="all">All Departments</option>
                            {deptsList.map((dept) => (
                              <option key={dept} value={dept}>
                                {dept}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* 4. Project Type */}
                        <div>
                          <label className="block text-[10px] font-bold text-app-text-secondary uppercase tracking-wider mb-1.5 font-mono">
                            Project Type
                          </label>
                          <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="w-full rounded-xl border border-app-border bg-app-bg px-3 py-2 text-xs font-semibold text-app-text-primary focus:border-app-accent focus:outline-none focus:ring-1 focus:ring-app-accent font-sans"
                          >
                            <option value="all">All Types</option>
                            {projectTypesList.map((type) => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Reset Button inside dropdown */}
                        {activeFiltersCount > 0 && (
                          <div className="pt-2 border-t border-app-border">
                            <button
                              onClick={() => {
                                setFilterDomain("all");
                                setFilterBranch("all");
                                setFilterDept("all");
                                setFilterType("all");
                              }}
                              className="w-full text-center rounded-lg bg-app-bg border border-app-border hover:bg-app-surface hover:text-app-accent px-3 py-2 text-xs font-bold transition-colors text-app-text-secondary"
                            >
                              Reset Filters
                            </button>
                          </div>
                        )}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </>
            );
          })()}
        </div>
      </div>

      {/* Grid of Project Cards (Matches CourseCard.tsx layout and spacing of HEL page) */}
      {filteredAndSortedProjects.length === 0 ? (
        <div className="rounded-3xl border border-app-border bg-app-surface p-16 text-center shadow-sm max-w-xl mx-auto space-y-3">
          <FolderGit2 className="h-10 w-10 text-app-text-secondary/60 mx-auto mb-3.5" />
          <p className="text-sm text-app-text-primary font-bold">
            {projects.length === 0 && !hasActiveFilters
              ? "No project reviews yet. Be the first to submit one."
              : "No projects matched your criteria"}
          </p>
          <p className="text-xs text-app-text-secondary mt-1 max-w-sm mx-auto leading-relaxed">
            {projects.length === 0 && !hasActiveFilters
              ? "There are no project reviews in the community feed yet. Share your experience to help other BITSians."
              : "Try clearing search queries, adjusting supervisor department or student branch filters to view BITSian projects."}
          </p>
          {hasActiveFilters && (
            <button
              onClick={() => {
                setSearchQuery("");
                setFilterDept("all");
                setFilterBranch("all");
                setFilterDomain("all");
                setFilterType("all");
              }}
              className="mt-4 text-xs font-bold text-app-accent hover:underline"
            >
              Clear Search & Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAndSortedProjects.map((project, idx) => (
            <motion.div
              key={project.id || idx}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSelectedProject(project)}
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl bg-app-surface p-6 text-app-text-primary border border-app-border cursor-pointer transition-all duration-300 hover:border-app-accent hover:shadow-sm"
            >
              {/* Card Header & Metadata */}
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] sm:text-xs font-semibold tracking-wider text-app-text-secondary uppercase flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-app-text-secondary/70" />
                    {project.taken_in}
                  </span>
                  <div className="flex gap-1.5 items-center shrink-0">
                    {project.type && (
                      <span className="bg-app-accent/10 px-2 py-0.5 rounded text-[10px] font-bold font-mono text-app-accent border border-app-accent/20">
                        {project.type}
                      </span>
                    )}
                    <span className="bg-app-bg px-2 py-0.5 rounded text-[10px] font-bold font-mono text-app-text-secondary border border-app-border max-w-[120px] truncate">
                      {project.student_branch ? project.student_branch.replace("B.E. ", "").replace("M.Sc. ", "") : "BITSian"}
                    </span>
                  </div>
                </div>

                {/* Project Title */}
                <h3 className="mt-2.5 font-sans text-base sm:text-lg font-bold leading-tight text-app-text-primary group-hover:text-app-accent transition-colors line-clamp-2">
                  {project.project_title}
                </h3>

                {/* Supervisor Detail */}
                <div className="mt-3.5 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-app-text-primary">
                    <UserIcon className="h-3.5 w-3.5 text-app-text-secondary shrink-0" />
                    <span className="truncate">by {project.prof_name}</span>
                  </div>
                  <div className="text-[10px] font-bold font-mono text-app-text-secondary/80 uppercase tracking-wider pl-5 flex items-center gap-1">
                    <BookOpen className="h-2.5 w-2.5 text-app-text-secondary/60" />
                    <span className="truncate">{project.prof_branch}</span>
                  </div>
                </div>

                {/* Project Brief Info */}
                <p className="mt-3 text-xs text-app-text-secondary leading-relaxed line-clamp-3">
                  {project.project_info}
                </p>
              </div>

              {/* Card Footer */}
              <div className="mt-6 flex items-center justify-between border-t border-app-border pt-4 text-xs font-semibold text-app-text-secondary">
                <div className="flex items-center gap-4">
                  {project.created_at && (
                    <span className="text-[10px] font-mono text-app-text-secondary/50 flex items-center gap-1">
                      <Clock className="h-3 w-3 text-app-text-secondary/40" />
                      {new Date(project.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric"
                      })}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 bg-app-bg text-app-text-primary px-2.5 py-0.5 rounded-full border border-app-border text-[9px] font-bold uppercase tracking-wider">
                  View Detail
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
