'use client'

import { supabase } from '@/lib/supabaseClient'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LandingPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  /* ---------------- ENFORCE BITS EMAIL ---------------- */
  useEffect(() => {
    const enforceBitsEmail = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user?.email) return

      if (!user.email.endsWith('@goa.bits-pilani.ac.in')) {
        alert('Only goa.bits-pilani.ac.in emails are allowed.')
        await supabase.auth.signOut()
        router.replace('/')
      }
    }

    enforceBitsEmail()
  }, [router])

  /* ---------------- LOGIN ---------------- */
  const handleLogin = async () => {
    setLoading(true)

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/home`,
        queryParams: {
          hd: 'goa.bits-pilani.ac.in',
          prompt: 'select_account',
        },
      },
    })

    if (error) {
      alert(error.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 font-sans text-white">
      {/* Card */}
      <div className="w-full max-w-md rounded-3xl bg-[#0f0f13] border border-[#2a2a35] p-10 shadow-2xl">
        {/* Title */}
        <h1 className="text-3xl font-extrabold text-center mb-6">
          BITS Course Reviews
        </h1>

        {/* Get Started */}
        <h2 className="text-xl font-bold mb-2">Get Started</h2>
        <p className="text-sm text-gray-400 mb-8">
          Sign in with your BITS email to continue
        </p>

        {/* Google Login */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="
            w-full
            rounded-full
            bg-[#32243B]
            px-8 py-4
            text-white
            font-semibold
            hover:bg-[#3a2b44]
            disabled:opacity-60
            transition
            border-none
            outline-none
            focus:outline-none
          "
        >
          {loading ? 'Redirecting…' : 'Log in with Google'}
        </button>

        {/* Divider */}
        <div className="my-10 h-px bg-[#2a2a35]" />
      </div>
    </div>
  )
}