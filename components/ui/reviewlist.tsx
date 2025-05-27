'use client'
import { useState, useEffect } from 'react'
import ReviewCard from './reviewcard'

interface Report {
  id: number
  pesanan: {
    id: number
    emailPengguna: string
  }
  ulasan: string
  rating: number
  createdAt: string
}

interface ReviewListProps {
  userEmail?: string
  teknisiEmail?: string
  onEditReview?: (report: Report) => void
  reviewData?: Report[] // pre-fetched reviews
}

export default function ReviewList({ 
  userEmail,
  teknisiEmail,
  onEditReview,
  reviewData 
}: ReviewListProps) {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  useEffect(() => {
    // use data
    if (reviewData !== undefined) {
      console.log('Using provided review data:', reviewData);
      setReports(reviewData);
      setLoading(false);
      return;
    }
    
    // fetch data from API
    const fetchReports = async () => {
      try {
        let endpoint = '/api/report'
        
        if (userEmail) {
          endpoint = `/api/report/pengguna/${encodeURIComponent(userEmail)}`
        } else if (teknisiEmail) {
          endpoint = `/api/report/teknisi/${encodeURIComponent(teknisiEmail)}`
        }
        
        console.log('Fetching reviews from API:', endpoint);
        const response = await fetch(endpoint, {
          credentials: 'include' 
        })
        
        if (!response.ok) {
          throw new Error(`Failed to fetch reviews: ${response.status}`)
        }
        
        const data = await response.json()
        const processedData = Array.isArray(data) ? data : [data];
        
        // mock
        const processedReports = processedData.map(report => ({
          ...report,
          pesanan: report.pesanan || {
            id: report.id,
            emailPengguna: userEmail || 'unknown@example.com'
          },
          createdAt: report.createdAt || new Date().toISOString()
        }));
        
        console.log('Processed reports:', processedReports);
        setReports(processedReports)
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError('Gagal memuat ulasan')
      } finally {
        setLoading(false)
      }
    }
    
    if (userEmail || teknisiEmail) {
      fetchReports()
    } else {
      setLoading(false)
    }
  }, [userEmail, teknisiEmail, reviewData])
  
  if (loading) {
    return <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div></div>
  }
  
  if (error) {
    return <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 my-4">{error}</div>
  }
  
  if (reports.length === 0) {
    return <div className="text-center py-8 text-gray-500">Belum ada ulasan</div>
  }
  
  return (
    <div className="space-y-4">
      {reports.map(report => (
        <ReviewCard 
          key={report.id}
          pesananId={report.pesanan.id}
          ulasan={report.ulasan}
          rating={report.rating}
          emailPengguna={report.pesanan.emailPengguna}
          createdAt={report.createdAt}
          canEdit={userEmail === report.pesanan.emailPengguna}
          onEdit={onEditReview ? () => onEditReview(report) : undefined}
        />
      ))}
    </div>
  )
}