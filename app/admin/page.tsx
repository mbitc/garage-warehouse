'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({ products: 0, locations: 0, stockItems: 0 });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [pRes, lRes, sRes] = await Promise.all([
        fetch('/api/products').then(r => r.json()),
        fetch('/api/locations').then(r => r.json()),
        fetch('/api/stock').then(r => r.json()),
      ]);
      setStats({
        products: pRes.length || 0,
        locations: lRes.length || 0,
        stockItems: sRes.length || 0,
      });
    } catch (err) {
      console.error('Klaida kraunant statistiką', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Viršutinė juosta */}
        <div className="flex justify-between items-center border-b border-gray-800 pb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Administratoriaus Pultas</h1>
            <p className="text-sm text-gray-400">Sandėlio infrastruktūros ir resursų valdymo centras</p>
          </div>
          <Button variant="secondary" onClick={() => router.push('/')}>
            Atsijungti
          </Button>
        </div>

        {/* Statistikos kortelės */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <h3 className="text-xs uppercase text-gray-400 font-semibold mb-1">Sandėlio Vietos</h3>
            <p className="text-3xl font-extrabold text-green-400">{stats.locations}</p>
            <p className="text-xs text-gray-500 mt-2">Grindų sektoriai / Stelažai</p>
          </Card>

          <Card>
            <h3 className="text-xs uppercase text-gray-400 font-semibold mb-1">Prekių Katalogas</h3>
            <p className="text-3xl font-extrabold text-blue-400">{stats.products}</p>
            <p className="text-xs text-gray-500 mt-2">Unikalūs SKU vienetai</p>
          </Card>

          <Card>
            <h3 className="text-xs uppercase text-gray-400 font-semibold mb-1">Aktyvūs Likučiai</h3>
            <p className="text-3xl font-extrabold text-amber-400">{stats.stockItems}</p>
            <p className="text-xs text-gray-500 mt-2">Pozicijos sandėlyje</p>
          </Card>
        </div>

        {/* Greitojo valdymo navigacija */}
        <h2 className="text-lg font-semibold pt-4">Valdymo Moduliai</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="flex flex-col justify-between space-y-4">
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Sandėlio Erdvė (Lokacijos)</h3>
              <p className="text-sm text-gray-400">
                Aprašykite naujus grindų sektorius (`S1-01`), tranzito zonas ar būsimus stelažus. Pradinio zonavimo valdymas.
              </p>
            </div>
            <Button onClick={() => router.push('/admin/locations')} className="w-fit">
              Valdyti Lokacijas &rarr;
            </Button>
          </Card>

          <Card className="flex flex-col justify-between space-y-4">
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Prekių Katalogas</h3>
              <p className="text-sm text-gray-400">
                Peržiūrėkite prekes, SKU kodus, matmenis milimetrais (tūrio varikliukui) ir pridėkite naujas pozicijas.
              </p>
            </div>
            <Button variant="secondary" onClick={() => router.push('/admin/products')} className="w-fit">
              Valdyti Prekes &rarr;
            </Button>
          </Card>
        </div>

      </div>
    </div>
  );
}
