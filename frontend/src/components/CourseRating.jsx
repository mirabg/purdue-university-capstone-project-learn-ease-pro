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
      className={`flex flex-wrap items-center ${sizeConfig.gap} ${
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
      <div className="flex items-center mr-2 flex-shrink-0">
        {/* Full Stars */}
        {[...Array(fullStars)].map((_, i) => (
          <img
            key={`full-${i}`}
            src="/icons/star-filled.svg"
            alt=""
            className={sizeConfig.star}
          />
        ))}
        {/* Half Star */}
        {hasHalfStar && (
          <img
            src="/icons/star-half-filled.svg"
            alt=""
            className={sizeConfig.star}
          />
        )}

        {/* Empty Stars */}
        {[...Array(emptyStars)].map((_, i) => (
          <img
            key={`empty-${i}`}
            src="/icons/star-empty.svg"
            alt=""
            className={sizeConfig.star}
          />
        ))}
      </div>

      {showCount && (
        <span
          className={`${sizeConfig.text} font-medium ${
            isInteractive
              ? "text-primary-600 hover:text-primary-700 hover:underline"
              : "text-gray-600"
          }`}
        >
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
