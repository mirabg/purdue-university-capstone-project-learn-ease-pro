import Icon from "./Icon";

/**
 * ErrorAlert Component
 * Displays error messages with appropriate styling and optional dismiss button
 *
 * @param {Object} props
 * @param {Object|string} props.error - Error object from RTK Query or custom error message
 * @param {Function} props.onDismiss - Optional callback when error is dismissed
 * @param {string} props.defaultMessage - Default message if error is not specific
 * @param {string} props.className - Additional CSS classes
 */
function ErrorAlert({
  error,
  onDismiss,
  defaultMessage = "An error occurred",
  className = "",
}) {
  if (!error) return null;

  // Extract error message from different error formats
  const getErrorMessage = (err) => {
    // RTK Query error with connection issue
    if (err.status === "FETCH_ERROR" || err.originalStatus === "FETCH_ERROR") {
      return "Unable to connect to the server. Please check your internet connection or try again later.";
    }

    // 500 Internal Server Error
    if (err.status === 500 || err.originalStatus === 500) {
      return "The server encountered an error. Please try again later or contact support if the issue persists.";
    }

    // 503 Service Unavailable
    if (err.status === 503 || err.originalStatus === 503) {
      return "The service is temporarily unavailable. Please try again in a few moments.";
    }

    // 401 Unauthorized (should be handled by auth flow, but just in case)
    if (err.status === 401 || err.originalStatus === 401) {
      return "Your session has expired. Please log in again.";
    }

    // 403 Forbidden
    if (err.status === 403 || err.originalStatus === 403) {
      return "You don't have permission to perform this action.";
    }

    // 404 Not Found
    if (err.status === 404 || err.originalStatus === 404) {
      return err.data?.message || "The requested resource was not found.";
    }

    // Network/Connection error
    if (err.error && typeof err.error === "string") {
      if (
        err.error.includes("Failed to fetch") ||
        err.error.includes("NetworkError")
      ) {
        return "Unable to connect to the server. Please check your internet connection or try again later.";
      }
    }

    // Try to extract message from various error formats
    if (typeof err === "string") {
      return err;
    }

    return (
      err.data?.message ||
      err.data?.error ||
      err.message ||
      err.error ||
      defaultMessage
    );
  };

  const errorMessage = getErrorMessage(error);

  return (
    <div
      className={`bg-red-50 border border-red-200 rounded-md p-4 ${className}`}
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon name="error" className="h-5 w-5 text-red-400" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">Error</h3>
          <p className="mt-1 text-sm text-red-700">{errorMessage}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-auto flex-shrink-0 text-red-400 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded"
            aria-label="Dismiss"
          >
            <Icon name="close" className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}

export default ErrorAlert;
