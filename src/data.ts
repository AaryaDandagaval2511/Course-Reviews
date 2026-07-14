/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Course, Review } from "./types";

export const INITIAL_COURSES: Course[] = [
  {
    id: "HSS_F368",
    code: "HSS F368",
    name: "Asian Cinemas and Cultures",
    instructor: "AILEEN BLANEY",
    category: "HEL",
    averageMarks: "85.6/100",
    averageGrade: "A",
    courseTotal: "87",
    courseHandoutUrl: "#",
    description: "An introductory exploration of cinematic arts across East and South Asia, focusing on representation, identity, post-colonial nationalisms, and aesthetic forms in historical and contemporary contexts."
  },
  {
    id: "HSS_F391",
    code: "HSS F391",
    name: "Acoustic Humanities",
    instructor: "RAYSON ALEX",
    category: "HEL",
    averageMarks: "78/100",
    averageGrade: "B+",
    courseTotal: "82",
    courseHandoutUrl: "#",
    description: "A unique study of soundscapes, auditory culture, and the role of sonic environments in shaping human experience, literature, local cultures, and historical archives."
  },
  {
    id: "GS_F312",
    code: "GS F312",
    name: "Applied Philosophy",
    instructor: "SHREEPAD BHAT",
    category: "HEL",
    averageMarks: "81/100",
    averageGrade: "A-",
    courseTotal: "85",
    courseHandoutUrl: "#",
    description: "An investigation into fundamental philosophical theories—ethics, existentialism, and logic—and their practical applications to modern technology, policy, and personal life choices."
  },
  {
    id: "HSS_F330",
    code: "HSS F330",
    name: "Appreciation of Art",
    instructor: "KATHRYN SUSANNAH HUMMEL",
    category: "HEL",
    averageMarks: "84/100",
    averageGrade: "A-",
    courseTotal: "86",
    courseHandoutUrl: "#",
    description: "A visual journey through historical and contemporary global art movements, training students in critical analysis of compositions, medium, visual semantics, and creative intent."
  },
  {
    id: "HSS_F312",
    code: "HSS F312",
    name: "Bureaucracy",
    instructor: "PUSHPINDER SYAL",
    category: "HEL",
    averageMarks: "75/100",
    averageGrade: "B",
    courseTotal: "78",
    courseHandoutUrl: "#",
    description: "A sociopolitical study of administrative structures, authority, public policy, and organizational behaviors through the lens of Weberian models and modern global bureaucracy."
  },
  {
    id: "HSS_F375",
    code: "HSS F375",
    name: "Business and Politics in Colonial and Postcolonial India",
    instructor: "LAKSHMI SUBRAMANIAN",
    category: "HEL",
    averageMarks: "76/100",
    averageGrade: "B",
    courseTotal: "80",
    courseHandoutUrl: "#",
    description: "This course studies Indian business history from the pre-colonial to the post-colonial period. It looks at how trade, industry, and business practices evolved over time and how different regions and social groups, including castes, engaged with and perceived business activity in these periods."
  },
  {
    id: "CS_F301",
    code: "CS F301",
    name: "Principles of Programming Languages",
    instructor: "VANDANA BHAT",
    category: "OPEL_DEL",
    averageMarks: "73/100",
    averageGrade: "B-",
    courseTotal: "75",
    courseHandoutUrl: "#",
    description: "An in-depth theoretical and practical study of programming paradigms, language design, formal semantics, compilers, and functional programming frameworks."
  },
  {
    id: "ECON_F211",
    code: "ECON F211",
    name: "Principles of Economics",
    instructor: "RISHI KUMAR",
    category: "OPEL_DEL",
    averageMarks: "82/100",
    averageGrade: "A-",
    courseTotal: "84",
    courseHandoutUrl: "#",
    description: "A core foundation in microeconomics and macroeconomics, exploring market dynamics, consumer behaviors, national accounts, monetary policy, and global economic trade."
  },
  {
    id: "BITS_F415",
    code: "BITS F415",
    name: "Introduction to MEMS",
    instructor: "RAHUL SHARAN",
    category: "OPEL_DEL",
    averageMarks: "80/100",
    averageGrade: "B+",
    courseTotal: "82",
    courseHandoutUrl: "#",
    description: "A multi-disciplinary course exploring micro-electromechanical systems design, fabrication techniques, cleanroom integration, sensors, and actuator applications."
  },
  {
    id: "CS_F303",
    code: "CS F303",
    name: "Computer Networks",
    instructor: "POONAM GOYAL",
    category: "OPEL_DEL",
    averageMarks: "68/100",
    averageGrade: "C+",
    courseTotal: "71",
    courseHandoutUrl: "#",
    description: "Comprehensive analysis of computer communication networks, network layering, routing protocols, socket programming, security mechanisms, and transport layer optimization."
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: "rev_1",
    courseId: "HSS_F368",
    semester: "First Semester 2024-2025",
    gradeReceived: "A",
    marksReceived: "87",
    commentsOnGrading: "Good",
    evaluativeComponents: "Best 2 of 3 Quiz, Mid sem, Compre, Assignment (any 5 out of like 15), attendance",
    evaluationType: "Mid sem, compre open handwritten notes, quiz closed book, assignement take home",
    attendanceExpectations: "Need to go 60% of Classes for full marks, rest then scaled according to percentage class attended",
    courseMaterialsProvided: "yes",
    prNo: "< 200",
    whatWorkedWell: "good grading, easy scoring if you spend 5-6 hours before midsem and compre to write down all you can from GPT on the movies which are going to come in exam",
    thingsToKeepInMind: "dont miss attendance and assignment free marks, those alone got me avg plus 5",
    adviceFromReviewer: "really easy course just if you can copy like 10 pages of movie reviews from some AI before exam",
    submittedBy: "aarya.dan7@gmail.com",
    submittedAt: "2025-01-10T12:00:00Z"
  },
  {
    id: "rev_2",
    courseId: "HSS_F368",
    semester: "First Semester 2024-2025",
    gradeReceived: "A",
    marksReceived: "87",
    commentsOnGrading: "Very lenient grading, generous with marks.",
    evaluativeComponents: "Quizzes, Midsem, Compre, and Term Paper",
    evaluationType: "Open book for midsem/compre, closed quizzes",
    attendanceExpectations: "Strict 75% rule initially, but professor was lenient",
    courseMaterialsProvided: "Slides are highly comprehensive, enough for exam prep.",
    prNo: "150",
    whatWorkedWell: "Watching movies carefully during classes and writing detailed thematic analysis in exams. The grading is lenient if you write substantial essays.",
    thingsToKeepInMind: "Don't ignore the Term Paper, it holds 20% weightage.",
    adviceFromReviewer: "Start working on the term paper early. Use cinematic terms like mise-en-scène and montage!",
    submittedBy: "f20220199@pilani.bits-pilani.ac.in",
    submittedAt: "2025-01-12T14:30:00Z"
  },
  {
    id: "rev_3",
    courseId: "HSS_F368",
    semester: "Second Semester 2023-2024",
    gradeReceived: "A-",
    marksReceived: "83/100",
    commentsOnGrading: "Fairly lenient, but requires good analytical skills in essays.",
    evaluativeComponents: "Midsem, Compre, Film Analysis Assignment, and Group presentation",
    evaluationType: "Open Book for Compre",
    attendanceExpectations: "60% required for attendance marks",
    courseMaterialsProvided: "Excellent handouts provided; readings are essential",
    prNo: "180",
    whatWorkedWell: "Focus on themes of nationalism and gender in Asian cinema. Write structured answers.",
    thingsToKeepInMind: "Reading list can be heavy, but film screenings are super fun.",
    adviceFromReviewer: "Try to Yap all points like literally everything related to movie in the question answers. More depth and details fetch higher marks.",
    submittedBy: "anonymous@pilani.bits-pilani.ac.in",
    submittedAt: "2024-05-20T09:15:00Z"
  },
  {
    id: "rev_4",
    courseId: "HSS_F391",
    semester: "First Semester 2024-2025",
    gradeReceived: "B+",
    marksReceived: "78/100",
    commentsOnGrading: "Moderate. Dr. Alex is strict about originality in acoustic reports.",
    evaluativeComponents: "Acoustic Walk Report (30%), Midsem (30%), Compre (40%)",
    evaluationType: "Closed Book, Project Report Submission",
    attendanceExpectations: "Highly recommended as lecture demonstrations are crucial",
    courseMaterialsProvided: "Auditory slides and research papers",
    prNo: "250",
    whatWorkedWell: "Taking active notes on soundscape definitions and doing a high-quality field report for the Acoustic Walk.",
    thingsToKeepInMind: "Do not copy-paste definitions; he checks heavily for AI-generated text or plagiarism.",
    adviceFromReviewer: "Make sure your sound walk recording is clear. Pay attention to the sonic textures of your campus environment.",
    submittedBy: "f20210452@pilani.bits-pilani.ac.in",
    submittedAt: "2025-01-08T18:00:00Z"
  },
  {
    id: "rev_5",
    courseId: "GS_F312",
    semester: "Second Semester 2023-2024",
    gradeReceived: "A-",
    marksReceived: "81/100",
    commentsOnGrading: "Good grading. Dr. Bhat values critical thinking and conceptual clarity over rote memorization.",
    evaluativeComponents: "Weekly Reflections (20%), Midsem (35%), Compre (45%)",
    evaluationType: "Open book for compre, closed book for midsem",
    attendanceExpectations: "Not officially mandatory but highly helpful to follow philosophical proofs",
    courseMaterialsProvided: "Philosophical readings (Plato, Kant, Sartre) and lecture notes",
    prNo: "< 100",
    whatWorkedWell: "Participating in classroom debates and relating classical philosophy to modern ethical dilemmas in essays.",
    thingsToKeepInMind: "Philosophical terms can feel abstract; rewrite them in your own simple language during exams.",
    adviceFromReviewer: "Read the assigned papers before class. The discussions are intellectual goldmines.",
    submittedBy: "f20230081@pilani.bits-pilani.ac.in",
    submittedAt: "2024-05-18T10:00:00Z"
  },
  {
    id: "rev_6",
    courseId: "HSS_F330",
    semester: "First Semester 2024-2025",
    gradeReceived: "A-",
    marksReceived: "84/100",
    commentsOnGrading: "Lenient grading. High emphasis on personal artistic interpretations.",
    evaluativeComponents: "Art Analysis Journal (40%), Midsem (25%), Compre (35%)",
    evaluationType: "Open book/notes, Take-home Journal",
    attendanceExpectations: "75% expected, lectures are highly interactive with art slideshows",
    courseMaterialsProvided: "Rich presentation slide decks and art history catalogs",
    prNo: "310",
    whatWorkedWell: "Write creative and expressive art reviews. Focus on composition, color theory, and historical context.",
    thingsToKeepInMind: "Be punctual with your journal entries; late submissions carry heavy penalties.",
    adviceFromReviewer: "Visit a gallery if possible, or do virtual tours. Your enthusiasm for art will definitely show in your writing.",
    submittedBy: "f20220812@pilani.bits-pilani.ac.in",
    submittedAt: "2024-11-25T15:20:00Z"
  },
  {
    id: "rev_7",
    courseId: "HSS_F312",
    semester: "Second Semester 2023-2024",
    gradeReceived: "B",
    marksReceived: "75/100",
    commentsOnGrading: "Strict but fair. Expects professional report-style writing.",
    evaluativeComponents: "Case Studies (30%), Midsem (30%), Compre (40%)",
    evaluationType: "Closed book",
    attendanceExpectations: "75% rule strictly enforced",
    courseMaterialsProvided: "Syllabus reading packets and bureaucratic model slides",
    prNo: "450",
    whatWorkedWell: "Memorizing Weberian models of bureaucracy and replicating them in flowcharts during the exams.",
    thingsToKeepInMind: "Do not leave answers incomplete; she looks for thorough case breakdowns.",
    adviceFromReviewer: "Structure your answers with clean subheadings: Background, Analysis, Weberian theory link, and Conclusion.",
    submittedBy: "f20220311@pilani.bits-pilani.ac.in",
    submittedAt: "2024-05-22T11:45:00Z"
  }
];

