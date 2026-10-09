'use client';

import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useTranslation } from '@/context/LanguageContext';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export default function HomePage() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-6 text-center">
        
        {/* Viršutinė juosta su kalbos jungikliu */}
        <div className="flex justify-end mb-2">
          <LanguageSwitcher />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight">{t.welcomeTitle}</h1>
          <p className="text-sm text-gray-400">{t.welcomeSubtitle}</p>
        </div>

        <Card className="p-6 space-y-4 bg-gray-900/80 border-gray-800">
          <Button onClick={() => router.push('/admin')} className="w-full text-base py-3">
            🛠️ {t.enterAdmin}
          </Button>
          
          <Button variant="secondary" onClick={() => router.push('/scanner')} className="w-full text-base py-3">
            📷 {t.enterScanner}
          </Button>
        </Card>

      </div>
    </div>
  );
}
