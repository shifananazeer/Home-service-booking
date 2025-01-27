import type React from "react"
import { useState } from "react"
import { X, Star } from "lucide-react"

interface RatingModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (rating: number, review: string) => void
  bookingId: string
}

const RatingModal: React.FC<RatingModalProps> = ({ isOpen, onClose, onSubmit, bookingId }) => {
  const [rating, setRating] = useState<number>(0)
  const [review, setReview] = useState<string>("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(rating, review)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Add Rating and Review</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`mr-1 ${rating >= star ? "text-yellow-400" : "text-gray-300"}`}
                >
                  <Star size={24} fill={rating >= star ? "currentColor" : "none"} />
                </button>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label htmlFor="review" className="block text-sm font-medium text-gray-700 mb-2">
              Review
            </label>
            <textarea
              id="review"
              rows={4}
              className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-blue-500"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              maxLength={500}
            ></textarea>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Submit Rating
          </button>
        </form>
      </div>
    </div>
  )
}

export default RatingModal

