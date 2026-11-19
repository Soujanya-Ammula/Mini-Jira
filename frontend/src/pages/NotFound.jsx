import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-slate-900 px-4 text-center bg-mesh-light relative overflow-hidden">
      <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl pointer-events-none"></div>
      <h1 className="text-9xl font-black text-slate-200 select-none tracking-widest">404</h1>
      <h2 className="text-3xl font-extrabold text-slate-900 mt-2">Page Not Found</h2>
      <p className="text-slate-500 mt-2 max-w-sm leading-relaxed">
        The link you followed might be broken, or the page may have been moved or removed.
      </p>
      <Link
        to="/"
        className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-md shadow-blue-500/20 transition cursor-pointer"
      >
        Go Back Home
      </Link>
    </div>
  );
}
