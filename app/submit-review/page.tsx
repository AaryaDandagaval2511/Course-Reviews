import { Suspense } from 'react'
import SubmitReviewClient from './SubmitReviewClient'

export default function SubmitReviewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          Loading…
        </div>
      }
    >
      <SubmitReviewClient />
    </Suspense>
  )
}