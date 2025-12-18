import { Suspense } from 'react'
import BookmarksClient from './BookmarksClient'

export default function BookmarksPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading…
      </div>
    }>
      <BookmarksClient />
    </Suspense>
  )
}