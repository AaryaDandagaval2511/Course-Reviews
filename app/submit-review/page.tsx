'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

type Course = {
    course_code: string
    course_name: string
    nickname: string | null
}

export default function SubmitReviewPage() {
    /* ---------------- COURSE STATE ---------------- */
    const [courses, setCourses] = useState<Course[]>([])
    const [courseCode, setCourseCode] = useState('')
    const [courseName, setCourseName] = useState('')
    const [activeField, setActiveField] = useState<'code' | 'name' | null>(null)
    const [showSuggestions, setShowSuggestions] = useState(false)

    const wrapperRef = useRef<HTMLDivElement | null>(null)

    const searchParams = useSearchParams()

    const from = searchParams.get('from')          // 'home' | 'course'
    const fromCourseCode = searchParams.get('course_code')

    const router = useRouter()

    /* ---------------- FORM STATE ---------------- */
    const [form, setForm] = useState({
        your_grade: '',
        av_plus: '',
        gr_comm: '',
        evals: '',
        open_book: '',
        attendance: '',
        slides: '',
        pr_no: '',
        rec: '',
        not_rec: '',
        advice: '',
        comments: '',
    })

    /* ---------------- FETCH COURSES ---------------- */
    useEffect(() => {
        const loadCourses = async () => {
            const { data } = await supabase
                .from('courses')
                .select('course_code, course_name, nickname')

            setCourses(data || [])
        }

        loadCourses()
    }, [])

    /* -------- CLOSE SUGGESTIONS ON OUTSIDE CLICK -------- */
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setShowSuggestions(false)
                setActiveField(null)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () =>
            document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    /* ---------------- INPUT HANDLERS ---------------- */
    const handleCourseCodeChange = (val: string) => {
        setCourseCode(val)
        setActiveField('code')
        setShowSuggestions(true)
    }

    const handleCourseNameChange = (val: string) => {
        setCourseName(val)
        setActiveField('name')
        setShowSuggestions(true)
    }

    /* ---------------- SUGGESTIONS ---------------- */
    const suggestions = courses.filter(c => {
        if (!activeField) return false

        if (activeField === 'code') {
            return c.course_code
                .toLowerCase()
                .includes(courseCode.toLowerCase())
        }

        return (
            c.course_name.toLowerCase().includes(courseName.toLowerCase()) ||
            c.nickname?.toLowerCase().includes(courseName.toLowerCase())
        )
    })

    /* ---------------- FORM HANDLER ---------------- */
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async () => {
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            alert('You must be logged in')
            return
        }

        const { error } = await supabase.from('reviews').insert({
            ...form,
            course_code: courseCode,
            course_name: courseName,
            user_id: user.id,
        })

        if (error) {
            alert(error.message)
            return
        }

        // 🔁 Redirect back correctly
        if (from === 'course' && fromCourseCode) {
            router.push(`/course/${encodeURIComponent(fromCourseCode)}`)
        } else if (from === 'profile') {
            router.push('/profile')
        } else {
            router.push('/home')
        }
    }

    return (
        <div className="min-h-screen bg-black text-white font-sans">
            {/* Top bar */}
            <header className="flex items-center justify-between bg-[#3b2947] px-8 py-3">
                <span className="text-xl font-bold text-white">
                    BITS Course Reviews
                </span>

                <nav className="flex items-center gap-8 text-white">
                    {from === 'course' && fromCourseCode ? (
                        <Link
                            href={`/course/${encodeURIComponent(fromCourseCode)}`}
                            className="text-base font-bold hover:underline"
                        >
                            ← Back to Reviews
                        </Link>
                    ) : from === 'profile' ? (
                        <Link
                            href="/profile"
                            className="text-base font-bold hover:underline"
                        >
                            ← Back to Profile
                        </Link>
                    ) : (
                        <Link
                            href="/home"
                            className="text-base font-bold hover:underline"
                        >
                            ← Back to Home
                        </Link>
                    )}
                </nav>
            </header>

            <main className="flex justify-center px-6 py-16">
                <div className="w-full max-w-3xl bg-[#f7f6eb] text-black rounded-3xl p-10 shadow-2xl">
                    <h1 className="text-3xl font-bold text-[#6C2397] mb-8">
                        Submit a Review
                    </h1>

                    {/* ---------- COURSE CODE + NAME ---------- */}
                    <div className="relative mb-6" ref={wrapperRef}>
                        <div className="flex gap-4">
                            <input
                                value={courseCode}
                                onFocus={() => setActiveField('code')}
                                onChange={e => handleCourseCodeChange(e.target.value)}
                                placeholder="Course code"
                                className="w-1/3 rounded-md border px-3 py-2 text-sm"
                            />

                            <input
                                value={courseName}
                                onFocus={() => setActiveField('name')}
                                onChange={e => handleCourseNameChange(e.target.value)}
                                placeholder="Course name/abbr."
                                className="w-2/3 rounded-md border px-3 py-2 text-sm"
                            />
                        </div>

                        {showSuggestions && suggestions.length > 0 && (
                            <div className="absolute z-50 mt-2 w-full rounded-xl bg-white shadow-lg max-h-56 overflow-y-auto">
                                {suggestions.slice(0, 8).map(c => (
                                    <button
                                        key={c.course_code}
                                        onClick={() => {
                                            setCourseCode(c.course_code)
                                            setCourseName(c.course_name)
                                            setShowSuggestions(false)
                                            setActiveField(null)
                                        }}
                                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                                    >
                                        <b>{c.course_code}</b> — {c.course_name}
                                        {c.nickname && (
                                            <span className="text-gray-500"> ({c.nickname})</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    {/* --------------------------------------- */}


                    <div className="space-y-4 text-sm">
                        <label className="block">
                            <span className="font-semibold">Taken in</span>
                            <input
                                name="taken_in"
                                onChange={handleChange}
                                placeholder="e.g., 2024-25 Sem 1"
                                className="mt-1 w-full rounded-md border px-3 py-2"
                            />
                        </label>
                        {/* Grade */}
                        <label className="block">
                            <span className="font-semibold">Grade received</span>
                            <select
                                name="your_grade"
                                onChange={handleChange}
                                className="mt-1 w-full rounded-md border px-3 py-2"
                            >
                                <option value="">Select</option>
                                <option>A</option>
                                <option>A-</option>
                                <option>B</option>
                                <option>B-</option>
                                <option>C</option>
                                <option>C-</option>
                                <option>D</option>
                                <option>E</option>
                                <option>NC</option>
                            </select>
                        </label>

                        <label className="block">
                            <span className="font-semibold">Total marks received</span>
                            <input
                                name="av_plus"
                                onChange={handleChange}
                                className="mt-1 w-full rounded-md border px-3 py-2"
                            />
                        </label>

                        <label className="block">
                            <span className="font-semibold">Comments on grading</span>
                            <textarea
                                name="gr_comm"
                                onChange={handleChange}
                                className="mt-1 w-full rounded-md border px-3 py-2"
                            />
                        </label>

                        <label className="block">
                            <span className="font-semibold">Evaluative components</span>
                            <input
                                name="evals"
                                onChange={handleChange}
                                className="mt-1 w-full rounded-md border px-3 py-2"
                            />
                        </label>

                        <label className="block">
                            <span className="font-semibold">Evaluation type</span>
                            <input
                                name="open_book"
                                onChange={handleChange}
                                className="mt-1 w-full rounded-md border px-3 py-2"
                            />
                        </label>

                        <label className="block">
                            <span className="font-semibold">Attendance expectations</span>
                            <textarea
                                name="attendance"
                                onChange={handleChange}
                                className="mt-1 w-full rounded-md border px-3 py-2"
                            />
                        </label>

                        <label className="block">
                            <span className="font-semibold">Course material & slides</span>
                            <textarea
                                name="slides"
                                onChange={handleChange}
                                className="mt-1 w-full rounded-md border px-3 py-2"
                            />
                        </label>

                        <label className="block">
                            <span className="font-semibold">PR No. </span>
                            <input
                                name="pr_no"
                                onChange={handleChange}
                                className="mt-1 w-full rounded-md border px-3 py-2"
                            />
                        </label>

                        <label className="block">
                            <span className="font-semibold">What worked well (why you would recommend)</span>
                            <textarea
                                name="rec"
                                onChange={handleChange}
                                className="mt-1 w-full rounded-md border px-3 py-2"
                            />
                        </label>

                        <label className="block">
                            <span className="font-semibold">Things to keep in mind (why you would not recommend)</span>
                            <textarea
                                name="not_rec"
                                onChange={handleChange}
                                className="mt-1 w-full rounded-md border px-3 py-2"
                            />
                        </label>

                        <label className="block">
                            <span className="font-semibold">Advice from the reviewer</span>
                            <textarea
                                name="advice"
                                onChange={handleChange}
                                className="mt-1 w-full rounded-md border px-3 py-2"
                            />
                        </label>

                        <label className="block">
                            <span className="font-semibold">Additional comments</span>
                            <textarea
                                name="comments"
                                onChange={handleChange}
                                className="mt-1 w-full rounded-md border px-3 py-2"
                            />
                        </label>
                    </div>

                    <button
                        onClick={handleSubmit}
                        className="mt-10 rounded-full bg-[#6C2397] px-8 py-3 text-white font-semibold hover:bg-[#5a1d7d]"
                    >
                        Submit Review
                    </button>
                </div>
            </main>
        </div>
    )
}