'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

type MyReview = {
    review_id: string
    course_code: string
    course_name: string
    taken_in: string | null
    your_grade: string | null
    av_plus: string | null
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

const emptyForm = {
    taken_in: '',
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
}

export default function ProfilePage() {
    const [myReviews, setMyReviews] = useState<MyReview[]>([])
    const [loading, setLoading] = useState(true)
    const [editingReview, setEditingReview] = useState<MyReview | null>(null)
    const [editForm, setEditForm] = useState({ ...emptyForm })

    const router = useRouter()

    /* ---------------- LOG OUT ---------------- */
    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.replace('/')
    }

    /* ---------------- FETCH USER REVIEWS ---------------- */
    const loadMyReviews = async () => {
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            router.replace('/')
            return
        }

        const { data } = await supabase
            .from('reviews')
            .select(`
        review_id,
        course_code,
        course_name,
        taken_in,
        your_grade,
        av_plus,
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
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        setMyReviews(data || [])
        setLoading(false)
    }

    useEffect(() => {
        loadMyReviews()
    }, [])

    /* ---------------- DELETE REVIEW ---------------- */
    const handleDelete = async (review_id: string) => {
        if (!confirm('Delete this review permanently?')) return
        await supabase.from('reviews').delete().eq('review_id', review_id)
        setMyReviews(prev => prev.filter(r => r.review_id !== review_id))
    }

    /* ---------------- EDIT REVIEW ---------------- */
    const openEditModal = (review: MyReview) => {
        setEditingReview(review)
        setEditForm({
            taken_in: review.taken_in ?? '',
            your_grade: review.your_grade ?? '',
            av_plus: review.av_plus ?? '',
            gr_comm: review.gr_comm ?? '',
            evals: review.evals ?? '',
            open_book: review.open_book ?? '',
            attendance: review.attendance ?? '',
            slides: review.slides ?? '',
            pr_no: review.pr_no ?? '',
            rec: review.rec ?? '',
            not_rec: review.not_rec ?? '',
            advice: review.advice ?? '',
            comments: review.comments ?? '',
        })
    }

    const handleEditSave = async () => {
        if (!editingReview) return

        await supabase
            .from('reviews')
            .update(editForm)
            .eq('review_id', editingReview.review_id)

        setEditingReview(null)
        await loadMyReviews()
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                Loading…
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black text-white font-sans">
            {/* Top bar */}
            <header className="flex items-center justify-between bg-[#3b2947] px-8 py-3">
                <span className="text-xl font-bold">BITS Course Reviews</span>

                <nav className="flex items-center gap-8">
                    <Link href="/home" className="font-bold hover:underline">
                        Browse
                    </Link>

                    <Link
                        href="/submit-review?from=profile"
                        className="text-base font-bold hover:underline"
                    >
                        Submit a review
                    </Link>

                    <Link href="/bookmarks?from=profile"
                    className="text-base font-bold hover:underline"
                    >
                        Bookmarks
                    </Link>

                    <button onClick={handleLogout} className="font-bold hover:underline">
                        Log out
                    </button>
                </nav>
            </header>

            <main className="px-12 py-14">
                <h1 className="text-5xl font-extrabold mb-12 text-center">
                    My Reviews
                </h1>

                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
                    {myReviews.map(review => (
                        <article
                            key={review.review_id}
                            className="h-56 rounded-3xl bg-[#f7f6eb] text-black p-7 shadow-xl flex flex-col justify-between"
                        >
                            <div>
                                <p className="text-sm font-semibold text-gray-600">
                                    {review.course_code}
                                </p>
                                <p className="mt-1 text-xl font-bold">
                                    {review.course_name}
                                </p>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-3xl font-extrabold text-[#6C2397]">
                                    {review.your_grade ?? '-'}
                                </span>

                                <div className="flex gap-3 text-sm font-semibold">
                                    <button
                                        onClick={() => openEditModal(review)}
                                        className="hover:underline"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(review.review_id)}
                                        className="text-red-600 hover:underline"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </article>
                    ))}
                </section>
            </main>

            {/* ---------------- EDIT MODAL ---------------- */}
            {editingReview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <div
                        className="absolute inset-0 bg-black/60"
                        onClick={() => setEditingReview(null)}
                    />

                    <div className="relative z-50 w-full max-w-3xl max-h-[80vh] overflow-y-auto bg-[#f7f6eb] text-black rounded-3xl p-8 shadow-2xl">
                        <h2 className="text-3xl font-bold text-[#6C2397] mb-6">
                            Edit Review
                        </h2>

                        <div className="space-y-5 text-sm">
                            {/* Taken in */}
                            <label className="block">
                                <span className="font-semibold">Taken in</span>
                                <input
                                    value={editForm.taken_in}
                                    onChange={e =>
                                        setEditForm({ ...editForm, taken_in: e.target.value })
                                    }
                                    placeholder="e.g., 2024-25 Sem 1"
                                    className="mt-1 w-full rounded-md border px-3 py-2"
                                />
                            </label>

                            {/* Grade */}
                            <label className="block">
                                <span className="font-semibold">Grade received</span>
                                <input
                                    value={editForm.your_grade}
                                    onChange={e =>
                                        setEditForm({ ...editForm, your_grade: e.target.value })
                                    }
                                    className="mt-1 w-full rounded-md border px-3 py-2"
                                />
                            </label>

                            {/* Marks */}
                            <label className="block">
                                <span className="font-semibold">Total marks received</span>
                                <input
                                    value={editForm.av_plus}
                                    onChange={e =>
                                        setEditForm({ ...editForm, av_plus: e.target.value })
                                    }
                                    className="mt-1 w-full rounded-md border px-3 py-2"
                                />
                            </label>

                            {/* Remaining fields */}
                            {(
                                [
                                    'gr_comm',
                                    'evals',
                                    'open_book',
                                    'attendance',
                                    'slides',
                                    'pr_no',
                                    'rec',
                                    'not_rec',
                                    'advice',
                                    'comments',
                                ] as const
                            ).map(key => (
                                <label key={key} className="block">
                                    <span className="font-semibold">
                                        {key.replaceAll('_', ' ')}
                                    </span>
                                    <textarea
                                        value={editForm[key]}
                                        onChange={e =>
                                            setEditForm({ ...editForm, [key]: e.target.value })
                                        }
                                        className="mt-1 w-full rounded-md border px-3 py-2"
                                    />
                                </label>
                            ))}
                        </div>

                        <div className="mt-6 flex justify-end gap-4">
                            <button
                                onClick={() => setEditingReview(null)}
                                className="font-semibold"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleEditSave}
                                className="rounded-full bg-[#6C2397] px-6 py-2 text-white font-semibold"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}