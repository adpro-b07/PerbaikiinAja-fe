'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import NavbarLogin from '@/components/ui/navbar/navbar-login'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      })
      
      if (response.ok) {
        const userData = await response.json()
        
        // Simpan beberapa info user untuk UI - ini optional
        // Karena status autentikasi sebenarnya akan dicek via session
        localStorage.setItem('user', JSON.stringify({
          email: userData.email,
          namaLengkap: userData.namaLengkap,
          role: userData.role,
        }))
        
        // Redirect berdasarkan role
        if (userData.role?.toLowerCase() === 'teknisi') {
          router.push('/teknisi')
        } else if (userData.role?.toLowerCase() === 'pengguna') {
          router.push('/dashboard')
        } else {
          router.push('/admin')
        }
      } else {
        alert('Invalid credentials')
      }
    } catch (error) {
      console.error('Login failed:', error)
      alert('Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Navbar */}
      <NavbarLogin />

      {/* Login Form */}
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-[#10316B]">Login to PerbaikiinAja</h1>
            <p className="mt-2 text-gray-500">Enter your credentials to access your account</p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="remember" />
                <label
                  htmlFor="remember"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Remember me
                </label>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#10316B] hover:bg-[#0B409C] text-white"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Log in'}
            </Button>

            <div className="text-center text-sm">
              Don't have an account?{' '}
              <Link href="/register" className="text-[#0B409C] hover:underline font-medium">
                Sign up
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}