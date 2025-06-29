import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from './assets/react.svg'; // Replace with your logo if available

const features = [
  'Draw custom-shaped rooms in 2D',
  'Add, resize, and move furniture with real dimensions',
  'Export 2D/3D snapshots',
  'Share projects with a public link',
  'Subscription billing for pros',
];

const screenshots = [
  // Replace with real screenshots or GIFs
  '/screenshot-2d.png',
  '/screenshot-3d.png',
];

const LandingPage: React.FC = () => {
  const [dark, setDark] = useState(false);
  const navigate = useNavigate();
  return (
    <div className={dark ? 'bg-gray-900 text-white min-h-screen' : 'bg-gray-50 text-gray-900 min-h-screen'}>
      <header className="flex items-center justify-between px-8 py-6 shadow bg-white dark:bg-gray-900">
        <div className="flex items-center gap-2">
          <img src={logo} alt="Easy Furnish Logo" className="h-8 w-8" />
          <span className="text-2xl font-bold tracking-tight">Easy Furnish</span>
        </div>
        <div className="flex gap-4 items-center">
          <button className="text-blue-600 dark:text-blue-400 hover:underline" onClick={() => navigate('/auth')}>Log In</button>
          <button className="text-blue-600 dark:text-blue-400 hover:underline" onClick={() => navigate('/pricing')}>Pricing</button>
          <button
            className="ml-4 px-4 py-2 rounded bg-blue-500 text-white font-semibold hover:bg-blue-600 shadow"
            onClick={() => navigate('/dashboard')}
          >
            Try the Editor
          </button>
          <button
            className="ml-4 px-2 py-1 rounded border border-gray-300 dark:border-gray-700 text-xs"
            onClick={() => setDark(d => !d)}
            title="Toggle theme"
          >
            {dark ? '🌙' : '☀️'}
          </button>
        </div>
      </header>
      <main className="flex flex-col items-center py-16 px-4">
        <section className="max-w-2xl text-center mb-12">
          <h1 className="text-4xl font-extrabold mb-4">Plan. Share. Sell.</h1>
          <p className="text-xl mb-6">Easy Furnish makes showroom and interior design fast, visual, and collaborative. Draw, furnish, and share your space in minutes.</p>
          <button
            className="px-8 py-3 rounded bg-blue-500 text-white font-bold text-lg hover:bg-blue-600 shadow"
            onClick={() => navigate('/dashboard')}
          >
            Try the Editor
          </button>
        </section>
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Key Features</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
            {features.map(f => (
              <li key={f} className="bg-white dark:bg-gray-800 rounded shadow p-4 flex items-center gap-2">
                <span className="text-blue-500 dark:text-blue-300">✔</span> {f}
              </li>
            ))}
          </ul>
        </section>
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">See it in Action</h2>
          <div className="flex gap-6 justify-center">
            {screenshots.map((src, i) => (
              <div key={i} className="rounded shadow bg-white dark:bg-gray-800 p-2">
                <img src={src} alt="Screenshot" className="h-48 w-auto object-contain" />
              </div>
            ))}
          </div>
        </section>
      </main>
      <footer className="text-center py-6 text-gray-400 text-sm">
        &copy; {new Date().getFullYear()} Easy Furnish. All rights reserved.
      </footer>
    </div>
  );
};

export default LandingPage; 