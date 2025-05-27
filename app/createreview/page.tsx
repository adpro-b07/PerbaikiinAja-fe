'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import NavbarUSer from '@/components/ui/navbar/navbar-user'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Star } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'

// Loading 
function LoadingView() {
  return (
    <>
      <NavbarUSer />
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#10316B]"></div>
      </div>
    </>
  )
}

// Main 
function CreateReviewContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [pesananData, setPesananData] = useState<any>(null)
  const [rating, setRating] = useState(0)
  const [ulasan, setUlasan] = useState('')
  const [userData, setUserData] = useState<any>(null)
  
  const idPesanan = searchParams.get('id')
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Get user data
        const user = JSON.parse(localStorage.getItem("user") || "null")
        
        if (!user?.email) {
          router.replace('/login')
          return
        }
        
        setUserData(user)
        
        // 2. Check if pesanan ID exists and belongs to the user
        if (!idPesanan) {
          setError('ID Pesanan tidak ditemukan')
          setLoading(false)
          return
        }
        
        // 3. Fetch pesanan details
        const pesananRes = await fetch(`/api/pesanan/get/${idPesanan}`, {
          credentials: 'include'
        })
        
        if (!pesananRes.ok) {
          setError('Pesanan tidak ditemukan')
          setLoading(false)
          return
        }
        
        const pesanan = await pesananRes.json()
        
        // 4. Check if the pesanan belongs to the user
        if (pesanan.emailPengguna !== user.email) {
          setError('Anda tidak memiliki akses ke pesanan ini')
          setLoading(false)
          return
        }
        
        // 5. Check if pesanan is completed
        if (pesanan.statusPesanan !== 'Pesanan Selesai') {
          setError('Hanya pesanan yang sudah selesai yang dapat direview')
          setLoading(false)
          return
        }
        
        // 6. Check if review already exists
        const reportRes = await fetch(`/api/report/get/${idPesanan}`, {
          credentials: 'include'
        })
        
        if (reportRes.ok) {
          setError('Pesanan ini sudah memiliki review')
          setLoading(false)
          return
        }
        
        setPesananData(pesanan)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching data:', error)
        setError('Terjadi kesalahan saat memuat data')
        setLoading(false)
      }
    }
    
    fetchData()
  }, [idPesanan, router])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (rating === 0) {
      setError('Silakan berikan rating')
      return
    }
    
    if (ulasan.trim() === '') {
      setError('Silakan tulis ulasan')
      return
    }
    
    setSubmitting(true)
    setError('')
    
    try {
      
      const response = await fetch(`/api/report/create/${idPesanan}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ulasan,
          rating: rating.toString(),
          emailPengguna: userData.email
        }),
        credentials: 'include'
      })
      
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }
      
      setSuccess(true)
      
      // Redirect after successful submission
      setTimeout(() => {
         router.push('/review')
      }, 2000)
    } catch (error) {
      console.error('Error submitting review:', error)
      setError('Gagal mengirim ulasan. Silakan coba lagi.')
    } finally {
      setSubmitting(false)
    }
  }
  
  if (loading) {
    return (
      <>
        <NavbarUSer />
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#10316B]"></div>
        </div>
      </>
    )
  }
  
  return (
    <>
      <NavbarUSer />
      <main className="min-h-screen bg-white py-8">
        <div className="container max-w-2xl mx-auto px-4">
          <h1 className="text-2xl font-bold text-[#10316B] mb-6">Beri Ulasan</h1>
          
          {error && (
            <Card className="mb-6 bg-red-50 border-red-200">
              <div className="p-4 text-red-700">
                {error}
              </div>
            </Card>
          )}
          
          {success ? (
            <Card className="p-6 bg-green-50 border-green-200">
              <div className="text-center">
                <div className="text-green-600 text-lg font-medium mb-2">
                  Ulasan berhasil dikirim!
                </div>
                <p className="text-green-700">Terima kasih atas feedback Anda.</p>
                <Button 
                  className="mt-4 bg-[#10316B] hover:bg-[#0B409C]"
                  onClick={() => router.push('/review')}
                >
                  Lihat Semua Ulasan
                </Button>
              </div>
            </Card>
          ) : pesananData && (
            <Card className="p-6">
              <div className="mb-6">
                <h2 className="text-lg font-medium text-[#10316B]">Detail Pesanan</h2>
                <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                  <div className="text-gray-500">ID Pesanan:</div>
                  <div>{pesananData.id}</div>
                  <div className="text-gray-500">Barang:</div>
                  <div>{pesananData.namaBarang}</div>
                  <div className="text-gray-500">Kondisi:</div>
                  <div>{pesananData.kondisiBarang}</div>
                  <div className="text-gray-500">Status:</div>
                  <div>{pesananData.statusPesanan}</div>
                </div>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rating
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setRating(value)}
                        className="focus:outline-none"
                      >
                        <Star 
                          className={`h-8 w-8 ${
                            value <= rating 
                              ? "text-yellow-400 fill-yellow-400" 
                              : "text-gray-300"
                          }`} 
                        />
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ulasan
                  </label>
                  <Textarea
                    placeholder="Tulis ulasan Anda di sini..."
                    className="w-full min-h-[120px]"
                    value={ulasan}
                    onChange={(e) => setUlasan(e.target.value)}
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-[#10316B] text-[#10316B]"
                    onClick={() => router.back()}
                    disabled={submitting}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    className="bg-[#10316B] hover:bg-[#0B409C]"
                    disabled={submitting}
                  >
                    {submitting ? "Mengirim..." : "Kirim Ulasan"}
                  </Button>
                </div>
              </form>
            </Card>
          )}
        </div>
      </main>
    </>
  )
}

// Export 
// Wrapping
export default function CreateReviewPage() {
  return (
    <Suspense fallback={<LoadingView />}>
      <CreateReviewContent />
    </Suspense>
  )
}