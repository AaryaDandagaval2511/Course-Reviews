'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

type Course = {
    course_code: string
    course_name: string
    prof: string | null
    nickname: string | null
    course_dept: string | null
    count: number
}

type SortKey = 'course_name' | 'prof'
type SortOrder = 'asc' | 'desc'

export default function HomePage() {
    const [courses, setCourses] = useState<Course[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // UI state (UNCHANGED)
    const [search, setSearch] = useState('')
    const [sortKey, setSortKey] = useState<SortKey>('course_name')
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
    const [selectedDept, setSelectedDept] = useState<string | null>(null)

    const [filterOpen, setFilterOpen] = useState(false)
    const [sortOpen, setSortOpen] = useState(false)

    const sortRef = useRef<HTMLDivElement | null>(null)
    const filterRef = useRef<HTMLDivElement | null>(null)

    const router = useRouter()

    /* ---------------- LOAD COURSES + COUNTS ---------------- */

    useEffect(() => {
        const loadCourses = async () => {
            setLoading(true)

            // 1️⃣ Fetch courses (NO count column, NO aggregates)
            const { data: courseData, error: courseError } = await supabase
                .from('courses')
                .select('course_code, course_name, prof, nickname, course_dept')

            if (courseError) {
                setError(courseError.message)
                setLoading(false)
                return
            }

            // 2️⃣ Fetch all reviews once
            const { data: reviewData, error: reviewError } = await supabase
                .from('reviews')
                .select('course_code')

            if (reviewError) {
                setError(reviewError.message)
                setLoading(false)
                return
            }

            // 3️⃣ Build count map
            const countMap = new Map<string, number>()
                ; (reviewData || []).forEach(r => {
                    countMap.set(
                        r.course_code,
                        (countMap.get(r.course_code) ?? 0) + 1
                    )
                })

            // 4️⃣ Merge counts into courses
            const merged: Course[] = (courseData || []).map(c => ({
                ...c,
                count: countMap.get(c.course_code) ?? 0,
            }))

            setCourses(merged)
            setLoading(false)
        }

        loadCourses()
    }, [])

    /* ---------------- CLICK OUTSIDE ---------------- */

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node

            if (
                !sortRef.current?.contains(target) &&
                !filterRef.current?.contains(target)
            ) {
                setSortOpen(false)
                setFilterOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () =>
            document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    /* ---------------- AUTH GUARD ---------------- */

    useEffect(() => {
        const checkSession = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession()

            if (!session) router.replace('/')
        }

        checkSession()
    }, [router])

    /* ---------------- DERIVED DATA (UNCHANGED) ---------------- */

    const filteredCourses = useMemo(() => {
        let result = [...courses]

        // Search
        if (search.trim()) {
            const q = search.toLowerCase()
            result = result.filter(c =>
                [c.course_code, c.course_name, c.prof, c.nickname]
                    .filter(Boolean)
                    .some(v => v!.toLowerCase().includes(q))
            )
        }

        // Filter by department
        if (selectedDept) {
            result = result.filter(c => c.course_dept === selectedDept)
        }

        // Sort
        result.sort((a, b) => {
            const A = (a[sortKey] ?? '').toLowerCase()
            const B = (b[sortKey] ?? '').toLowerCase()

            if (A < B) return sortOrder === 'asc' ? -1 : 1
            if (A > B) return sortOrder === 'asc' ? 1 : -1
            return 0
        })

        return result
    }, [courses, search, selectedDept, sortKey, sortOrder])

    const toggleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))
        } else {
            setSortKey(key)
            setSortOrder('asc')
        }
        setSortOpen(false)
    }

    const arrow = (key: SortKey) =>
        sortKey === key ? (sortOrder === 'asc' ? ' ↑' : ' ↓') : ''

    const departments = Array.from(
        new Set(courses.map(c => c.course_dept).filter(Boolean))
    ) as string[]

    /* ---------------- LOGOUT ---------------- */

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.replace('/')
    }

    /* ---------------- UI ---------------- */

    return (
        <div className="min-h-screen bg-black text-white font-sans select-none">
            {/* Top bar */}
            <header className="flex items-center justify-between bg-[#3b2947] px-8 py-3">
                <span className="text-xl font-semibold text-white">
                    BITS Course Reviews
                </span>

                <nav className="flex items-center gap-8 text-white">
                    <Link
                        href="/submit-review?from=home"
                        className="text-base font-bold hover:underline"
                    >
                        Submit a review
                    </Link>

                    <Link href="/bookmarks?from=home"
                    className="text-base font-bold hover:underline"
                    >
                        Bookmarks
                    </Link>

                    <Link href="/profile"
                        className="text-base font-bold hover:underline">
                        Profile
                    </Link>

                    <button
                        onClick={handleLogout}
                        className="text-base font-bold hover:underline"
                    >
                        Log out
                    </button>
                </nav>
            </header>

            <main className="mt-16 flex flex-col items-center px-8">
                {/* 🔥 Browse title — EXACTLY SAME */}
                <h1
                    className="mb-10 font-sans text-[8vw] font-extrabold leading-none tracking-[0.35em] text-white drop-shadow-lg"
                    style={{
                        textShadow: '0 2px 12px #a784f7',
                        letterSpacing: '0.05em',
                        transform: 'scaleX(1.5)',
                        transformOrigin: 'center',
                    }}
                >
                    Browse
                </h1>

                {/* Controls — UNCHANGED */}
                <div className="mb-16 flex items-center gap-6">
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search by course code, name, prof or abbr. ..."
                        className="w-[560px] rounded-full bg-[#252428] px-10 py-5 text-sm text-white placeholder:text-gray-400 focus:outline-none"
                    />

                    {/* Sort */}
                    <div className="relative" ref={sortRef}>
                        <button
                            className="rounded-full bg-[#252428] px-10 py-4 text-sm font-medium"
                            onClick={() => {
                                setSortOpen(!sortOpen)
                                setFilterOpen(false)
                            }}
                        >
                            Sort
                        </button>

                        {sortOpen && (
                            <div className="absolute left-0 z-10 mt-2 w-52 rounded-md bg-white py-2 text-black shadow-lg">
                                <button
                                    onClick={() => toggleSort('course_name')}
                                    className="block w-full px-5 py-3 text-left hover:bg-gray-100"
                                >
                                    Course name{arrow('course_name')}
                                </button>
                                <button
                                    onClick={() => toggleSort('prof')}
                                    className="block w-full px-5 py-3 text-left hover:bg-gray-100"
                                >
                                    Professor{arrow('prof')}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Filter */}
                    <div className="relative" ref={filterRef}>
                        <button
                            className="rounded-full bg-[#252428] px-10 py-4 text-sm font-medium"
                            onClick={() => {
                                setFilterOpen(!filterOpen)
                                setSortOpen(false)
                            }}
                        >
                            Filter
                        </button>

                        {filterOpen && (
                            <div className="absolute left-0 z-10 mt-2 w-40 rounded-md bg-white py-2 text-black shadow-lg">
                                <button
                                    onClick={() => setSelectedDept(null)}
                                    className="block w-full px-5 py-3 text-left hover:bg-gray-100"
                                >
                                    All
                                </button>
                                {departments.map(d => (
                                    <button
                                        key={d}
                                        onClick={() => setSelectedDept(d)}
                                        className="block w-full px-5 py-3 text-left hover:bg-gray-100"
                                    >
                                        {d}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* States */}
                {loading && <p className="text-sm text-gray-300">Loading courses…</p>}
                {error && <p className="text-red-400">{error}</p>}
                {!loading && filteredCourses.length === 0 && (
                    <p className="text-gray-400">No courses found.</p>
                )}

                {/* Cards */}
                <section className="mb-16 grid max-w-6xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredCourses.map(course => (
                        <Link
                            key={course.course_code}
                            href={`/course/${encodeURIComponent(course.course_code)}`}
                            className="no-underline"
                        >
                            <article className="flex h-56 w-80 cursor-pointer flex-col justify-between rounded-3xl bg-[#f7f6eb] px-8 py-7 text-black shadow-xl transition-transform hover:-translate-y-1">
                                <div>
                                    <p className="text-lg font-semibold">
                                        {course.course_code}
                                    </p>
                                    <p className="mt-1 text-xl font-semibold">
                                        {course.course_name}
                                    </p>
                                    {course.prof && (
                                        <p className="mt-2 text-sm font-semibold">
                                            by {course.prof}
                                        </p>
                                    )}
                                </div>

                                <p className="mt-4 text-sm font-semibold text-gray-700">
                                    {course.count} reviews
                                </p>
                            </article>
                        </Link>
                    ))}
                </section>
            </main>
        </div>
    )
}