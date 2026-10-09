'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useTranslation } from '@/context/LanguageContext';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export default function AdminDashboard() {
  const router = useRouter();
  const { t } = useTranslation();
  const [stats, setStats] = useState({ products: 0, locations: 0, stockItems: 0 });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [pRes, lRes, sRes] = await Promise.all([
        fetch('/api/products').then(r => r.ok ? r.json() : []).catch(() => []),
        fetch('/api/locations').then(r => r.ok ? r.json() : []).catch(() => []),
        fetch('/api/stock').then(r => r.ok ? r.json() : []).catch(() => []),
      ]);
      
      setStats({
        products: Array.isArray(pRes) ? pRes.length : 0,
        locations: Array.isArray(lRes) ? lRes.length : 0,
        stockItems: Array.isArray(sRes) ? sRes.length : 0,
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
            <h1 className="text-3xl font-bold tracking-tight">{t.dashboardTitle}</h1>
            <p className="text-sm text-gray-400">{t.dashboardSubtitle}</p>
          </div>
          <div className="flex items-center space-x-3">
            <LanguageSwitcher />
            <Button variant="secondary" onClick={() => router.push('/')}>
              {t.logout}
            </Button>
          </div>
        </div>

        {/* Statistikos kortelės */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <h3 className="text-xs uppercase text-gray-400 font-semibold mb-1">{t.statLocationsTitle}</h3>
            <p className="text-3xl font-extrabold text-green-400">{stats.locations}</p>
            <p className="text-xs text-gray-500 mt-2">{t.statLocationsSub}</p>
          </Card>

          <Card>
            <h3 className="text-xs uppercase text-gray-400 font-semibold mb-1">{t.statProductsTitle}</h3>
            <p className="text-3xl font-extrabold text-blue-400">{stats.products}</p>
            <p className="text-xs text-gray-500 mt-2">{t.statProductsSub}</p>
          </Card>

          <Card>
            <h3 className="text-xs uppercase text-gray-400 font-semibold mb-1">{t.statStockTitle}</h3>
            <p className="text-3xl font-extrabold text-amber-400">{stats.stockItems}</p>
            <p className="text-xs text-gray-500 mt-2">{t.statStockSub}</p>
          </Card>
        </div>

        {/* Valdymo moduliai */}
        <h2 className="text-lg font-semibold pt-4">{t.managementModules}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <Card className="flex flex-col justify-between space-y-4">
            <div>
              <h3 className="text-lg font-bold text-white mb-1">{t.locationsCardTitle}</h3>
              <p className="text-sm text-gray-400">{t.locationsCardDesc}</p>
            </div>
            <Button onClick={() => router.push('/admin/locations')} className="w-fit">
              {t.manageLocationsBtn}
            </Button>
          </Card>

          <Card className="flex flex-col justify-between space-y-4">
            <div>
              <h3 className="text-lg font-bold text-white mb-1">{t.productsCardTitle}</h3>
              <p className="text-sm text-gray-400">{t.productsCardDesc}</p>
            </div>
            <Button variant="secondary" onClick={() => router.push('/admin/products')} className="w-fit">
              {t.manageProductsBtn}
            </Button>
          </Card>

        </div>

      </div>
    </div>
  );
}