export function getBookmarkCount(courseId: string, isBookmarked: boolean, dbCount?: number): number {
  if (dbCount !== undefined) {
    return dbCount;
  }
  const baseCounts: Record<string, number> = {
    HSS_F368: 123,
    HSS_F391: 84,
    GS_F312: 42,
    HSS_F330: 97,
    HSS_F312: 55,
    HSS_F375: 70,
    CS_F301: 109,
    ECON_F211: 144,
    BITS_F415: 38,
    CS_F303: 91,
  };
  const base = baseCounts[courseId] || 15;
  return base + (isBookmarked ? 1 : 0);
}

export const INITIAL_PROJECTS = [
  {
    id: "proj_1",
    project_title: "Deep Learning on Edge Devices",
    prof_name: "DR. SANJAY KUMAR VIDHYADHARAN",
    prof_branch: "B.E. Electrical and Electronics",
    student_branch: "B.E. Computer Science",
    project_type: "SOP",
    domain: "Artificial Intelligence / Machine Learning",
    type: "SOP",
    taken_in: "Second Semester 2024-2025",
    project_info: "The project focused on deploying and optimizing deep learning models (specifically YOLOv8 and lightweight MobileNets) on resource-constrained edge computing devices like the Raspberry Pi 4 and Jetson Nano. We investigated Quantization-Aware Training (QAT) and network pruning techniques to decrease inference latency while maintaining model accuracy.",
    experience: "Sanjay sir is extremely supportive and regular. We had weekly review meets where he thoroughly analyzed our progress and suggested practical improvements. He has a solid lab with GPU resources which we could access remotely. The grading was extremely fair (mostly A or A- if you show consistent work). He is also very helpful with letters of recommendation (LoRs) if you perform well in the SOP/DOP.",
    created_at: "2025-05-10T14:30:00Z"
  },
  {
    id: "proj_2",
    project_title: "Optimization of Biodiesel Production from Waste Cooking Oil",
    prof_name: "PROF. SRINIVAS KRISHNASWAMY",
    prof_branch: "B.E. Chemical",
    student_branch: "B.E. Chemical",
    project_type: "DOP",
    domain: "Chemical",
    type: "DOP",
    taken_in: "First Semester 2024-2025",
    project_info: "This project investigated the transesterification process of waste cooking oil to biodiesel using heterogeneous catalysts. The primary focus was on modeling and optimizing key reaction parameters (temperature, catalyst concentration, methanol-to-oil ratio) using response surface methodology (RSM) in Design-Expert.",
    experience: "Srinivas sir is highly professional and is one of the most prominent researchers on campus. He expects high-quality work and regular lab presence. Though he can be strict about report deadlines, the learning experience is outstanding. If you are aiming for core chemical research or planning to apply for MS/PhD abroad, doing a project under him is highly recommended. Grading is performance-based and fair.",
    created_at: "2024-11-20T09:15:00Z"
  },
  {
    id: "proj_3",
    project_title: "Socio-Economic Impact of Beach Tourism in North Goa",
    prof_name: "DR. REENA CHERUVALATH",
    prof_branch: "M.Sc. Economics",
    student_branch: "M.Sc. Economics",
    project_type: "LOP",
    domain: "Economics",
    type: "LOP",
    taken_in: "Second Semester 2023-2024",
    project_info: "An empirical study evaluating the socio-economic effects of rapid beach tourism growth in Calangute and Baga. The research involved conducting structured surveys of local business owners, fishermen, and tourists to analyze income disparity, employment creation, and waste management strain.",
    experience: "Dr. Reena is very approachable and patient. Since this project involved field surveys, she gave excellent guidance on questionnaire design and statistical sampling. She was very flexible with deadlines as long as the survey data was authentic and analyzed correctly using SPSS or Stata. The project is highly social science oriented and offers a great break from standard tech SOPs. Got an A grade.",
    created_at: "2024-04-18T16:45:00Z"
  }
];

