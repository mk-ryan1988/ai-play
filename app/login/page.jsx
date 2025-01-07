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
        console.log('Initial session check:', session) // Debug log

        if (error) {
          console.error('Error checking session:', error.message)
          return
        }

        if (session) {
          console.log('Valid session found, redirecting...') // Debug log
          router.replace('/')
          router.refresh()
        }
      } catch (err) {
        console.error('Session check failed:', err)
      }
    }

    checkSession()

    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session) // Debug log

      if (session) {
        // Verify the session is properly set
        const verifySession = await supabase.auth.getSession()
        console.log('Verified session:', verifySession) // Debug log

        router.replace('/')
        router.refresh()
      }
    })

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
