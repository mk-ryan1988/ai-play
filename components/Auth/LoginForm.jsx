'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

export default function LoginForm() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [email, setEmail] = useState('')
  const [error, setError] = useState(null)
  const [password, setPassword] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      return
    }

    router.replace('/')
    router.refresh()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full space-y-4"
    >
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="form-input"
          required
        />
      </div>

      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="form-input"
          required
        />
      </div>

      {error && <div className="error">{error}</div>}

      <button
        type="submit"
        className="w-full relative overflow-hidden bg-gradient-to-r from-lime-500 via-lime-600 to-lime-700
          text-white p-3 rounded-lg font-medium
          transform transition-all duration-200
          hover:scale-[1.02] hover:shadow-[0_0_20px_theme(colors.lime.500/50)]
          active:scale-[0.98]
          before:absolute before:inset-0
          before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent
          before:translate-x-[-200%] before:transition-transform before:duration-[0.7s]
          hover:before:translate-x-[200%]
          disabled:opacity-70 disabled:cursor-not-allowed
          disabled:hover:scale-100 disabled:hover:shadow-none"
      >
        Sign In
      </button>
    </form>
  )
}
