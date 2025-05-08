'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')

    if (!user || !user.role) {
      router.replace('/home') 
    } else if (user.role === 'teknisi') {
      router.replace('/teknisi')
    } else if (user.role === 'user') {
      router.replace('/user')
    } else {
      router.replace('/home') // Default fallback
    }
  }, [])

  return null 
}
