'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')

    if (!user || !user.role) {
      router.replace('/home')
    } else if (user.role === 'teknisi') {
      router.replace('/teknisi')
    } else if (user.role === 'user') {
      router.replace('/dashboard')
    } else {
      router.replace('/home')
    }

    // selesai logic redirect
    setLoading(false)
  }, [])

  if (loading) return <p>Loading...</p>
  return null
}
