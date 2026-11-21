import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';

export function RouteErrorBoundary() {
  const error = useRouteError();

  let errorMessage = 'An unexpected error occurred while loading this page.';
  let isChunkError = false;

  if (isRouteErrorResponse(error)) {
    errorMessage = error.statusText || error.data?.message || errorMessage;
  } else if (error instanceof Error) {
    errorMessage = error.message;
    if (
      error.message.includes('Failed to fetch dynamically imported module') ||
      error.message.includes('Importing a module script failed') ||
      error.message.includes('error loading dynamically imported module')
    ) {
      isChunkError = true;
      errorMessage = 'A network interruption prevented this section from loading. Please reload the page.';
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 bg-soft-ivory">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-primary-dark-teal/10 p-8 text-center">
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center text-red-500">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-primary-dark mb-2">
          {isChunkError ? 'Connection Issue' : 'Something went wrong'}
        </h2>
        <p className="text-sm text-primary-dark/70 mb-6 leading-relaxed">
          {errorMessage}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm text-white bg-gradient-to-r from-primary-dark via-primary-dark-teal to-secondary-teal shadow-md hover:shadow-lg transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            Reload Page
          </button>
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm text-primary-dark bg-soft-ivory hover:bg-primary-dark-teal/5 border border-primary-dark-teal/10 transition-all"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
