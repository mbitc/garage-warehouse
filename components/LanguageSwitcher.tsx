'use client';

import { useTranslation } from '@/context/LanguageContext';

export function LanguageSwitcher() {
  const { lang, setLang } = useTranslation();

  return (
    <div className="flex bg-gray-900 border border-gray-800 rounded p-1 text-xs">
      <button
        type="button"
        onClick={() => setLang('lt')}
        className={`px-2.5 py-1 rounded transition-colors font-bold ${
          lang === 'lt' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
        }`}
      >
        LT
      </button>
      <button
        type="button"
        onClick={() => setLang('en')}
        className={`px-2.5 py-1 rounded transition-colors font-bold ${
          lang === 'en' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
        }`}
      >
        EN
      </button>
    </div>
  );
}
