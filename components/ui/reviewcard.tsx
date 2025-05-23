import StarRating from './starrating'

interface ReviewCardProps {
  pesananId: number
  ulasan: string
  rating: number
  emailPengguna: string
  createdAt?: string
  onEdit?: () => void
  canEdit?: boolean
}

export default function ReviewCard({
  pesananId,
  ulasan,
  rating,
  emailPengguna,
  createdAt,
  onEdit,
  canEdit = false
}: ReviewCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-5 mb-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-semibold text-gray-800">Pesanan #{pesananId}</h4>
          <p className="text-sm text-gray-600">{emailPengguna}</p>
          {createdAt && (
            <p className="text-xs text-gray-500 mt-1">
              {new Date(createdAt).toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          )}
        </div>
        
        <StarRating initialRating={rating} readOnly size="sm" />
      </div>
      
      <p className="text-gray-700 my-3">{ulasan}</p>
      
      {canEdit && onEdit && (
        <button
          onClick={onEdit}
          className="text-sm text-blue-600 hover:text-blue-800 mt-2 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-10 10a2 2 0 01-1.414.586H4V15a2 2 0 01-.586-1.414l10-10z" />
          </svg>
          Edit Ulasan
        </button>
      )}
    </div>
  )
}