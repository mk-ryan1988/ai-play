/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import LoginForm from '@/components/Auth/LoginForm'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Error checking session:', error.message)
          return
        }

        if (session) {
          router.replace('/')
          router.refresh() // Refresh to ensure all routes update with new session
        }
      } catch (err) {
        console.error('Session check failed:', err)
      }
    }

    // Initial check
    checkSession()

    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        router.replace('/')
        router.refresh()
      }
    })

    // Cleanup subscription
    return () => subscription.unsubscribe()
  }, [router, supabase])

  return (
    <div className="h-full flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold">
            Sign in to your account
          </h2>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
