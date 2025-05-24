'use client'
import { useState } from 'react'
import StarRating from './starrating'

interface ReviewFormProps {
  idPesanan: number
  userEmail: string
  initialComment?: string
  initialRating?: number
  isUpdate?: boolean
  onSuccess?: () => void
  onCancel?: () => void
}

export default function ReviewForm({
  idPesanan,
  userEmail,
  initialComment = '',
  initialRating = 0,
  isUpdate = false,
  onSuccess,
  onCancel
}: ReviewFormProps) {
  const [ulasan, setUlasan] = useState(initialComment)
  const [rating, setRating] = useState(initialRating)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!ulasan.trim()) {
      setError('Ulasan tidak boleh kosong')
      return
    }
    
    if (rating < 1) {
      setError('Harap berikan rating')
      return
    }
    
    setError('')
    setIsSubmitting(true)
    
    try {
      const endpoint = isUpdate 
        ? `/api/report/update/${idPesanan}`
        : `/api/report/create/${idPesanan}`
      
      const method = isUpdate ? 'PUT' : 'POST'
      
      const payload = {
        ulasan,
        rating,
        emailPengguna: userEmail
      }
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        credentials: 'include'
      })
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }
      
      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      setError('Gagal mengirim ulasan. Silakan coba lagi.')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">
        {isUpdate ? 'Edit Ulasan' : 'Berikan Ulasan'}
      </h3>
      
      {error && (
        <div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-3" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rating
        </label>
        <StarRating 
          initialRating={rating} 
          onChange={setRating}
          size="lg" 
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="ulasan" className="block text-sm font-medium text-gray-700 mb-2">
          Ulasan
        </label>
        <textarea
          id="ulasan"
          value={ulasan}
          onChange={(e) => setUlasan(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={4}
          placeholder="Bagaimana pengalaman layanan yang Anda terima?"
          required
        />
      </div>
      
      <div className="flex justify-end space-x-3">
        {onCancel && (
          <button 
            type="button" 
            onClick={onCancel}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Batal
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-70"
        >
          {isSubmitting ? 'Mengirim...' : isUpdate ? 'Simpan Perubahan' : 'Kirim Ulasan'}
        </button>
      </div>
    </form>
  )
}