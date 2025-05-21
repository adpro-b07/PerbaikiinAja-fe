'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import NavbarLogin from '@/components/ui/navbar/navbar-login'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function Register() {
  const [namaLengkap, setNamaLengkap] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [noTelp, setNoTelp] = useState('')
  const [alamat, setAlamat] = useState('')
  const role = "pengguna"
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    // Validate form
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }
    
    try {
      const response = await fetch('/api/user/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          namaLengkap, 
          email, 
          password, 
          noTelp, 
          alamat, 
          role: role.toUpperCase() 
        }),
      })
      
      if (response.ok) {
        // Registration successful
        alert('Registration successful! Please login.')
        router.push('/login')
      } else {
        // Handle registration error
        const data = await response.json()
        setError(data.message || 'Registration failed. Please try again.')
      }
    } catch (error) {
      console.error('Registration failed:', error)
      setError('Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Navbar */}
      <NavbarLogin />

      {/* Register Form */}
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] py-10">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-[#10316B]">Create an Account</h1>
            <p className="mt-2 text-gray-500">Join PerbaikiinAja and get your devices repaired</p>
          </div>

          {error && (
            <div className="p-3 text-sm text-white bg-red-500 rounded">
              {error}
            </div>
          )}

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="namaLengkap">Full Name</Label>
                <Input
                  id="namaLengkap"
                  type="text"
                  placeholder="John Doe"
                  value={namaLengkap}
                  onChange={(e) => setNamaLengkap(e.target.value)}
                  required
                />
              </div>
              
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
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="noTelp">Phone Number</Label>
                <Input
                  id="noTelp"
                  type="tel"
                  placeholder="08123456789"
                  value={noTelp}
                  onChange={(e) => setNoTelp(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="alamat">Address</Label>
                <Input
                  id="alamat"
                  type="text"
                  placeholder="Your address"
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#10316B] hover:bg-[#0B409C] text-white"
              disabled={isLoading}
            >
              {isLoading ? 'Registering...' : 'Register'}
            </Button>

            <div className="text-center text-sm">
              Already have an account?{' '}
              <Link href="/login" className="text-[#0B409C] hover:underline font-medium">
                Log in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}