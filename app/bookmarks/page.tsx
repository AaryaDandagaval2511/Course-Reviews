'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

type Course = {
  course_code: string
  course_name: string
  prof: string | null
  nickname: string | null
  course_dept: string | null
}

export default function BookmarksPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  const router = useRouter()
  const searchParams = useSearchParams()

  const from = searchParams.get('from')              // home | profile | course
  const fromCourseCode = searchParams.get('course_code')

  /* ---------------- LOG OUT ---------------- */
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.replace('/')
  }

  /* ---------------- REMOVE BOOKMARK ---------------- */
  const handleRemoveBookmark = async (
    e: React.MouseEvent,
    course_code: string
  ) => {
    e.preventDefault()
    e.stopPropagation()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    await supabase
      .from('bookmarks')
      .delete()
      .eq('user_id', user.id)
      .eq('course_code', course_code)

    // Update UI immediately
    setCourses(prev =>
      prev.filter(c => c.course_code !== course_code)
    )
  }

  /* ---------------- LOAD BOOKMARKS ---------------- */
  useEffect(() => {
    const loadBookmarks = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.replace('/')
        return
      }

      const { data, error } = await supabase
        .from('bookmarks')
        .select(`
          courses (
            course_code,
            course_name,
            prof,
            nickname,
            course_dept
          )
        `)
        .eq('user_id', user.id)

      if (!error && data) {
        setCourses(data.flatMap(b => b.courses))
      }

      setLoading(false)
    }

    loadBookmarks()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading…
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* ---------------- TOP BAR ---------------- */}
      <header className="flex items-center justify-between bg-[#3b2947] px-8 py-3">
        <span className="text-xl font-bold">BITS Course Reviews</span>

        {/* 🔙 Context-aware back navigation */}
        <nav className="flex items-center gap-8 text-white">
          {from === 'course' && fromCourseCode ? (
            <Link
              href={`/course/${encodeURIComponent(fromCourseCode)}`}
              className="font-bold hover:underline"
            >
              ← Back to Reviews
            </Link>
          ) : from === 'profile' ? (
            <Link href="/profile" className="font-bold hover:underline">
              ← Back to Profile
            </Link>
          ) : (
            <Link href="/home" className="font-bold hover:underline">
              ← Back to Home
            </Link>
          )}

          <button onClick={handleLogout} className="font-bold hover:underline">
            Log out
          </button>
        </nav>
      </header>

      {/* ---------------- MAIN ---------------- */}
      <main className="px-12 py-14">
        <h1 className="text-5xl font-extrabold mb-12 text-center">
          Bookmarked Courses
        </h1>

        {courses.length === 0 && (
          <p className="text-center text-gray-400 text-lg">
            You haven’t bookmarked any courses yet.
          </p>
        )}

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {courses.map(course => (
            <Link
              key={course.course_code}
              href={`/course/${encodeURIComponent(course.course_code)}`}
            >
              <article className="h-56 rounded-3xl bg-[#f7f6eb] text-black p-7 shadow-xl flex flex-col justify-between cursor-pointer hover:-translate-y-1 transition">
                {/* TOP */}
                <div>
                  <p className="text-lg font-semibold">
                    {course.course_code}
                  </p>
                  <p className="mt-1 text-xl font-bold">
                    {course.course_name}
                  </p>

                  {course.prof && (
                    <p className="mt-2 text-sm font-semibold">
                      by {course.prof}
                    </p>
                  )}
                </div>

                {/* BOTTOM ACTION */}
                <div className="flex justify-end">
                  <button
                    onClick={e =>
                      handleRemoveBookmark(e, course.course_code)
                    }
                    className="text-xs font-semibold text-red-600 hover:underline"
                  >
                    Remove bookmark
                  </button>
                </div>
              </article>
            </Link>
          ))}
        </section>
      </main>
    </div>
  )
}