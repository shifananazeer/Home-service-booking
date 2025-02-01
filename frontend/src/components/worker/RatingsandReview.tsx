import React from "react";

interface Review {
  userId: { _id: string; firstName: string; lastName: string };
  review: string;
  bookingId: string;
  userName: string; 
}

interface WorkerRatingsAndReviewsProps {
  ratings: number[];
  reviews: Review[];
}

const StarIcon: React.FC<{ filled: boolean }> = ({ filled }) => (
  <svg
    className={`w-5 h-5 ${filled ? "text-yellow-400" : "text-gray-300"}`}
    fill="currentColor"
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const WorkerRatingsAndReviews: React.FC<WorkerRatingsAndReviewsProps> = ({
  ratings,
  reviews,
}) => {
  const averageRating =
    ratings.length > 0
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length
      : 0;
  const [visibleReviews, setVisibleReviews] = React.useState(3); 

 
  const handleSeeMore = () => {
    setVisibleReviews((prev) => prev + 3); 
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Ratings & Reviews</h2>

      {/* Average Rating */}
      <div className="flex items-center mb-6">
        <div
          className="flex items-center"
          aria-label={`Average rating: ${averageRating.toFixed(1)} out of 5 stars`}
        >
          {[1, 2, 3, 4, 5].map((star) => (
            <StarIcon key={star} filled={star <= Math.round(averageRating)} />
          ))}
        </div>
        <span className="ml-2 text-lg font-semibold">
          {averageRating.toFixed(1)}
        </span>
        <span className="ml-2 text-sm text-gray-500">
          ({ratings.length} ratings)
        </span>
      </div>

      {/* Reviews */}
      <div className="space-y-4">
        {reviews.slice(0, visibleReviews).map((review, index) => (
          <div
            key={index}
            className="border-b border-gray-200 pb-4 last:border-b-0"
          >
            <div className="flex items-center mb-2">
              <div className="bg-gray-100 rounded-full p-2">
                <svg
                  className="h-4 w-4 text-gray-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span className="ml-2 font-semibold text-sm">
                {review.userName || `User ${review.userId._id.substr(-4)}`}
              </span>
            </div>
            <p className="text-gray-600">{review.review}</p>
            <div className="mt-2 text-xs text-gray-400">
              Booking ID: {review.bookingId.substr(-6)}
            </div>
          </div>
        ))}
      </div>

      {visibleReviews < reviews.length && (
        <button
          onClick={handleSeeMore}
          className="text-blue-500 hover:underline mt-4"
        >
          See More
        </button>
      )}

      {reviews.length === 0 && (
        <p className="text-gray-500 italic">No reviews yet.</p>
      )}
    </div>
  );
};

export default WorkerRatingsAndReviews;



