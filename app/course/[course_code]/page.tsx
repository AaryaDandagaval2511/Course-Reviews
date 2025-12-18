'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import Image from 'next/image'
import Link from 'next/link'

/* ---------------- TYPES ---------------- */

type Course = {
    course_code: string
    course_name: string
    prof: string | null
    info: string | null
    av_marks: string | null
    course_total: string | null
    av_grade: string | null
    course_handout: string | null
}

type Review = {
    your_grade: string | null
    av_plus: string | null
    taken_in: string | null   // ✅ NEW
    gr_comm: string | null
    evals: string | null
    open_book: string | null
    attendance: string | null
    slides: string | null
    pr_no: string | null
    rec: string | null
    not_rec: string | null
    advice: string | null
    comments: string | null
}

/* ---------------- PAGE ---------------- */

export default function CoursePage() {
    const params = useParams()
    const router = useRouter()

    const courseCode = decodeURIComponent(params.course_code as string)

    const [course, setCourse] = useState<Course | null>(null)
    const [reviews, setReviews] = useState<Review[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedReview, setSelectedReview] = useState<{
        review: Review
        index: number
    } | null>(null)


    const getPreviewText = (review: Review) => {
        return (
            review.rec?.trim() ||
            review.not_rec?.trim() ||
            review.comments?.trim() ||
            review.advice?.trim() ||
            review.gr_comm?.trim() ||
            '-' // fallback if everything is empty
        )
    }

    const handleBookmark = async () => {
        if (!course) return; // ✅ TS-safe guard

        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) return

        const { error } = await supabase.from('bookmarks').insert({
            user_id: user.id,
            course_code: course.course_code,
        })

        if (error) {
            alert('Already bookmarked')
        } else {
            alert('Course bookmarked!')
        }
    }

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

    /* ---------------- FETCH DATA ---------------- */

    useEffect(() => {
        const loadData = async () => {
            setLoading(true)

            // Course
            const { data: courseData, error: courseError } = await supabase
                .from('courses')
                .select(`
          course_code,
          course_name,
          prof,
          info,
          av_marks,
          course_total,
          av_grade,
          course_handout
        `)
                .eq('course_code', courseCode)
                .single()

            if (courseError || !courseData) {
                setCourse(null)
                setLoading(false)
                return
            }

            // Reviews
            const { data: reviewData } = await supabase
                .from('reviews')
                .select(`
          your_grade,
          av_plus,
          taken_in,
          gr_comm,
          evals,
          open_book,
          attendance,
          slides,
          pr_no,
          rec,
          not_rec,
          advice,
          comments
        `)
                .eq('course_code', courseCode)

            setCourse(courseData)
            setReviews(reviewData || [])
            setLoading(false)
        }

        loadData()
    }, [courseCode])

    /* ---------------- LOG OUT ---------------- */

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.replace('/')
    }

    const reviewFieldLabels: Record<keyof Review, string> = {
        taken_in: 'Taken in',
        your_grade: 'Grade received',
        av_plus: 'Total marks received',
        gr_comm: 'Comments on grading',
        evals: 'Evaluative components',
        open_book: 'Evaluation type',
        attendance: 'Attendance expectations',
        slides: 'Course material & slides',
        pr_no: 'PR No.',
        rec: 'What worked well (why you would recommend)',
        not_rec: 'Things to keep in mind (why you would not recommend)',
        advice: 'Advice from the reviewer',
        comments: 'Additional comments',
    }

    /* ---------------- STATES ---------------- */

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                Loading…
            </div>
        )
    }

    if (!course) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                Course not found
            </div>
        )
    }

    /* ---------------- UI ---------------- */

    return (
        <div className="min-h-screen bg-black text-white font-sans select-none">
            {/* Top bar */}
            <header className="flex items-center justify-between bg-[#3b2947] px-8 py-3">
                <span className="text-xl font-semibold">BITS Course Reviews</span>

                <nav className="flex items-center gap-8">
                    <Link href="/home" className="text-base font-bold hover:underline">
                        ← Back to home
                    </Link>

                    <Link
                        href={`/submit-review?from=course&course_code=${encodeURIComponent(
                            course.course_code
                        )}`}
                        className="text-base font-bold hover:underline"
                    >
                        Submit a review
                    </Link>

                    <Link href="/bookmarks?from=home"
                        className="text-base font-bold hover:underline"
                    >
                        Bookmarks
                    </Link>

                    <Link href="/profile" className="text-base font-bold hover:underline">
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

            <main className="px-12 py-14">
                {/* Header */}
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    <div>
                        <h1 className="text-6xl font-extrabold">{course.course_code}</h1>
                        <h2 className="text-5xl font-extrabold">{course.course_name}</h2>

                        {course.prof && (
                            <p className="text-3xl font-semibold mt-2">
                                by {course.prof}
                            </p>
                        )}

                        <p className="text-xl mt-4">{reviews.length} reviews</p>
                    </div>

                    <div>
                        <h3 className="text-xl font-bold mb-4">COURSE INFORMATION</h3>

                        <p className="text-lg leading-relaxed mb-8">
                            {course.info}
                        </p>

                        <button
                            onClick={handleBookmark}
                            className="
      inline-flex items-center gap-2
      rounded-full
      bg-[#32243B]
      px-6 py-3
      text-sm font-semibold
      text-white
      hover:bg-[#3a2b44]
      transition
    "
                        >
                            {/* Bookmark icon */}
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="h-4 w-4"
                            >
                                <path d="M6 2a2 2 0 0 0-2 2v18l8-5 8 5V4a2 2 0 0 0-2-2H6z" />
                            </svg>

                            Bookmark this course
                        </button>
                    </div>
                </section>

                {/* Stats */}
                <section className="mt-16 flex flex-wrap justify-center gap-20">
                    {[
                        ['Average Marks', course.av_marks],
                        ['Course Total', course.course_total],
                        ['Average Grade', course.av_grade],
                    ].map(([label, value]) => (
                        <div key={label} className="flex items-center gap-6">
                            <div className="text-xl font-semibold">
                                {(label ?? '').split(' ').map(w => (
                                    <p key={w}>{w}</p>
                                ))}
                            </div>
                            <p className="text-7xl font-extrabold">{value ?? '-'}</p>
                        </div>
                    ))}

                    {/* Handout */}
                    <div className="flex items-center gap-6">
                        <div className="text-xl font-semibold">
                            <p>Course</p>
                            <p>Handout</p>
                        </div>

                        {course.course_handout ? (
                            <a href={course.course_handout} target="_blank">
                                <Image
                                    src="/icons/pdf.svg"
                                    alt="Course handout"
                                    width={56}
                                    height={56}
                                />
                            </a>
                        ) : (
                            <span className="text-7xl font-extrabold">-</span>
                        )}
                    </div>
                </section>

                {/* Reviews */}
                <section className="mt-20">
                    {reviews.length === 0 && (
                        <p className="text-gray-400">No reviews yet.</p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {reviews.map((review, idx) => (
                            <div
                                key={idx}
                                className="bg-[#f7f6eb] text-black rounded-3xl p-8 flex flex-col justify-between"
                            >
                                {/* TOP CONTENT */}
                                <div>
                                    <h4 className="text-[#6C2397] text-2xl font-bold mb-4">
                                        review #{idx + 1}
                                    </h4>

                                    <p className="font-semibold">
                                        Taken in: {review.taken_in ?? '-'}
                                    </p>

                                    <p className="font-semibold">
                                        Grade received: {review.your_grade ?? '-'}
                                    </p>

                                    <p className="font-semibold mb-4">
                                        Marks: {review.av_plus ?? '-'}
                                    </p>

                                    <p className="text-sm mb-4">
                                        “{getPreviewText(review)}”
                                    </p>
                                </div>

                                {/* BOTTOM-RIGHT ACTION */}
                                <div className="flex justify-end">
                                    <button
                                        onClick={() =>
                                            setSelectedReview({ review, index: idx })
                                        }
                                        className="font-semibold hover:underline"
                                    >
                                        click to see more →
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            {/* Modal */}
            {selectedReview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <div
                        className="absolute inset-0 bg-black/60"
                        onClick={() => setSelectedReview(null)}
                    />

                    <div className="relative bg-[#f7f6eb] text-black rounded-3xl p-8 max-w-3xl w-full">
                        <h2 className="text-3xl font-bold mb-6 text-[#6C2397]">
                            Detailed review #{selectedReview.index + 1}
                        </h2>

                        <div className="space-y-3 text-sm">
                            {(Object.keys(reviewFieldLabels) as (keyof Review)[]).map(key => {
                                const value = selectedReview.review[key]
                                if (!value || !value.trim()) return null

                                return (
                                    <p key={key}>
                                        <span className="font-semibold">
                                            {reviewFieldLabels[key]}:
                                        </span>{' '}
                                        {value}
                                    </p>
                                )
                            })}
                        </div>

                        <button
                            onClick={() => setSelectedReview(null)}
                            className="mt-6 rounded-full bg-[#6C2397] px-6 py-2 text-white"
                        >
                            ← Back
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}