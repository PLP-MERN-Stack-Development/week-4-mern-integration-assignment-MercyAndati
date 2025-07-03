const ErrorDisplay = ({ error, onRetry }) => {
  return (
    <div className="text-center py-8">
      <div className="text-red-500 mb-4">{error}</div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorDisplay;