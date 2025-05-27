'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import ReviewForm from '@/components/ui/reviewform'
import ReviewList from '@/components/ui/reviewlist'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Star, ClipboardList, ThumbsUp } from 'lucide-react'
import NavbarUSer from '@/components/ui/navbar/navbar-user'
import { toast } from 'sonner'

// Loading 
function LoadingView() {
  return (
    <>
      <NavbarUSer />
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-500">Memuat...</p>
      </div>
    </>
  );
}

// Main 
function ReviewPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [reviewLoading, setReviewLoading] = useState(false)
  const [initialReview, setInitialReview] = useState<any>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [stats, setStats] = useState({ total: 0, averageRating: 0 })
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
      
      // After setting user, fetch all reviews
      if (userData.email) {
        fetchAllUserReviews(userData.email)
      }
    } catch (err) {
      console.error(err)
      router.replace('/login')
    } finally {
      setLoading(false)
    }
  }, [router])
  
  const fetchAllUserReviews = async (email: string) => {
    setReviewLoading(true)
    try {
      console.log('Fetching reviews for:', email);
      
      // Get all reports (ytta)
      const res = await fetch(`/api/report`, {
        credentials: 'include'
      });
      
      if (res.ok) {
        const data = await res.json();
        console.log('API returned data:', data);
        
        // Add mock pesanan for null values
        const processedReviews = (data as any[])
          .map((review: any) => ({
            ...review,
            // Add mock pesanan data if it's null
            pesanan: review.pesanan || {
              id: review.id, 
              emailPengguna: email,
              namaBarang: "Item " + review.id,
              kondisiBarang: "Good",
              statusPesanan: "Pesanan Selesai",
              tanggalServis: new Date().toISOString().split('T')[0]
            },
            createdAt: review.createdAt || new Date().toISOString()
          }));
        
        console.log('Processed reviews:', processedReviews);
        setReviews(processedReviews);
        
        // Calculate stats
        if (processedReviews.length > 0) {
          const totalRating = processedReviews.reduce((sum, review) => sum + review.rating, 0);
          setStats({
            total: processedReviews.length,
            averageRating: parseFloat((totalRating / processedReviews.length).toFixed(1))
          });
        }
        
        // If in edit mode, find the specific review
        if (idPesanan && mode === 'edit') {
          const reviewForPesanan = processedReviews.find(review => 
            review.pesanan && review.pesanan.id === parseInt(idPesanan)
          );
          
          if (reviewForPesanan) {
            setInitialReview({
              ulasan: reviewForPesanan.ulasan || '',
              rating: reviewForPesanan.rating || 0
            });
          }
        }
      } else {
        console.error('API request failed:', res.status);
        toast.error('Failed to fetch reviews');
      }
    } catch (err) {
      console.error('Failed to fetch review data:', err);
      toast.error('Error loading reviews');
    } finally {
      setReviewLoading(false)
    }
  };

  if (loading) {
    return <LoadingView />;
  }
  
  return (
    <>
      <NavbarUSer />
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="flex items-center mb-6 justify-between">
          <div>
            <h1 className="text-2xl font-semibold flex items-center">
              Ulasan Saya
              <Star className="ml-2 h-5 w-5 text-yellow-400 fill-yellow-400" />
            </h1>
            <p className="text-sm text-muted-foreground">
              {idPesanan ? (mode === 'edit' ? 'Edit ulasan Anda' : 'Berikan ulasan untuk layanan') : 'Semua ulasan yang Anda berikan'}
            </p>
          </div>
          
          {!idPesanan && (
            <Link href="/order">
              <Button variant="outline" className="border-[#10316B] text-[#10316B]">
                <ClipboardList className="mr-2 h-4 w-4" />
                Lihat Pesanan
              </Button>
            </Link>
          )}
        </div>
        
        {!idPesanan && !reviewLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card className="bg-[#10316B] text-white">
              <CardContent className="pt-6">
                <h3 className="text-lg font-medium mb-2">Total Ulasan</h3>
                <div className="flex items-center">
                  <ClipboardList className="h-8 w-8 mr-3" />
                  <span className="text-3xl font-bold">{stats.total}</span>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-amber-500 to-yellow-400 text-white">
              <CardContent className="pt-6">
                <h3 className="text-lg font-medium mb-2">Rating Rata-rata</h3>
                <div className="flex items-center">
                  <ThumbsUp className="h-8 w-8 mr-3" />
                  <span className="text-3xl font-bold">{stats.averageRating}</span>
                  <span className="text-xl ml-1">/5</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
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
                initialComment={initialReview?.ulasan}
                initialRating={initialReview?.rating}
                isUpdate={mode === 'edit'}
                onSuccess={() => {
                  toast.success(mode === 'edit' ? 'Ulasan berhasil diperbarui!' : 'Ulasan berhasil ditambahkan!');
                  router.push('/review');
                }}
                onCancel={() => router.back()}
              />
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mb-4">
              <h2 className="text-xl font-medium">Riwayat Ulasan Anda</h2>
              <p className="text-sm text-gray-500 mt-1">
                Semua ulasan yang telah Anda berikan untuk layanan PerbaikiinAja
              </p>
            </div>
            
            {reviewLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#10316B]"></div>
                <p className="ml-3 text-sm text-gray-500">Memuat ulasan...</p>
              </div>
            ) : (
              <ReviewList 
                userEmail={user.email}
                reviewData={reviews}
                onEditReview={(report) => {
                  router.push(`/review?id=${report.pesanan.id}&mode=edit`)
                }}
              />
            )}
          </>
        )}
      </div>
    </>
  );
}

// export
// main component wrapped in Suspense for loading state
export default function ReviewPage() {
  return (
    <Suspense fallback={<LoadingView />}>
      <ReviewPageContent />
    </Suspense>
  );
}