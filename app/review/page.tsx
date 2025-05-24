'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import ReviewForm from '@/components/ui/reviewform'
import ReviewList from '@/components/ui/reviewlist'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Star } from 'lucide-react'
import NavbarUSer from '@/components/ui/navbar/navbar-user'

export default function ReviewPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [initialReview, setInitialReview] = useState<any>(null)
  const idPesanan = searchParams.get('id')
  const mode = searchParams.get('mode') || 'create'
  
  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}')
      if (!userData || !userData.email) {
        router.replace('/login')
        return
      }
      
      setUser(userData)
    } catch (err) {
      console.error(err)
      router.replace('/login')
    } finally {
      setLoading(false)
    }
  }, [router])
  
  useEffect(() => {
  // Fetch existing review data when in edit mode
  const fetchReviewData = async () => {
    if (idPesanan && mode === 'edit') {
      try {
        const res = await fetch(`/api/report/get/${idPesanan}`, {
          credentials: 'include'
        });
        
        if (res.ok) {
          const data = await res.json();
          setInitialReview({
            ulasan: data.ulasan || '',
            rating: data.rating || 0
          });
        }
      } catch (err) {
        console.error('Failed to fetch review data:', err);
      }
    }
  };

  if (user?.email) {
    fetchReviewData();
  }
}, [idPesanan, mode, user]);

  if (loading) {
    return (
      <>
        <NavbarUSer />
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-500">Memuat...</p>
        </div>
      </>
    )
  }
  
  return (
    <>
      <NavbarUSer />
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="flex items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold flex items-center">
              Ulasan Layanan
              <Star className="ml-2 h-5 w-5 text-yellow-400 fill-yellow-400" />
            </h1>
            <p className="text-sm text-muted-foreground">
              {idPesanan ? (mode === 'edit' ? 'Edit ulasan Anda' : 'Berikan ulasan untuk layanan') : 'Lihat riwayat ulasan Anda'}
            </p>
          </div>
        </div>
        
        {idPesanan ? (
          <Card>
            <CardHeader className="pb-3">
              <h2 className="text-lg font-medium">
                {mode === 'edit' ? 'Edit Ulasan' : 'Berikan Ulasan'} untuk Pesanan #{idPesanan}
              </h2>
            </CardHeader>
            <CardContent>
              <ReviewForm 
                idPesanan={parseInt(idPesanan)}
                userEmail={user.email}
                isUpdate={mode === 'edit'}
                onSuccess={() => {
                  router.push('/order')
                }}
                onCancel={() => router.back()}
              />
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-medium">Riwayat Ulasan Anda</h2>
              <Link href="/order"> 
                <Button variant="outline" size="sm">
                  Lihat Pesanan Anda
                </Button>
              </Link>
            </div>
            
            <ReviewList 
              userEmail={user.email}
              onEditReview={(report) => {
                router.push(`/review?id=${report.pesanan.id}&mode=edit`)
              }}
            />
          </>
        )}
      </div>
    </>
  )
}