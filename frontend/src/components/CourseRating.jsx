import PropTypes from "prop-types";

function CourseRating({
  averageRating = 0,
  ratingCount = 0,
  showCount = true,
  size = "sm",
  onClick = null,
  clickable = false,
}) {
  // Round to 1 decimal place
  const rating = Number(averageRating).toFixed(1);

  // Size configurations
  const sizes = {
    xs: { star: "h-3 w-3", text: "text-xs", gap: "gap-0.5" },
    sm: { star: "h-4 w-4", text: "text-sm", gap: "gap-1" },
    md: { star: "h-5 w-5", text: "text-base", gap: "gap-1" },
    lg: { star: "h-6 w-6", text: "text-lg", gap: "gap-1.5" },
  };

  const sizeConfig = sizes[size] || sizes.sm;

  // Generate filled and empty stars
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  const handleClick = (e) => {
    if (onClick && (clickable || ratingCount > 0)) {
      e.stopPropagation();
      onClick();
    }
  };

  const isInteractive = (clickable || ratingCount > 0) && onClick;

  return (
    <div
      className={`flex items-center ${sizeConfig.gap} ${
        isInteractive
          ? "cursor-pointer hover:opacity-75 transition-opacity"
          : ""
      }`}
      onClick={handleClick}
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onKeyDown={
        isInteractive
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleClick(e);
              }
            }
          : undefined
      }
    >
      <div className="flex items-center">
        {/* Full Stars */}
        {[...Array(fullStars)].map((_, i) => (
          <svg
            key={`full-${i}`}
            className={`${sizeConfig.star} text-yellow-400`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        {/* Half Star */}
        {hasHalfStar && (
          <svg
            className={`${sizeConfig.star} text-yellow-400`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <defs>
              <linearGradient id="half-star-gradient">
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="#D1D5DB" />
              </linearGradient>
            </defs>
            <path
              fill="url(#half-star-gradient)"
              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
            />
          </svg>
        )}

        {/* Empty Stars */}
        {[...Array(emptyStars)].map((_, i) => (
          <svg
            key={`empty-${i}`}
            className={`${sizeConfig.star} text-gray-300`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>

      {showCount && (
        <span className={`${sizeConfig.text} text-gray-600 font-medium ml-1`}>
          {rating} {ratingCount > 0 && `(${ratingCount})`}
        </span>
      )}
    </div>
  );
}

CourseRating.propTypes = {
  averageRating: PropTypes.number,
  ratingCount: PropTypes.number,
  showCount: PropTypes.bool,
  size: PropTypes.oneOf(["xs", "sm", "md", "lg"]),
  onClick: PropTypes.func,
  clickable: PropTypes.bool,
};

export default CourseRating;
