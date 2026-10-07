'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Prisijungimo klaida');
        return;
      }

      if (data.user.role === 'admin') {
        router.push('/admin');
      } else if (data.user.role === 'operator') {
        router.push('/operator');
      } else {
        router.push('/mobile');
      }
    } catch (err) {
      setError('Klaida jungiantis prie serverio.');
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-900 text-white p-4">
      <div className="w-full max-w-md bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700">
        <h1 className="text-2xl font-bold mb-2 text-center">Garažas-Sandėlis</h1>
        <p className="text-sm text-gray-400 mb-6 text-center">Įveskite duomenis sistemos valdymui</p>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500 text-red-200 rounded text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Vartotojas</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded focus:outline-none focus:border-blue-500 text-white"
              placeholder="pvz. admin, operator, guest"
              required
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Slaptažodis</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded focus:outline-none focus:border-blue-500 text-white"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 transition-colors font-medium rounded shadow"
          >
            Prisijungti
          </button>
        </form>

        <div className="mt-6 text-xs text-gray-500 text-center space-y-1">
          <p>Testiniai prisijungimai:</p>
          <p><span className="text-gray-300">Admin:</span> admin / admin123</p>
          <p><span className="text-gray-300">Operatorius:</span> operator / oper123</p>
          <p><span className="text-gray-300">Svečias:</span> guest / guest123</p>
        </div>
      </div>
    </main>
  );
}
