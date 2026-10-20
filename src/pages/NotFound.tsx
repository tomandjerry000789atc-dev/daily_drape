import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <p className="font-serif-display text-7xl font-bold text-primary">404</p>
      <h1 className="mt-4 font-serif-display text-2xl font-semibold text-ink">Page not found</h1>
      <p className="mt-2 text-sm text-muted">
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <Link to="/" className="mt-7 rounded-full bg-primary px-7 py-3 text-sm font-semibold text-white">
        Back to Home
      </Link>
    </div>
  );
}
